from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/facilities", response_model=schemas.CoSoLienKetOut)
def create_facility(facility: schemas.CoSoLienKetCreate, db: Session = Depends(get_db)):
    # Kiểm tra trùng tên + địa chỉ
    existing = db.query(models.CoSoLienKet).filter(
        models.CoSoLienKet.name == facility.name,
        models.CoSoLienKet.address == facility.address
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cơ sở đã tồn tại")

    new_facility = models.CoSoLienKet(**facility.dict())
    db.add(new_facility)
    db.commit()
    db.refresh(new_facility)
    return new_facility

@router.get("/admin/facilities", response_model=List[schemas.CoSoLienKetOut])
def list_facilities(db: Session = Depends(get_db)):
    return db.query(models.CoSoLienKet).all()

@router.delete("/admin/facilities/{id}")
def delete_facility(id: int, db: Session = Depends(get_db)):
    facility = db.query(models.CoSoLienKet).filter(models.CoSoLienKet.id == id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Không tìm thấy cơ sở")
    db.delete(facility)
    db.commit()
    return {"message": "Đã xóa cơ sở thành công"}
