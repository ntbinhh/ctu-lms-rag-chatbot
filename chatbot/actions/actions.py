from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
from datetime import datetime, timedelta
import json
import os
import sys

# Load environment variables manually
def load_env_file():
    """Load .env file manually since Rasa might not do it automatically"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    print(f"🔧 DEBUG: Looking for .env at: {env_path}")
    
    if os.path.exists(env_path):
        print("📁 Loading .env file...")
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
                    print(f"🔧 Set env: {key.strip()} = {value.strip()}")
    else:
        print(f"❌ .env file not found at {env_path}")

# Load environment variables
load_env_file()

# Import RAG bridge system
try:
    # Debug environment variables
    print(f"🔧 DEBUG: RAG_SERVER_URL = {os.getenv('RAG_SERVER_URL', 'NOT_SET')}")
    print(f"🔧 DEBUG: Current working directory = {os.getcwd()}")
    
    from rag_bridge import RAGBridge
    RAG_AVAILABLE = True
    rag_bridge = RAGBridge()
    print("✅ RAG Bridge initialized successfully")
except ImportError as e:
    print(f"⚠️ RAG Bridge not available: {e}")
    RAG_AVAILABLE = False
    rag_bridge = None
except Exception as e:
    print(f"❌ RAG Bridge initialization error: {e}")
    RAG_AVAILABLE = False
    rag_bridge = None

# Cache để lưu thông tin phòng
room_cache = {}

def fetch_room_info(room_id):
    """Fetch thông tin phòng từ API và cache lại"""
    if not room_id:
        return None
    
    # Kiểm tra cache trước
    if room_id in room_cache:
        return room_cache[room_id]
    
    try:
        # Thử endpoint public trước
        response = requests.get(f"http://localhost:8000/manager/rooms/public/{room_id}", timeout=5)
        if response.status_code == 200:
            room_data = response.json()
            room_cache[room_id] = room_data
            return room_data
    except Exception as e:
        print(f"Lỗi khi fetch thông tin phòng {room_id}: {e}")
    
    # Cache thông tin cơ bản nếu không fetch được
    fallback_info = {"room_number": str(room_id), "building": None}
    room_cache[room_id] = fallback_info
    return fallback_info

def format_room_display(room_info):
    """Format hiển thị thông tin phòng"""
    if not room_info:
        return None
    
    if room_info.get("building") and room_info.get("room_number"):
        return f"{room_info['building']}/{room_info['room_number']}"
    elif room_info.get("room_number"):
        return f"P.{room_info['room_number']}"
    
    return None

class ActionSubmitProgram(Action):

    def name(self) -> Text:
        return "action_submit_program"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        year = tracker.get_slot("year")
        faculty = tracker.get_slot("faculty")
        major = tracker.get_slot("major")

        # B1: Tìm faculty_id từ API năm học
        faculty_resp = requests.get(f"http://localhost:8000/programs/years/{year}/faculties")
        faculty_data = faculty_resp.json()
        faculty_id = next((f["id"] for f in faculty_data if f["name"] == faculty), None)

        if not faculty_id:
            dispatcher.utter_message(text="Không tìm thấy khoa.")
            return []

        # B2: Tìm major_id
        major_resp = requests.get(f"http://localhost:8000/programs/years/{year}/faculties/{faculty_id}/majors")
        major_data = major_resp.json()
        major_id = next((m["id"] for m in major_data if m["name"] == major), None)

        if not major_id:
            dispatcher.utter_message(text="Không tìm thấy ngành.")
            return []

        # B3: Lấy chương trình đào tạo
        program_resp = requests.get(
            f"http://localhost:8000/programs/by_major?khoa={year}&major_id={major_id}"
        )

        if program_resp.status_code != 200:
            dispatcher.utter_message(text="Không tìm thấy chương trình đào tạo.")
            return []

        data = program_resp.json()
        courses = data.get("courses", [])
        course_text = "\n".join([f"{c['code']} - {c['name']} ({c['credit']} tín chỉ)" for c in courses])

        dispatcher.utter_message(text=f"Chương trình đào tạo:\n{course_text}")
        return [SlotSet("program_info", course_text)]


class ActionGetStudentProgram(Action):
    
    def name(self) -> Text:
        return "action_get_student_program"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Lấy token từ metadata hoặc slot
        latest_message = tracker.latest_message
        metadata = latest_message.get('metadata', {}) if latest_message else {}
        token = metadata.get('auth_token') or tracker.get_slot("auth_token")
        
        if not token:
            dispatcher.utter_message(text="🔐 Để xem chương trình đào tạo, bạn cần đăng nhập vào hệ thống trước. Vui lòng đăng nhập qua website.")
            return []
        
        try:
            headers = {"Authorization": f"Bearer {token}"}
            
            # B1: Lấy thông tin sinh viên
            student_resp = requests.get("http://localhost:8000/admin/student/profile", headers=headers)
            
            if student_resp.status_code == 403:
                dispatcher.utter_message(text="🚫 Bạn không có quyền truy cập thông tin sinh viên.")
                return []
            elif student_resp.status_code == 404:
                dispatcher.utter_message(text="❌ Không tìm thấy thông tin sinh viên.")
                return []
            elif student_resp.status_code != 200:
                dispatcher.utter_message(text="⚠️ Không thể tải thông tin sinh viên. Vui lòng thử lại sau.")
                return []
            
            student_data = student_resp.json()
            class_name = student_data.get('class_name', 'Chưa phân lớp')
            student_name = student_data.get('name', 'Sinh viên')
            student_code = student_data.get('student_code', '')
            
            # B2: Lấy thông tin lớp để tìm chương trình đào tạo
            if not student_data.get('class_id'):
                dispatcher.utter_message(text="📚 Bạn chưa được phân lớp nên chưa có chương trình đào tạo cụ thể.")
                return []
            
            # B3: Tìm chương trình đào tạo dựa trên class_id (thông qua major)
            class_resp = requests.get(f"http://localhost:8000/admin/classes/{student_data['class_id']}")
            
            if class_resp.status_code != 200:
                dispatcher.utter_message(text="⚠️ Không thể tải thông tin lớp học.")
                return []
            
            class_data = class_resp.json()
            major_id = class_data.get('major_id')
            
            if not major_id:
                dispatcher.utter_message(text="📚 Lớp học chưa được liên kết với ngành đào tạo.")
                return []
            
            # B4: Lấy chương trình đào tạo theo major_id và khóa học
            khoa = class_data.get('khoa', datetime.now().year)  # Lấy khóa từ class hoặc dùng năm hiện tại
            
            program_resp = requests.get(f"http://localhost:8000/programs/by_major?khoa={khoa}&major_id={major_id}")
            
            if program_resp.status_code != 200:
                dispatcher.utter_message(text="📚 Không tìm thấy chương trình đào tạo cho ngành của bạn.")
                return []
            
            program_data = program_resp.json()
            courses = program_data.get("courses", [])
            
            if not courses:
                dispatcher.utter_message(text="📚 Chương trình đào tạo chưa có môn học nào được cập nhật.")
                return []
            
            # B5: Định dạng thông tin chương trình đào tạo
            message = f"📚 **Chương trình đào tạo của {student_name}**\n"
            message += f"👤 Mã SV: {student_code}\n"
            message += f"🎓 Lớp: {class_name}\n"
            message += f"📅 Khóa: {khoa}\n\n"
            
            # Nhóm các môn học theo học kỳ nếu có thông tin
            semesters = {}
            for course in courses:
                semester = course.get('semester', 'Chưa phân học kỳ')
                if semester not in semesters:
                    semesters[semester] = []
                semesters[semester].append(course)
            
            if len(semesters) > 1:
                # Hiển thị theo học kỳ
                for semester in sorted(semesters.keys()):
                    message += f"**📖 {semester}:**\n"
                    semester_courses = semesters[semester]
                    for course in semester_courses[:5]:  # Giới hạn 5 môn mỗi học kỳ để không quá dài
                        message += f"• {course.get('code', 'N/A')} - {course.get('name', 'Không rõ tên')}"
                        if course.get('credit'):
                            message += f" ({course['credit']} TC)"
                        message += "\n"
                    
                    if len(semester_courses) > 5:
                        message += f"  ... và {len(semester_courses) - 5} môn khác\n"
                    message += "\n"
            else:
                # Hiển thị danh sách đơn giản
                message += "**📖 Danh sách môn học:**\n"
                for i, course in enumerate(courses[:10]):  # Giới hạn 10 môn để không quá dài
                    message += f"{i+1}. {course.get('code', 'N/A')} - {course.get('name', 'Không rõ tên')}"
                    if course.get('credit'):
                        message += f" ({course['credit']} TC)"
                    message += "\n"
                
                if len(courses) > 10:
                    message += f"\n... và {len(courses) - 10} môn khác"
            
            message += f"\n📊 **Tổng số môn học:** {len(courses)} môn"
            
            # Tính tổng tín chỉ nếu có
            total_credits = sum(course.get('credit', 0) for course in courses if course.get('credit'))
            if total_credits > 0:
                message += f"\n🎯 **Tổng tín chỉ:** {total_credits} TC"
            
            message += "\n\n💡 *Để xem chi tiết đầy đủ, hãy truy cập trang Chương trình đào tạo trên website.*"
            
            dispatcher.utter_message(text=message)
            return []
            
        except Exception as e:
            print(f"Error in ActionGetStudentProgram: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi lấy chương trình đào tạo. Vui lòng thử lại sau.")
            return []


class ActionGetTodaySchedule(Action):
    
    def name(self) -> Text:
        return "action_get_today_schedule"
    
    def get_current_semester_info(self):
        """Lấy thông tin học kỳ và năm học hiện tại"""
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Xác định học kỳ dựa trên tháng hiện tại
        if current_month >= 9 or current_month <= 1:
            # Tháng 9-12 và tháng 1: HK1
            current_semester = "HK1"
            if current_month >= 9:
                academic_year = current_year
            else:
                academic_year = current_year - 1
        elif current_month >= 2 and current_month <= 6:
            # Tháng 2-6: HK2
            current_semester = "HK2"
            academic_year = current_year - 1
        else:
            # Tháng 7-8: HK3 (học hè)
            current_semester = "HK3"
            academic_year = current_year - 1
            
        return current_semester, academic_year
    
    def get_today_vietnamese(self):
        """Lấy tên thứ tiếng Việt của hôm nay"""
        today = datetime.now()
        day_index = today.weekday()  # 0 = Monday, 6 = Sunday
        day_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"]
        return day_names[day_index]
    
    def get_current_week(self, hoc_ky, nam_hoc):
        """Lấy tuần học hiện tại"""
        try:
            response = requests.get(
                "http://localhost:8000/weeks/",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc}
            )
            if response.status_code == 200:
                weeks = response.json()
                today = datetime.now().date()
                
                for week in weeks:
                    start_date = datetime.strptime(week["start_date"], "%Y-%m-%d").date()
                    end_date = datetime.strptime(week["end_date"], "%Y-%m-%d").date()
                    
                    if start_date <= today <= end_date:
                        return week["week"]
                        
            return None
        except Exception as e:
            print(f"Error getting current week: {e}")
            return None
    
    def format_schedule_message(self, schedule_items):
        """Định dạng tin nhắn lịch học"""
        if not schedule_items:
            return "Hôm nay bạn không có lịch học nào. Có thể nghỉ ngơi hoặc ôn bài nhé! 😊"
        
        # Sắp xếp theo ca học
        period_order = {"Sáng": 1, "Chiều": 2, "Tối": 3}
        sorted_items = sorted(schedule_items, key=lambda x: period_order.get(x.get("period", ""), 99))
        
        message = f"📅 Lịch học hôm nay ({self.get_today_vietnamese()}):\n\n"
        
        for item in sorted_items:
            subject_name = item.get("subject_name") or (item.get("subject", {}).get("name") if item.get("subject") else None) or item.get("subject_id", "Không rõ môn")
            teacher_name = (item.get("teacher_profile", {}).get("name") if item.get("teacher_profile") else None) or item.get("teacher_name", "Không rõ GV")
            period = item.get("period", "Không rõ ca")
            room_info = self.get_room_info(item)
            format_info = "🏫 Trực tiếp" if item.get("hinh_thuc") == "truc_tiep" else "💻 Trực tuyến"
            
            message += f"🕐 **{period}**\n"
            message += f"📚 {subject_name}\n"
            message += f"👨‍🏫 GV: {teacher_name}\n"
            if room_info:
                message += f"🏠 {room_info}\n"
            message += f"{format_info}\n\n"
        
        return message.strip()
    
    def get_room_info(self, item):
        """Lấy thông tin phòng học"""
        # Thử lấy từ classroom object trước (từ API đã join)
        if item.get("classroom"):
            room = item["classroom"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Fallback: Thử lấy từ room object (backward compatibility)
        if item.get("room"):
            room = item["room"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Nếu có room_id, fetch thông tin từ API
        if item.get("room_id"):
            room_info = fetch_room_info(item["room_id"])
            formatted = format_room_display(room_info)
            if formatted:
                return formatted
            # Fallback cuối cùng
            return f"P.{item['room_id']}"
        
        return None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Lấy token từ metadata hoặc slot
        latest_message = tracker.latest_message
        metadata = latest_message.get('metadata', {}) if latest_message else {}
        token = metadata.get('auth_token') or tracker.get_slot("auth_token")
        
        if not token:
            dispatcher.utter_message(text="🔐 Để xem lịch học, bạn cần đăng nhập vào hệ thống trước. Vui lòng đăng nhập qua website hoặc app.")
            return []
        
        try:
            # Lấy thông tin học kỳ hiện tại
            hoc_ky, nam_hoc = self.get_current_semester_info()
            current_week = self.get_current_week(hoc_ky, nam_hoc)
            
            if not current_week:
                dispatcher.utter_message(text="⚠️ Không thể xác định tuần học hiện tại. Có thể đang trong kỳ nghỉ.")
                return []
            
            # Gọi API lấy lịch học sinh viên
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(
                "http://localhost:8000/student/schedules",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc},
                headers=headers
            )
            
            if response.status_code == 403:
                dispatcher.utter_message(text="🚫 Bạn không có quyền truy cập lịch học sinh viên.")
                return []
            elif response.status_code == 404:
                dispatcher.utter_message(text="❌ Không tìm thấy thông tin sinh viên hoặc chưa được phân lớp.")
                return []
            elif response.status_code != 200:
                dispatcher.utter_message(text="⚠️ Không thể tải lịch học. Vui lòng thử lại sau.")
                return []
            
            schedule_data = response.json()
            
            # Lọc lịch học hôm nay
            today_vietnamese = self.get_today_vietnamese()
            today_schedule = [
                item for item in schedule_data 
                if item.get("day") == today_vietnamese and item.get("week") == current_week
            ]
            
            # Tạo tin nhắn trả về
            message = self.format_schedule_message(today_schedule)
            dispatcher.utter_message(text=message)
            
            return []
            
        except Exception as e:
            print(f"Error in ActionGetTodaySchedule: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi lấy lịch học. Vui lòng thử lại sau.")
            return []


class ActionGetScheduleWeek(Action):
    
    def name(self) -> Text:
        return "action_get_schedule_week"
    
    def get_current_semester_info(self):
        """Lấy thông tin học kỳ và năm học hiện tại"""
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Xác định học kỳ dựa trên tháng hiện tại
        if current_month >= 9 or current_month <= 1:
            # Tháng 9-12 và tháng 1: HK1
            current_semester = "HK1"
            if current_month >= 9:
                academic_year = current_year
            else:
                academic_year = current_year - 1
        elif current_month >= 2 and current_month <= 6:
            # Tháng 2-6: HK2
            current_semester = "HK2"
            academic_year = current_year - 1
        else:
            # Tháng 7-8: HK3 (học hè)
            current_semester = "HK3"
            academic_year = current_year - 1
            
        return current_semester, academic_year
    
    def get_current_week(self, hoc_ky, nam_hoc):
        """Lấy tuần học hiện tại"""
        try:
            response = requests.get(
                "http://localhost:8000/weeks/",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc}
            )
            if response.status_code == 200:
                weeks = response.json()
                today = datetime.now().date()
                
                for week in weeks:
                    start_date = datetime.strptime(week["start_date"], "%Y-%m-%d").date()
                    end_date = datetime.strptime(week["end_date"], "%Y-%m-%d").date()
                    
                    if start_date <= today <= end_date:
                        return week["week"], start_date, end_date
                        
            return None, None, None
        except Exception as e:
            print(f"Error getting current week: {e}")
            return None, None, None
    
    def get_vietnamese_day_name(self, date):
        """Chuyển đổi ngày thành tên thứ tiếng Việt"""
        day_index = date.weekday()  # 0 = Monday, 6 = Sunday
        day_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"]
        return day_names[day_index]
    
    def format_week_schedule_message(self, schedule_items, current_week, start_date, end_date):
        """Định dạng tin nhắn lịch học tuần"""
        if not schedule_items:
            return f"📅 Tuần {current_week} ({start_date.strftime('%d/%m')} - {end_date.strftime('%d/%m/%Y')}) bạn không có lịch học nào. Thời gian nghỉ ngơi! 😊"
        
        # Nhóm lịch học theo ngày
        days_schedule = {}
        for item in schedule_items:
            day = item.get("day")
            if day not in days_schedule:
                days_schedule[day] = []
            days_schedule[day].append(item)
        
        # Sắp xếp theo thứ tự ngày trong tuần
        day_order = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"]
        
        message = f"📅 **Lịch học tuần {current_week}** ({start_date.strftime('%d/%m')} - {end_date.strftime('%d/%m/%Y')})\n\n"
        
        for day in day_order:
            if day in days_schedule:
                # Sắp xếp các tiết học trong ngày theo ca
                period_order = {"Sáng": 1, "Chiều": 2, "Tối": 3}
                day_classes = sorted(days_schedule[day], key=lambda x: period_order.get(x.get("period", ""), 99))
                
                message += f"🗓️ **{day}**\n"
                
                for item in day_classes:
                    subject_name = item.get("subject_name") or (item.get("subject", {}).get("name") if item.get("subject") else None) or item.get("subject_id", "Không rõ môn")
                    teacher_name = (item.get("teacher_profile", {}).get("name") if item.get("teacher_profile") else None) or item.get("teacher_name", "Không rõ GV")
                    period = item.get("period", "Không rõ ca")
                    room_info = self.get_room_info(item)
                    format_info = "🏫" if item.get("hinh_thuc") == "truc_tiep" else "💻"
                    
                    message += f"  • {period}: {subject_name}"
                    if room_info:
                        message += f" - {room_info}"
                    message += f" {format_info}\n"
                    message += f"    👨‍🏫 {teacher_name}\n"
                
                message += "\n"
        
        # Thêm thông tin tổng quan
        total_classes = len(schedule_items)
        message += f"📊 **Tổng cộng:** {total_classes} tiết học trong tuần\n"
        message += "💡 *Để xem chi tiết từng tiết, hãy hỏi lịch học theo ngày cụ thể.*"
        
        return message
    
    def get_room_info(self, item):
        """Lấy thông tin phòng học"""
        # Thử lấy từ classroom object trước (từ API đã join)
        if item.get("classroom"):
            room = item["classroom"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Fallback: Thử lấy từ room object (backward compatibility)
        if item.get("room"):
            room = item["room"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("name"):
                return f"P.{room['name']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Nếu có room_id, fetch thông tin từ API
        if item.get("room_id"):
            room_info = fetch_room_info(item["room_id"])
            formatted = format_room_display(room_info)
            if formatted:
                return formatted
            # Fallback cuối cùng
            return f"P.{item['room_id']}"
        
        return None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Lấy token từ metadata hoặc slot
        latest_message = tracker.latest_message
        metadata = latest_message.get('metadata', {}) if latest_message else {}
        token = metadata.get('auth_token') or tracker.get_slot("auth_token")
        
        if not token:
            dispatcher.utter_message(text="� Để xem lịch học, bạn cần đăng nhập vào hệ thống trước. Vui lòng đăng nhập qua website hoặc app.")
            return []
        
        try:
            # Lấy thông tin học kỳ hiện tại
            hoc_ky, nam_hoc = self.get_current_semester_info()
            current_week, start_date, end_date = self.get_current_week(hoc_ky, nam_hoc)
            
            if not current_week:
                dispatcher.utter_message(text="⚠️ Không thể xác định tuần học hiện tại. Có thể đang trong kỳ nghỉ.")
                return []
            
            # Gọi API lấy lịch học sinh viên
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(
                "http://localhost:8000/student/schedules",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc},
                headers=headers
            )
            
            if response.status_code == 403:
                dispatcher.utter_message(text="🚫 Bạn không có quyền truy cập lịch học sinh viên.")
                return []
            elif response.status_code == 404:
                dispatcher.utter_message(text="❌ Không tìm thấy thông tin sinh viên hoặc chưa được phân lớp.")
                return []
            elif response.status_code != 200:
                dispatcher.utter_message(text="⚠️ Không thể tải lịch học. Vui lòng thử lại sau.")
                return []
            
            schedule_data = response.json()
            
            # Lọc lịch học tuần hiện tại
            week_schedule = [
                item for item in schedule_data 
                if item.get("week") == current_week
            ]
            
            # Tạo tin nhắn trả về
            message = self.format_week_schedule_message(week_schedule, current_week, start_date, end_date)
            dispatcher.utter_message(text=message)
            
            return []
            
        except Exception as e:
            print(f"Error in ActionGetScheduleWeek: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi lấy lịch học tuần. Vui lòng thử lại sau.")
            return []


class ActionGetScheduleTomorrow(Action):
    
    def name(self) -> Text:
        return "action_get_schedule_tomorrow"
    
    def get_current_semester_info(self):
        """Lấy thông tin học kỳ và năm học hiện tại"""
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Xác định học kỳ dựa trên tháng hiện tại
        if current_month >= 9 or current_month <= 1:
            # Tháng 9-12 và tháng 1: HK1
            current_semester = "HK1"
            if current_month >= 9:
                academic_year = current_year
            else:
                academic_year = current_year - 1
        elif current_month >= 2 and current_month <= 6:
            # Tháng 2-6: HK2
            current_semester = "HK2"
            academic_year = current_year - 1
        else:
            # Tháng 7-8: HK3 (học hè)
            current_semester = "HK3"
            academic_year = current_year - 1
            
        return current_semester, academic_year
    
    def get_tomorrow_vietnamese(self):
        """Lấy tên thứ tiếng Việt của ngày mai"""
        tomorrow = datetime.now() + timedelta(days=1)
        day_index = tomorrow.weekday()  # 0 = Monday, 6 = Sunday
        day_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"]
        return day_names[day_index]
    
    def get_week_for_date(self, target_date, hoc_ky, nam_hoc):
        """Lấy tuần học cho ngày cụ thể"""
        try:
            response = requests.get(
                "http://localhost:8000/weeks/",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc}
            )
            if response.status_code == 200:
                weeks = response.json()
                
                for week in weeks:
                    start_date = datetime.strptime(week["start_date"], "%Y-%m-%d").date()
                    end_date = datetime.strptime(week["end_date"], "%Y-%m-%d").date()
                    
                    if start_date <= target_date <= end_date:
                        return week["week"]
                        
            return None
        except Exception as e:
            print(f"Error getting week for date: {e}")
            return None
    
    def format_schedule_message(self, schedule_items, tomorrow_date):
        """Định dạng tin nhắn lịch học ngày mai"""
        if not schedule_items:
            return "Ngày mai bạn không có lịch học nào. Thời gian nghỉ ngơi hoặc tự học! 😊"
        
        # Sắp xếp theo ca học
        period_order = {"Sáng": 1, "Chiều": 2, "Tối": 3}
        sorted_items = sorted(schedule_items, key=lambda x: period_order.get(x.get("period", ""), 99))
        
        tomorrow_str = tomorrow_date.strftime("%d/%m/%Y")
        message = f"📅 Lịch học ngày mai ({self.get_tomorrow_vietnamese()}, {tomorrow_str}):\n\n"
        
        for item in sorted_items:
            subject_name = item.get("subject_name") or (item.get("subject", {}).get("name") if item.get("subject") else None) or item.get("subject_id", "Không rõ môn")
            teacher_name = (item.get("teacher_profile", {}).get("name") if item.get("teacher_profile") else None) or item.get("teacher_name", "Không rõ GV")
            period = item.get("period", "Không rõ ca")
            room_info = self.get_room_info(item)
            format_info = "🏫 Trực tiếp" if item.get("hinh_thuc") == "truc_tiep" else "💻 Trực tuyến"
            
            message += f"🕐 **{period}**\n"
            message += f"📚 {subject_name}\n"
            message += f"👨‍🏫 GV: {teacher_name}\n"
            if room_info:
                message += f"🏠 {room_info}\n"
            message += f"{format_info}\n\n"
        
        return message.strip()
    
    def get_room_info(self, item):
        """Lấy thông tin phòng học"""
        # Thử lấy từ classroom object trước (từ API đã join)
        if item.get("classroom"):
            room = item["classroom"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Fallback: Thử lấy từ room object (backward compatibility)
        if item.get("room"):
            room = item["room"]
            if room.get("building") and room.get("room_number"):
                return f"{room['building']}/{room['room_number']}"
            elif room.get("room_number"):
                return f"P.{room['room_number']}"
        
        # Nếu có room_id, fetch thông tin từ API
        if item.get("room_id"):
            room_info = fetch_room_info(item["room_id"])
            formatted = format_room_display(room_info)
            if formatted:
                return formatted
            # Fallback cuối cùng
            return f"P.{item['room_id']}"
        
        return None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Lấy token từ metadata hoặc slot
        latest_message = tracker.latest_message
        metadata = latest_message.get('metadata', {}) if latest_message else {}
        token = metadata.get('auth_token') or tracker.get_slot("auth_token")
        
        if not token:
            dispatcher.utter_message(text="� Để xem lịch học, bạn cần đăng nhập vào hệ thống trước. Vui lòng đăng nhập qua website hoặc app.")
            return []
        
        try:
            # Lấy thông tin học kỳ hiện tại
            hoc_ky, nam_hoc = self.get_current_semester_info()
            
            # Tính ngày mai
            tomorrow_date = (datetime.now() + timedelta(days=1)).date()
            tomorrow_week = self.get_week_for_date(tomorrow_date, hoc_ky, nam_hoc)
            
            if not tomorrow_week:
                dispatcher.utter_message(text="⚠️ Không thể xác định tuần học cho ngày mai. Có thể ngày mai là ngày nghỉ hoặc ngoài lịch học.")
                return []
            
            # Gọi API lấy lịch học sinh viên
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(
                "http://localhost:8000/student/schedules",
                params={"hoc_ky": hoc_ky, "nam_hoc": nam_hoc},
                headers=headers
            )
            
            if response.status_code == 403:
                dispatcher.utter_message(text="🚫 Bạn không có quyền truy cập lịch học sinh viên.")
                return []
            elif response.status_code == 404:
                dispatcher.utter_message(text="❌ Không tìm thấy thông tin sinh viên hoặc chưa được phân lớp.")
                return []
            elif response.status_code != 200:
                dispatcher.utter_message(text="⚠️ Không thể tải lịch học. Vui lòng thử lại sau.")
                return []
            
            schedule_data = response.json()
            
            # Lọc lịch học ngày mai
            tomorrow_vietnamese = self.get_tomorrow_vietnamese()
            tomorrow_schedule = [
                item for item in schedule_data 
                if item.get("day") == tomorrow_vietnamese and item.get("week") == tomorrow_week
            ]
            
            # Tạo tin nhắn trả về
            message = self.format_schedule_message(tomorrow_schedule, tomorrow_date)
            dispatcher.utter_message(text=message)
            
            return []
            
        except Exception as e:
            print(f"Error in ActionGetScheduleTomorrow: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi lấy lịch học ngày mai. Vui lòng thử lại sau.")
            return []


class ActionGetNextClass(Action):
    
    def name(self) -> Text:
        return "action_get_next_class"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        dispatcher.utter_message(text="⏰ Chức năng xem tiết học tiếp theo đang được phát triển. Hiện tại bạn có thể hỏi lịch học hôm nay.")
        return []


class ActionRAGQuery(Action):
    """Action để xử lý câu hỏi tổng quát bằng RAG system"""
    
    def name(self) -> Text:
        return "action_rag_query"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Lấy tin nhắn của user
            user_message = tracker.latest_message.get('text', '')
            
            if not user_message:
                dispatcher.utter_message(text="❓ Bạn có thể đặt câu hỏi cụ thể không?")
                return []
            
            # Kiểm tra RAG bridge có sẵn không
            if not RAG_AVAILABLE or not rag_bridge:
                # Fallback response khi RAG không sẵn sàng
                fallback_response = self._get_fallback_response(user_message)
                dispatcher.utter_message(text=fallback_response)
                return []
            
            print(f"🔍 Processing RAG query: {user_message}")
            print(f"🔧 DEBUG: RAG_AVAILABLE = {RAG_AVAILABLE}")
            print(f"🔧 DEBUG: rag_bridge = {rag_bridge}")
            print(f"🔧 DEBUG: RAG_SERVER_URL = {os.getenv('RAG_SERVER_URL', 'NOT_SET')}")
            
            # Thực hiện truy vấn RAG qua bridge
            print("🚀 Calling rag_bridge.query()...")
            response = rag_bridge.query(user_message)
            print(f"📤 RAG response received: {response[:100]}...")
            
            # Gửi phản hồi
            dispatcher.utter_message(text=response)
            
            return []
            
        except Exception as e:
            print(f"❌ Error in ActionRAGQuery: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau.")
            return []
    
    def _get_fallback_response(self, user_message: str) -> str:
        """Phản hồi dự phòng khi RAG không khả dụng"""
        message_lower = user_message.lower()
        
        if any(keyword in message_lower for keyword in ['học phí', 'chi phí', 'phí', 'tiền']):
            return ("💰 Về học phí, bạn có thể:\n"
                   "• Liên hệ phòng Đào tạo để được tư vấn chi tiết\n"
                   "• Xem thông tin trên website chính thức của trường\n"
                   "• Gọi hotline hỗ trợ sinh viên")
        
        elif any(keyword in message_lower for keyword in ['chương trình', 'ngành', 'đào tạo', 'môn học']):
            return ("📚 Về chương trình đào tạo:\n"
                   "• Bạn có thể xem chi tiết trên website của trường\n"
                   "• Liên hệ phòng Đào tạo để được tư vấn\n"
                   "• Tôi cũng có thể giúp xem chương trình đào tạo nếu bạn đã đăng nhập")
        
        elif any(keyword in message_lower for keyword in ['quy định', 'quy chế', 'luật', 'điều lệ']):
            return ("📋 Về các quy định:\n"
                   "• Xem tài liệu quy chế đào tạo trên website\n"
                   "• Liên hệ phòng Đào tạo để được giải đáp\n"
                   "• Tham khảo sổ tay sinh viên")
        
        elif any(keyword in message_lower for keyword in ['học bổng', 'hỗ trợ', 'miễn giảm']):
            return ("🎓 Về học bổng và hỗ trợ:\n"
                   "• Xem thông tin học bổng trên website\n"
                   "• Liên hệ phòng Công tác sinh viên\n"
                   "• Theo dõi thông báo từ trường")
        
        elif any(keyword in message_lower for keyword in ['liên hệ', 'địa chỉ', 'email', 'điện thoại']):
            return ("📞 Thông tin liên hệ:\n"
                   "• Website chính thức của trường\n"
                   "• Phòng Đào tạo và Công tác sinh viên\n"
                   "• Hotline hỗ trợ sinh viên\n"
                   "• Fanpage và mạng xã hội của trường")
        
        else:
            return ("🤖 Cảm ơn bạn đã hỏi! Hiện tại tôi có thể giúp bạn:\n"
                   "• 📅 Xem lịch học (hôm nay, ngày mai, tuần)\n"
                   "• 📚 Xem chương trình đào tạo\n"
                   "• 📞 Thông tin liên hệ các phòng ban\n\n"
                   "Bạn cũng có thể liên hệ trực tiếp phòng Đào tạo để được hỗ trợ chi tiết hơn.")


class ActionInitializeRAG(Action):
    """Action để kiểm tra trạng thái RAG bridge"""
    
    def name(self) -> Text:
        return "action_initialize_rag"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            if not RAG_AVAILABLE or not rag_bridge:
                dispatcher.utter_message(text="❌ RAG bridge không khả dụng. Vui lòng kiểm tra kết nối.")
                return []
            
            # Kiểm tra trạng thái
            if rag_bridge.is_ready():
                dispatcher.utter_message(text="✅ RAG system đã sẵn sàng!")
            else:
                dispatcher.utter_message(text="⚠️ RAG system chưa sẵn sàng. Vui lòng kiểm tra external API.")
            
            return []
            
        except Exception as e:
            print(f"❌ Error in ActionInitializeRAG: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi kiểm tra hệ thống.")
            return []


class ActionRAGHelp(Action):
    """Action cung cấp hướng dẫn về RAG system"""
    
    def name(self) -> Text:
        return "action_rag_help"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        help_message = """🤖 **Hướng dẫn sử dụng chatbot**

Tôi có thể giúp bạn:

📅 **Lịch học:**
- "lịch học hôm nay"
- "lịch học ngày mai"  
- "lịch học tuần này"

📚 **Chương trình đào tạo:**
- "chương trình đào tạo của tôi"
- "xem môn học"

❓ **Câu hỏi tổng quát:**
- Học phí và chi phí
- Quy định và quy chế
- Thông tin liên hệ
- Học bổng và hỗ trợ

**Lưu ý:** Để xem lịch học và chương trình đào tạo, bạn cần đăng nhập vào hệ thống trước.

Hãy thử hỏi tôi bất kỳ điều gì! 😊"""
        
        dispatcher.utter_message(text=help_message)
        return []
