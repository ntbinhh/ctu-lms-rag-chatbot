from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from auth import get_current_user
from database import get_db
import models, schemas
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.post("/schedules")
def create_schedule(
    data: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm thời khóa biểu")

    class_obj = db.query(models.Class).filter(models.Class.id == data.class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")

    added, skipped = [], []

    for item in data.schedule_items:
        exists = db.query(models.ScheduleItem).filter(
            models.ScheduleItem.class_id == data.class_id,
            models.ScheduleItem.week == item.week,
            models.ScheduleItem.day == item.day,
            models.ScheduleItem.period == item.period
        ).first()

        if exists:
            skipped.append({
                "week": item.week,
                "day": item.day,
                "period": item.period
            })
            continue

        schedule = models.ScheduleItem(
            class_id=data.class_id,
            hoc_ky=data.hoc_ky,
            nam_hoc=data.nam_hoc,
            week=item.week,
            day=item.day,
            period=item.period,
            subject_id=item.subject_id,
            teacher_id=item.teacher_id,
            hinh_thuc=item.hinh_thuc,
            room_id=item.room_id,
        )
        db.add(schedule)
        added.append({
            "week": item.week,
            "day": item.day,
            "period": item.period
        })

    db.commit()

    return {
        "message": f"Đã thêm {len(added)} mục, bỏ qua {len(skipped)} mục bị trùng",
        "added": added,
        "skipped": skipped
    }

@router.get("/schedules", response_model=List[schemas.ScheduleItemOut])
def get_schedule(
    class_id: int,
    hoc_ky: str,
    nam_hoc: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Không có quyền xem lịch")

    schedules = db.query(models.ScheduleItem)        .options(
            joinedload(models.ScheduleItem.subject),
            joinedload(models.ScheduleItem.teacher_profile),
        )        .filter_by(
            class_id=class_id,
            hoc_ky=hoc_ky,
            nam_hoc=nam_hoc
        ).all()
    return schedules

@router.get("/student/schedules", response_model=List[schemas.ScheduleItemOut])
def get_student_schedule(
    hoc_ky: str,
    nam_hoc: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có thể xem lịch học của mình")

    # Tìm thông tin sinh viên dựa trên user hiện tại
    student = db.query(models.Student).filter(models.Student.student_code == current_user.username).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin sinh viên")

    if not student.class_id:
        raise HTTPException(status_code=404, detail="Sinh viên chưa được phân lớp")

    schedules = db.query(models.ScheduleItem) \
        .options(
            joinedload(models.ScheduleItem.subject),
            joinedload(models.ScheduleItem.teacher_profile),
            joinedload(models.ScheduleItem.classroom)
        ) \
        .filter_by(
            class_id=student.class_id,
            hoc_ky=hoc_ky,
            nam_hoc=nam_hoc
        ).all()
    return schedules

@router.get("/teacher/schedules", response_model=List[schemas.ScheduleItemOut])
def get_teacher_schedule(
    hoc_ky: str,
    nam_hoc: int,
    class_id: int = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể xem lịch giảng dạy của mình")

    # Tìm thông tin teacher dựa trên user hiện tại
    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin giáo viên")

    # Query cơ bản
    query = db.query(models.ScheduleItem) \
        .options(
            joinedload(models.ScheduleItem.subject),
            joinedload(models.ScheduleItem.teacher_profile),
            joinedload(models.ScheduleItem.classroom),
            joinedload(models.ScheduleItem.class_obj)
        ) \
        .filter_by(
            teacher_id=current_user.id,  # teacher_id trong ScheduleItem là user_id của giáo viên
            hoc_ky=hoc_ky,
            nam_hoc=nam_hoc
        )
    
    # Nếu có class_id thì filter thêm
    if class_id:
        query = query.filter_by(class_id=class_id)
    
    schedules = query.all()
    return schedules

@router.get("/teacher/classes")
def get_teacher_classes(
    hoc_ky: str,
    nam_hoc: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể xem danh sách lớp")

    # Tìm thông tin teacher dựa trên user hiện tại
    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin giáo viên")

    # Lấy danh sách lớp mà giáo viên đang dạy trong học kỳ này
    classes = db.query(models.Class) \
        .join(models.ScheduleItem, models.Class.id == models.ScheduleItem.class_id) \
        .filter(
            models.ScheduleItem.teacher_id == current_user.id,
            models.ScheduleItem.hoc_ky == hoc_ky,
            models.ScheduleItem.nam_hoc == nam_hoc
        ) \
        .distinct() \
        .all()
    
    return [{"id": cls.id, "name": cls.name} for cls in classes]

@router.get("/teacher/debug")
def debug_teacher_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có thể debug")

    # Lấy thông tin teacher
    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    
    # Lấy tất cả schedule items có teacher_id = current_user.id
    all_schedules = db.query(models.ScheduleItem).filter(models.ScheduleItem.teacher_id == current_user.id).all()
    
    # Lấy một số schedule items mẫu để xem structure
    sample_schedules = db.query(models.ScheduleItem).limit(5).all()
    
    return {
        "current_user": {
            "id": current_user.id,
            "username": current_user.username,
            "role": current_user.role
        },
        "teacher_profile": {
            "id": teacher.id if teacher else None,
            "name": teacher.name if teacher else None,
            "code": teacher.code if teacher else None,
            "user_id": teacher.user_id if teacher else None
        } if teacher else None,
        "schedules_for_this_teacher": [
            {
                "id": s.id,
                "teacher_id": s.teacher_id,
                "class_id": s.class_id,
                "hoc_ky": s.hoc_ky,
                "nam_hoc": s.nam_hoc,
                "subject_id": s.subject_id
            } for s in all_schedules
        ],
        "sample_schedules_in_db": [
            {
                "id": s.id,
                "teacher_id": s.teacher_id,
                "class_id": s.class_id,
                "hoc_ky": s.hoc_ky,
                "nam_hoc": s.nam_hoc,
                "subject_id": s.subject_id
            } for s in sample_schedules
        ],
        "total_schedules_for_teacher": len(all_schedules),
        "total_schedules_in_db": db.query(models.ScheduleItem).count()
    }

@router.delete("/schedules/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa thời khóa biểu")

    schedule = db.query(models.ScheduleItem).filter(models.ScheduleItem.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch học")

    db.delete(schedule)
    db.commit()
    return {"message": "Đã xóa lịch học thành công"}