from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from passlib.hash import bcrypt
from counters import get_next_counter
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

@router.get("/admin/users/teachers/list")
def list_teachers(db: Session = Depends(get_db)):
    teachers = db.query(models.Teacher).all()
    result = []
    for t in teachers:
        user = db.query(models.User).filter_by(id=t.user_id).first()
        faculty = db.query(models.Faculty).filter_by(id=t.faculty_id).first()
        result.append({
            "id": t.id,
            "name": t.name,
            "code": t.code,
            "email": t.email,
            "phone": t.phone,
            "faculty": faculty.name if faculty else "Không rõ",
            "status": user.status if user else "unknown",
            "username": user.username if user else None
        })
    return result
