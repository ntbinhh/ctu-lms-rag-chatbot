from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models

router = APIRouter(prefix="/programs", tags=["Program View"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/years")
def get_available_years(db: Session = Depends(get_db)):
    years = db.query(models.TrainingProgram.khoa).distinct().all()
    return [y[0] for y in years]

@router.get("/years/{khoa}/faculties")
def get_faculties_by_year(khoa: str, db: Session = Depends(get_db)):
    programs = db.query(models.TrainingProgram).filter_by(khoa=khoa).all()
    faculty_ids = set()
    for p in programs:
        major = db.query(models.TrainingMajor).filter_by(id=p.major_id).first()
        if major:
            faculty_ids.add(major.faculty_id)

    faculties = db.query(models.Faculty).filter(models.Faculty.id.in_(faculty_ids)).all()
    return [{"id": f.id, "name": f.name} for f in faculties]

@router.get("/years/{khoa}/faculties/{faculty_id}/majors")
def get_majors_by_faculty(khoa: str, faculty_id: int, db: Session = Depends(get_db)):
    programs = db.query(models.TrainingProgram).filter_by(khoa=khoa).all()
    majors = []
    for p in programs:
        major = db.query(models.TrainingMajor).filter_by(id=p.major_id, faculty_id=faculty_id).first()
        if major:
            majors.append({"id": major.id, "name": major.name})
    return majors

@router.get("/by_major")
def get_program_by_major(khoa: str, major_id: int, db: Session = Depends(get_db)):
    program = db.query(models.TrainingProgram).filter_by(khoa=khoa, major_id=major_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    links = db.query(models.ProgramCourse).filter_by(program_id=program.id).all()
    courses = []
    for link in links:
        course = db.query(models.Course).filter_by(code=link.course_code).first()
        if course:
            courses.append({
                "code": course.code,
                "name": course.name,
                "credit": course.credit,
                "syllabus_url": course.syllabus_url
            })

    return {
        "program_id": program.id,
        "khoa": program.khoa,
        "courses": courses
    }
