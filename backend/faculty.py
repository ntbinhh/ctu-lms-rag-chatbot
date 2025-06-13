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

@router.post("/admin/faculties", response_model=schemas.FacultyOut)
def create_faculty(faculty: schemas.FacultyCreate, db: Session = Depends(get_db)):
    if db.query(models.Faculty).filter(models.Faculty.name == faculty.name).first():
        raise HTTPException(status_code=400, detail="Khoa đã tồn tại")

    new_faculty = models.Faculty(name=faculty.name)
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)
    return new_faculty

@router.get("/admin/faculties", response_model=list[schemas.FacultyOut])
def list_faculties(db: Session = Depends(get_db)):
    return db.query(models.Faculty).all()
