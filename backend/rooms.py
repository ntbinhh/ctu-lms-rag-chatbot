from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
import models, schemas
from fastapi import Query
router = APIRouter()

@router.post("/rooms/add")
def add_room(
    room_data: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Chỉ cho phép manager thêm phòng
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm phòng học")

    # Lấy facility_id từ bảng ManagerProfile
    profile = db.query(models.ManagerProfile).filter(models.ManagerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ quản lý")

    facility_id = profile.facility_id

    new_room = models.Room(
        room_number=room_data.room_number,
        capacity=room_data.capacity,
        type=room_data.type,
        building=room_data.building,
        facility_id=facility_id
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return {"message": "Phòng học đã được thêm", "room_id": new_room.id}

@router.get("/rooms", response_model=list[schemas.RoomOut])
def get_rooms(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    facility_id: int = Query(None)
):
    if current_user.role not in ("manager", "admin"):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem phòng học")

    if current_user.role == "manager":
        profile = db.query(models.ManagerProfile).filter(models.ManagerProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ quản lý")
        facility_id = profile.facility_id

    if facility_id is None:
        raise HTTPException(status_code=400, detail="Thiếu facility_id")

    rooms = db.query(models.Room).filter(models.Room.facility_id == facility_id).all()
    return rooms


@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa phòng học")

    # Lấy facility_id từ profile
    profile = db.query(models.ManagerProfile).filter(models.ManagerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ quản lý")

    facility_id = profile.facility_id

    # Tìm phòng trong cơ sở quản lý
    room = db.query(models.Room).filter(
        models.Room.id == room_id,
        models.Room.facility_id == facility_id
    ).first()

    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng học trong cơ sở của bạn")

    db.delete(room)
    db.commit()

    return {"message": "Phòng học đã được xóa"}