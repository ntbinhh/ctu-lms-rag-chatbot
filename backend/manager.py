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

@router.get("/admin/users/managers")
def list_managers(db: Session = Depends(get_db)):
    managers = db.query(models.ManagerProfile).all()
    result = []
    for m in managers:
        facility = db.query(models.CoSoLienKet).filter_by(id=m.facility_id).first()
        user = db.query(models.User).filter_by(id=m.user_id).first()
        result.append({
            "id": m.id,
            "full_name": m.full_name,
            "phone": m.phone,
            "facility_name": facility.name if facility else "Không rõ",
            "status": user.status if user else "unknown"
        })
    return result



@router.delete("/admin/users/managers/{id}")
def delete_manager(id: int, db: Session = Depends(get_db)):
    profile = db.query(models.ManagerProfile).filter(models.ManagerProfile.id == id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Xóa user liên quan
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    if user:
        db.delete(user)

    db.delete(profile)
    db.commit()
    return {"message": "Manager deleted successfully"}

@router.put("/admin/users/managers/{id}/status")
def toggle_manager_status(id: int, db: Session = Depends(get_db)):
    profile = db.query(models.ManagerProfile).filter_by(id=id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Manager not found")

    user = db.query(models.User).filter_by(id=profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "blocked" if user.status == "active" else "active"
    db.commit()
    return {"message": f"Status changed to {user.status}"}
