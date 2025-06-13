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

@router.post("/admin/programs", response_model=schemas.ProgramOut)
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    # ✅ Kiểm tra trùng khóa + ngành
    existing = db.query(models.TrainingProgram).filter_by(
        khoa=program.khoa,
        major_id=program.major_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Chương trình đã tồn tại cho khóa và ngành này.")

    # ✅ Tạo chương trình mới nếu chưa có
    new_program = models.TrainingProgram(
        khoa=program.khoa,
        major_id=program.major_id,
    )
    db.add(new_program)
    db.commit()
    db.refresh(new_program)

    # ✅ Thêm liên kết học phần
    for code in program.course_codes:
        db.add(models.ProgramCourse(program_id=new_program.id, course_code=code))
    db.commit()

    return schemas.ProgramOut(
        id=new_program.id,
        khoa=new_program.khoa,
        major_id=new_program.major_id,
        course_codes=program.course_codes
    )

@router.get("/admin/programs")
def list_programs(db: Session = Depends(get_db)):
    programs = db.query(models.TrainingProgram).all()
    result = []
    for p in programs:
        major = db.query(models.TrainingMajor).filter_by(id=p.major_id).first()
        courses = db.query(models.ProgramCourse).filter_by(program_id=p.id).all()
        result.append({
            "id": p.id,
            "khoa": p.khoa,
            "major_name": major.name if major else "Không rõ",
            "course_count": len(courses)
        })
    return result

@router.get("/admin/programs/{id}")
def get_program_detail(id: int, db: Session = Depends(get_db)):
    program = db.query(models.TrainingProgram).filter_by(id=id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    major = db.query(models.TrainingMajor).filter_by(id=program.major_id).first()
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
        "id": program.id,
        "khoa": program.khoa,
        "major": major.name if major else "Không rõ",
        "courses": courses
    }
