from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from passlib.hash import bcrypt

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/users/managers")
def create_manager(manager: schemas.ManagerCreate, db: Session = Depends(get_db)):
    # Tạo username tự động ID001, ID002, ...
    last_user = db.query(models.User).order_by(models.User.id.desc()).first()
    next_id = (last_user.id + 1) if last_user else 1
    username = f"ID{str(next_id).zfill(3)}"
    password_hash = bcrypt.hash("123")  # Mật khẩu mặc định

    # Tạo user mới
    new_user = models.User(username=username, password=password_hash, role="manager")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Tạo hồ sơ quản lý
    profile = models.ManagerProfile(
        full_name=manager.full_name,
        phone=manager.phone,
        facility_id=manager.facility_id,
        user_id=new_user.id,
    )
    db.add(profile)
    db.commit()

    return {"username": username, "default_password": "123"}
