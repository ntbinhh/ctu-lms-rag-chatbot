from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from schemas import CourseUpdateInProgram
from pydantic import BaseModel
router = APIRouter()
from schemas import ProgramAddCoursesInput

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

@router.put("/admin/programs/update_course")
def update_course_in_program(
    payload: CourseUpdateInProgram,
    db: Session = Depends(get_db)
):
    program = db.query(models.TrainingProgram).filter_by(
        khoa=payload.khoa, major_id=payload.major_id
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    link = db.query(models.ProgramCourse).filter_by(
        program_id=program.id, course_code=payload.course_code
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Học phần không nằm trong chương trình")

    course = db.query(models.Course).filter_by(code=payload.course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy học phần")

    course.name = payload.name
    course.credit = payload.credit
    course.syllabus_url = payload.syllabus_url
    db.commit()
    return {"message": "Đã cập nhật thành công"}
class DeleteCourseInput(BaseModel):
    khoa: str
    major_id: int
    course_code: str
@router.delete("/admin/programs/delete_course")
def delete_course_from_program(
    payload: DeleteCourseInput = Body(...),
    db: Session = Depends(get_db)
):
    program = (
        db.query(models.TrainingProgram)
        .filter_by(khoa=payload.khoa, major_id=payload.major_id)
        .first()
    )
    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    course = (
    db.query(models.ProgramCourse)
    .filter_by(program_id=program.id, course_code=payload.course_code)
    .first()
)
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy học phần trong chương trình")

    db.delete(course)
    db.commit()
    return {"message": "Đã xóa học phần khỏi chương trình"}

class ProgramCourseCreate(BaseModel):
    khoa: str
    major_id: int
    course_code: str
    name: str
    credit: int
    syllabus_url: str = ""

@router.post("/admin/programs/add_courses")
def add_multiple_courses_to_program(
    payload: ProgramAddCoursesInput,
    db: Session = Depends(get_db)
):
    program = db.query(models.TrainingProgram).filter_by(
        khoa=payload.khoa, major_id=payload.major_id
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    added_codes = []
    for code in payload.course_codes:
        exists = db.query(models.ProgramCourse).filter_by(
            program_id=program.id, course_code=code
        ).first()
        if not exists:
            db.add(models.ProgramCourse(program_id=program.id, course_code=code))
            added_codes.append(code)

    db.commit()
    return {"message": f"Đã thêm {len(added_codes)} học phần vào chương trình"}

@router.delete("/admin/programs/delete_program")
def delete_training_program(payload: schemas.ProgramDeleteInput = Body(...), db: Session = Depends(get_db)):
    program = db.query(models.TrainingProgram).filter_by(
        khoa=payload.khoa,
        major_id=payload.major_id
    ).first()

    if not program:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình")

    db.query(models.ProgramCourse).filter_by(program_id=program.id).delete()
    db.delete(program)
    db.commit()

    return {"message": "Đã xóa chương trình đào tạo"}