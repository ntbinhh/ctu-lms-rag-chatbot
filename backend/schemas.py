from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from datetime import date


# -------- USERS --------
class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

# -------- FACILITIES --------
class CoSoLienKetCreate(BaseModel):
    name: str
    address: str
    phone: str

class CoSoLienKetOut(CoSoLienKetCreate):
    id: int

    class Config:
        from_attributes = True

# -------- MANAGERS --------
class ManagerCreate(BaseModel):
    full_name: str
    phone: str
    facility_id: int

# -------- FACULTIES --------
class FacultyCreate(BaseModel):
    name: str

class FacultyOut(FacultyCreate):
    id: int

    class Config:
        from_attributes = True

# -------- MAJORS --------
class TrainingMajorCreate(BaseModel):
    name: str
    faculty_id: int

class TrainingMajorOut(TrainingMajorCreate):
    id: int

    class Config:
        from_attributes = True

# -------- COURSES --------
class CourseCreate(BaseModel):
    code: str
    name: str
    credit: int
    syllabus_url: Optional[str] = None

class CourseOut(CourseCreate):
    class Config:
        from_attributes = True

# -------- TRAINING PROGRAMS --------
class ProgramCreate(BaseModel):
    khoa: str
    major_id: int
    course_codes: list[str]

class ProgramOut(BaseModel):
    id: int
    khoa: str
    major_id: int
    course_codes: list[str]

    class Config:
        from_attributes = True

class CourseUpdateInProgram(BaseModel):
    khoa: str
    major_id: int
    course_code: str
    name: str
    credit: int
    syllabus_url: str = ""

from typing import List

class ProgramAddCoursesInput(BaseModel):
    khoa: str
    major_id: int
    course_codes: List[str]

class ProgramDeleteInput(BaseModel):
    khoa: str
    major_id: int

class SliderImageOut(BaseModel):
    id: int
    url: str
    uploaded_at: str

    class Config:
        from_attributes = True

class NewsCreate(BaseModel):
    title: str
    content: str
    image: Optional[str] = None

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

class RoomCreate(BaseModel):
    room_number: str
    capacity: int
    type: str  # VD: "theory", "lab", "computer"
    building: Optional[str] = None

class RoomOut(BaseModel):
    id: int
    room_number: str
    capacity: int
    type: str
    facility_id: int
    building: Optional[str] = None

    class Config:
        orm_mode = True

class TeacherCreate(BaseModel):
    name: str
    code: str
    email: str
    phone: str
    faculty_id: int

class ClassCreate(BaseModel):
    ma_lop: str
    khoa: str
    facility_id: int
    major_id: int
    he_dao_tao: str

class ClassUpdate(BaseModel):
    ma_lop: str
    khoa: str
    facility_id: int
    major_id: int
    he_dao_tao: str

class ScheduleItemCreate(BaseModel):
    week: int
    day: str
    period: str
    subject_id: str
    teacher_id: int
    hinh_thuc: str
    room_id: Optional[int] = None

class ScheduleCreate(BaseModel):
    class_id: int
    hoc_ky: str
    nam_hoc: int
    schedule_items: List[ScheduleItemCreate]

class SubjectOut(BaseModel):
    name: str
    class Config:
        orm_mode = True
        
class TeacherOut(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        orm_mode = True

class ScheduleItemOut(BaseModel):
    id: int 
    week: int
    day: str
    period: str
    hinh_thuc: str
    subject: Optional[SubjectOut] = None
    teacher_profile: Optional[TeacherOut] = None
    room_id: Optional[int] = None

    class Config:
        orm_mode = True

class StudentCreate(BaseModel):
    name: str
    dob: date
    gender: str
