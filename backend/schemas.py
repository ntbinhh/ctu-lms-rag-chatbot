from pydantic import BaseModel
from typing import Optional

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

