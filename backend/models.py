from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

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
    syllabus_url = Column(String)  # 🆕 Link đề cương chi tiết
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
