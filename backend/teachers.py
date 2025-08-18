from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models, schemas
from passlib.hash import bcrypt
from counters import get_next_counter
from auth import get_current_user
from sqlalchemy import distinct
from typing import List, Dict, Any

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ 1. Thêm giảng viên mới (tạo tài khoản trong bảng users)
@router.post("/admin/users/teachers")
def create_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    # Tạo username tự động: GV001, GV002, ...
    number = get_next_counter("teacher")
    last_user = db.query(models.User).order_by(models.User.id.desc()).first()
    next_id = (last_user.id + 1) if last_user else 1
    username = f"GV{str(number).zfill(3)}"
    password_hash = bcrypt.hash("123")  # Mật khẩu mặc định

    # Tạo user mới
    new_user = models.User(username=username, password=password_hash, role="teacher", status="active")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Tạo hồ sơ giảng viên
    profile = models.Teacher(
        name=teacher.name,
        email=teacher.email,
        faculty_id=teacher.faculty_id,
        phone=teacher.phone,
        code=teacher.code,
        user_id=new_user.id,
    )
    db.add(profile)
    db.commit()

    return {"username": username, "default_password": "123"}

# ✅ 2. Lấy danh sách giảng viên
@router.get("/admin/users/teachers")
def list_teachers(db: Session = Depends(get_db)):
    teachers = db.query(models.Teacher).all()
    result = []
    for t in teachers:
        user = db.query(models.User).filter_by(id=t.user_id).first()
        result.append({
            "id": t.id,
            "name": t.name,
            "code": t.code,
            "email": t.email,
            "phone": t.phone,
            "status": user.status if user else "unknown"
        })
    return result

