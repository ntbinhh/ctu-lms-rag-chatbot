from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from passlib.hash import bcrypt
from typing import List
from pydantic import BaseModel
from auth import get_current_user

router = APIRouter()
class AddStudentsRequest(BaseModel):
    class_id: int
    students: List[schemas.StudentCreate]
@router.post("/students")
def add_students(
    request: AddStudentsRequest,
    db: Session = Depends(get_db)
):
    class_id = request.class_id
    students = request.students

    # Lấy thông tin lớp
    class_obj = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")

    # Kiểm tra trùng học viên
    existing_students = db.query(models.Student).filter(models.Student.class_id == class_id).all()
    existing_names = {student.name for student in existing_students}

    duplicates = []
    new_students = []
    for student in students:
        if student.name in existing_names:
            duplicates.append(student.name)
        else:
            student_code = f"{class_obj.ma_lop}{len(existing_students) + len(new_students) + 1:02d}"
            password_hash = bcrypt.hash("123")  # Mật khẩu mặc định

            # Tạo tài khoản người dùng
            new_user = models.User(
                username=student_code,
                password=password_hash,
                role="student",
                status="active",
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            # Tạo hồ sơ học viên
            new_student = models.Student(
                name=student.name,
                dob=student.dob,
                gender=student.gender,
                student_code=student_code,
                class_id=class_id,
            )
            db.add(new_student)
            new_students.append(new_student)

    db.commit()

    if duplicates:
        return {
            "message": f"Đã thêm {len(new_students)} học viên. Các học viên sau đã tồn tại: {', '.join(duplicates)}",
            "students": new_students,
            "duplicates": duplicates,
        }
    return {"message": f"Đã thêm {len(new_students)} học viên", "students": new_students}

@router.get("/classes/{class_id}/students")
def get_students_by_class(class_id: int, db: Session = Depends(get_db)):
    # Kiểm tra xem lớp học có tồn tại không
    class_obj = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")

    # Lấy danh sách học viên của lớp
    students = db.query(models.Student).filter(models.Student.class_id == class_id).all()
    if not students:
        return {"message": "Không có học viên nào trong lớp này", "students": []}

    return {"class_id": class_id, "class_name": class_obj.ma_lop, "students": students}

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    # Tìm học viên theo ID
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học viên")

    # Xóa tài khoản người dùng liên kết với học viên
    user = db.query(models.User).filter(models.User.username == student.student_code).first()
    if user:
        db.delete(user)

    # Xóa học viên
    db.delete(student)
    db.commit()

    return {"message": f"Đã xóa học viên với ID {student_id}"}

@router.get("/student/profile")
def get_student_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin hồ sơ sinh viên hiện tại"""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có thể xem hồ sơ của mình")

    # Tìm thông tin sinh viên dựa trên user hiện tại
    student = db.query(models.Student).join(models.Class).filter(
        models.Student.student_code == current_user.username
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin sinh viên")

    return {
        "id": student.id,
        "name": student.name,
        "student_code": student.student_code,
        "dob": student.dob,
        "gender": student.gender,
        "class_id": student.class_id,
        "class_name": student.class_obj.ma_lop if student.class_obj else None
    }