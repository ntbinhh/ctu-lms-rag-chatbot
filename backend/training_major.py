from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/majors", response_model=schemas.TrainingMajorOut)
def create_major(major: schemas.TrainingMajorCreate, db: Session = Depends(get_db)):
    if db.query(models.TrainingMajor).filter(models.TrainingMajor.name == major.name).first():
        raise HTTPException(status_code=400, detail="Ngành đã tồn tại")

    new_major = models.TrainingMajor(**major.dict())
    db.add(new_major)
    db.commit()
    db.refresh(new_major)
    return new_major

@router.get("/admin/majors")
def list_majors(db: Session = Depends(get_db)):
    majors = db.query(models.TrainingMajor).all()
    result = []
    for m in majors:
        faculty = db.query(models.Faculty).filter_by(id=m.faculty_id).first()
        result.append({
            "id": m.id,
            "name": m.name,
            "faculty_id": m.faculty_id,
            "faculty_name": faculty.name if faculty else "Không rõ"
        })
    return result
