from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.post("/classes")
def create_class(data: schemas.ClassCreate, db: Session = Depends(get_db)):
    # Kiểm tra thông tin cơ bản
    facility = db.query(models.CoSoLienKet).filter_by(id=data.facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Cơ sở liên kết không tồn tại")

    major = db.query(models.TrainingMajor).filter_by(id=data.major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Ngành đào tạo không tồn tại")

    # Tạo lớp mới
    new_class = models.Class(
        ma_lop=data.ma_lop,
        khoa=data.khoa,
        facility_id=data.facility_id,
        major_id=data.major_id,
        he_dao_tao=data.he_dao_tao,
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {"message": "✅ Đã tạo lớp học", "class_id": new_class.id}


@router.get("/classes")
def list_classes(db: Session = Depends(get_db)):
    classes = db.query(models.Class).all()

    result = []
    for c in classes:
        facility = db.query(models.CoSoLienKet).filter_by(id=c.facility_id).first()
        major = db.query(models.TrainingMajor).filter_by(id=c.major_id).first()

        result.append({
            "id": c.id,
            "ma_lop": c.ma_lop,
            "khoa": c.khoa,
            "he_dao_tao": c.he_dao_tao,
            "facility": c.facility.name if c.facility else "Không rõ",
            "facility_id": c.facility_id,  
            "major": c.major.name if c.major else "Không rõ",
            "major_id": c.major_id,        
        })

    return result

@router.get("/classes/{id}")
def get_class(id: int, db: Session = Depends(get_db)):
    c = db.query(models.Class).filter_by(id=id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp")

    return {
        "id": c.id,
        "ma_lop": c.ma_lop,
        "khoa": c.khoa,
        "he_dao_tao": c.he_dao_tao,
        "facility_id": c.facility_id,
        "major_id": c.major_id,
    }


@router.put("/classes/{class_id}")
def update_class(
    class_id: int,
    updated_data: schemas.ClassUpdate,  # bạn cần có schema ClassUpdate
    db: Session = Depends(get_db),
):
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    db_class.ma_lop = updated_data.ma_lop
    db_class.khoa = updated_data.khoa
    db_class.facility_id = updated_data.facility_id
    db_class.major_id = updated_data.major_id
    db_class.he_dao_tao = updated_data.he_dao_tao

    db.commit()
    db.refresh(db_class)

    return {"message": "Cập nhật lớp học thành công"}