# ✅ 3. Xóa giảng viên
@router.delete("/admin/users/teachers/{id}")
def delete_teacher(id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Teacher).filter_by(id=id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Teacher not found")

    user = db.query(models.User).filter_by(id=profile.user_id).first()
    if user:
        db.delete(user)

    db.delete(profile)
    db.commit()
    return {"message": "Teacher deleted successfully"}

# ✅ 4. Khoá/Mở khoá tài khoản giảng viên
@router.put("/admin/users/teachers/{id}/status")
def toggle_teacher_status(id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter_by(id=id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    user = db.query(models.User).filter_by(id=teacher.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "blocked" if user.status == "active" else "active"
    db.commit()
    return {"message": f"Status changed to {user.status}"}

@router.get("/teacher/profile")
def get_teacher_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể truy cập")
    
    # Tìm thông tin teacher profile
    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin giáo viên")
    
    # Lấy thông tin khoa
    faculty = db.query(models.Faculty).filter(models.Faculty.id == teacher.faculty_id).first()
    
    return {
        "id": teacher.id,
        "user_id": current_user.id,
        "name": teacher.name,
        "code": teacher.code,
        "email": teacher.email,
        "phone": teacher.phone,
        "faculty_name": faculty.name if faculty else None,
        "username": current_user.username,
        "role": current_user.role
    }

@router.get("/admin/users/teachers/list")
def list_teachers(db: Session = Depends(get_db)):
    teachers = db.query(models.Teacher).all()
    result = []
    for t in teachers:
        user = db.query(models.User).filter_by(id=t.user_id).first()
        faculty = db.query(models.Faculty).filter_by(id=t.faculty_id).first()
        result.append({
            "id": t.id,
            "user_id": t.user_id,  # ✅ THÊM DÒNG NÀY
            "name": t.name,
            "code": t.code,
            "email": t.email,
            "phone": t.phone,
            "faculty": faculty.name if faculty else "Không rõ",
            "status": user.status if user else "unknown",
            "username": user.username if user else None
        })
    return result

# ✅ API mới: Lấy danh sách năm học và học kỳ mà giáo viên đang dạy
@router.get("/teacher/semesters")
def get_teacher_semesters(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể truy cập")
    
    # Lấy danh sách năm học và học kỳ duy nhất từ lịch giảng dạy
    semesters = db.query(
        models.ScheduleItem.nam_hoc, 
        models.ScheduleItem.hoc_ky
    ).filter(
        models.ScheduleItem.teacher_id == current_user.id
    ).distinct().all()
    
    # Tổ chức dữ liệu theo năm học
    result = {}
    for nam_hoc, hoc_ky in semesters:
        if nam_hoc not in result:
            result[nam_hoc] = []
        if hoc_ky not in result[nam_hoc]:
            result[nam_hoc].append(hoc_ky)
    
    # Sắp xếp năm học giảm dần và học kỳ tăng dần
    sorted_result = []
    for nam_hoc in sorted(result.keys(), reverse=True):
        sorted_result.append({
            "nam_hoc": nam_hoc,
            "hoc_ky_list": sorted(result[nam_hoc])
        })
    
    return sorted_result

# ✅ API mới: Lấy danh sách lớp giảng dạy theo năm học và học kỳ
@router.get("/teacher/classes")
def get_teacher_classes_by_semester(
    nam_hoc: int,
    hoc_ky: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể truy cập")
    
    # Lấy danh sách lớp giảng dạy trong học kỳ đó
    classes_data = db.query(
        models.ScheduleItem.class_id,
        models.Class.ma_lop,
        models.Class.khoa,
        models.Course.name.label("subject_name"),
        models.Course.code.label("subject_code")
    ).join(
        models.Class, models.ScheduleItem.class_id == models.Class.id
    ).join(
        models.Course, models.ScheduleItem.subject_id == models.Course.code
    ).filter(
        models.ScheduleItem.teacher_id == current_user.id,
        models.ScheduleItem.nam_hoc == nam_hoc,
        models.ScheduleItem.hoc_ky == hoc_ky
    ).distinct().all()
    
    # Tổ chức dữ liệu theo lớp
    classes_dict = {}
    for class_id, ma_lop, khoa, subject_name, subject_code in classes_data:
        if class_id not in classes_dict:
            classes_dict[class_id] = {
                "class_id": class_id,
                "ma_lop": ma_lop,
                "khoa": khoa,
                "subjects": []
            }
        
        # Kiểm tra xem môn học đã có chưa
        subject_exists = any(s["code"] == subject_code for s in classes_dict[class_id]["subjects"])
        if not subject_exists:
            classes_dict[class_id]["subjects"].append({
                "code": subject_code,
                "name": subject_name
            })
    
    # Đếm số sinh viên trong mỗi lớp
    result = []
    for class_data in classes_dict.values():
        student_count = db.query(models.Student).filter(
            models.Student.class_id == class_data["class_id"]
        ).count()
        
        class_data["student_count"] = student_count
        result.append(class_data)
    
    # Sắp xếp theo mã lớp
    result.sort(key=lambda x: x["ma_lop"])
    
    return result

# ✅ API mới: Lấy danh sách sinh viên trong lớp
@router.get("/teacher/classes/{class_id}/students")
def get_class_students(
    class_id: int,
    nam_hoc: int,
    hoc_ky: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể truy cập")
    
    # Kiểm tra giáo viên có dạy lớp này không
    schedule_exists = db.query(models.ScheduleItem).filter(
        models.ScheduleItem.teacher_id == current_user.id,
        models.ScheduleItem.class_id == class_id,
        models.ScheduleItem.nam_hoc == nam_hoc,
        models.ScheduleItem.hoc_ky == hoc_ky
    ).first()
    
    if not schedule_exists:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách sinh viên của lớp này")
    
    # Lấy thông tin lớp
    class_info = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp")
    
    # Lấy danh sách sinh viên
    students = db.query(models.Student).filter(
        models.Student.class_id == class_id
    ).order_by(models.Student.student_code).all()
    
    # Lấy danh sách môn học giảng dạy
    subjects = db.query(models.Course).join(
        models.ScheduleItem, models.ScheduleItem.subject_id == models.Course.code
    ).filter(
        models.ScheduleItem.teacher_id == current_user.id,
        models.ScheduleItem.class_id == class_id,
        models.ScheduleItem.nam_hoc == nam_hoc,
        models.ScheduleItem.hoc_ky == hoc_ky
    ).distinct().all()
    
    return {
        "class_info": {
            "id": class_info.id,
            "ma_lop": class_info.ma_lop,
            "khoa": class_info.khoa,
            "he_dao_tao": class_info.he_dao_tao
        },
        "subjects": [{"code": s.code, "name": s.name} for s in subjects],
        "students": [{
            "id": s.id,
            "name": s.name,
            "student_code": s.student_code,
            "dob": s.dob.strftime("%d/%m/%Y") if s.dob else None,
            "gender": s.gender
        } for s in students],
        "total_students": len(students)
    }
