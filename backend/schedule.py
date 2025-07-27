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