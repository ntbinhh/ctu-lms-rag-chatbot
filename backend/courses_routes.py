# courses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/admin", tags=["Courses"])  # ✅ prefix và tags rõ ràng

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from typing import List

@router.get("/courses", response_model=List[schemas.CourseOut])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    return courses


@router.post("/courses", response_model=schemas.CourseOut)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    if db.query(models.Course).filter(models.Course.code == course.code).first():
        raise HTTPException(status_code=400, detail="Mã học phần đã tồn tại")
    new_course = models.Course(
        code=course.code,
        name=course.name,
        credit=course.credit,
        syllabus_url=course.syllabus_url
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course