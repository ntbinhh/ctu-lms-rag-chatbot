from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # Thêm role: "student", "teacher", "admin", "manager"
    # Thêm trường status để quản lý trạng thái người dùng
    status = Column(String, default="active")

class CoSoLienKet(Base):
    __tablename__ = "co_so_lien_ket"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    rooms = relationship("Room", back_populates="facility")

class ManagerProfile(Base):
    __tablename__ = "manager_profiles"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    phone = Column(String)
    facility_id = Column(Integer, ForeignKey("co_so_lien_ket.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    facility = relationship("CoSoLienKet")
    user = relationship("User")

class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    
    teachers = relationship("Teacher", back_populates="faculty")

class TrainingMajor(Base):
    __tablename__ = "training_majors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    
    faculty = relationship("Faculty")

class Course(Base):
    __tablename__ = "courses"

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    credit = Column(Integer, nullable=False)
    syllabus_url = Column(String)  
    programs = relationship("TrainingProgram", secondary="program_courses", back_populates="courses")


class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    khoa = Column(String, nullable=False)
    major_id = Column(Integer, ForeignKey("training_majors.id"))

    major = relationship("TrainingMajor")
    courses = relationship("Course", secondary="program_courses", back_populates="programs")


class ProgramCourse(Base):
    __tablename__ = "program_courses"

    program_id = Column(Integer, ForeignKey("training_programs.id"), primary_key=True)
    course_code = Column(String, ForeignKey("courses.code"), primary_key=True)

class SliderImage(Base):
    __tablename__ = "slider_images"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image = Column(String)  # đường dẫn ảnh nếu có
    created_at = Column(DateTime, default=datetime.utcnow)

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    type = Column(String, default="theory")  # Các giá trị: theory, lab, computer
    facility_id = Column(Integer, ForeignKey("co_so_lien_ket.id"), nullable=False)
    building = Column(String, nullable=True)

    facility = relationship("CoSoLienKet", back_populates="rooms")

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    faculty_id = Column(Integer, ForeignKey("faculties.id"))  # ✅ thêm dòng này

    user = relationship("User")
    faculty = relationship("Faculty", back_populates="teachers")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    khoa = Column(String, nullable=False)
    ma_lop = Column(String, unique=True, nullable=False)
    facility_id = Column(Integer, ForeignKey("co_so_lien_ket.id"))
    major_id = Column(Integer, ForeignKey("training_majors.id"))
    he_dao_tao = Column(String)  # "vhvl", "tu_xa"

    facility = relationship("CoSoLienKet")
    major = relationship("TrainingMajor")
    
class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    hoc_ky = Column(String, nullable=False)
    nam_hoc = Column(Integer, nullable=False)
    week = Column(Integer, nullable=False)
    day = Column(String, nullable=False)
    period = Column(String, nullable=False)
    subject_id = Column(String, ForeignKey("courses.code"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hinh_thuc = Column(String, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    subject = relationship("Course", backref="schedules", lazy="joined")
    teacher = relationship("User", backref="teaching_schedule", lazy="joined")
    classroom = relationship("Room", backref="schedules", lazy="joined")
    lop = relationship("Class", backref="schedule_items", lazy="joined")
    teacher_profile = relationship(
        "Teacher",
        primaryjoin="foreign(ScheduleItem.teacher_id) == Teacher.user_id",
        lazy="joined",
        overlaps="teacher,teaching_schedule"
    )

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(DateTime, nullable=False)
    gender = Column(String, nullable=False)
    student_code = Column(String, unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))

    class_obj = relationship("Class")