from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os, shutil, uuid
from database import SessionLocal
import models, schemas

router = APIRouter()
UPLOAD_DIR = "static/slider"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/slider-images/upload")
def upload_slider_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Tạo tên file duy nhất
    ext = os.path.splitext(file.filename)[1]  # .jpg / .png
    filename = f"{uuid.uuid4().hex}{ext}"     # ví dụ: 91ad.jpg

    save_path = os.path.join("static/slider", filename)

    # 2. Lưu file vật lý
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Lưu vào DB
    new_image = models.SliderImage(filename=filename)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {"message": "Tải ảnh thành công", "id": new_image.id}

@router.get("/home/slider-images", response_model=list[schemas.SliderImageOut])
def get_slider_images(db: Session = Depends(get_db)):
    images = db.query(models.SliderImage).order_by(models.SliderImage.uploaded_at.desc()).all()
    return [
        {
            "id": img.id,
            "url": f"/static/slider/{img.filename}",
            "uploaded_at": img.uploaded_at.isoformat()
        }
        for img in images
    ]

@router.delete("/admin/slider-images/{id}")
def delete_slider_image(id: int, db: Session = Depends(get_db)):
    image = db.query(models.SliderImage).filter_by(id=id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh")

    file_path = os.path.join("static/slider", image.filename)

    if os.path.isfile(file_path):
        os.remove(file_path)

    db.delete(image)
    db.commit()
    return {"message": "Đã xoá ảnh"}