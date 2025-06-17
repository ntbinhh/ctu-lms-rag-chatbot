from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import News
from schemas import NewsCreate, NewsResponse
from typing import List
from datetime import datetime
from fastapi import UploadFile, File
import os
import uuid
from fastapi.responses import JSONResponse
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Tạo bài viết mới
@router.post("/admin/news", response_model=NewsResponse)
def create_news(news: NewsCreate, db: Session = Depends(get_db)):
    new_news = News(
        title=news.title,
        content=news.content,
        image=news.image,
        created_at=datetime.utcnow()
    )
    db.add(new_news)
    db.commit()
    db.refresh(new_news)
    return new_news

# Lấy danh sách bài viết (hiển thị trang chủ)
@router.get("/news", response_model=List[NewsResponse])
def list_news(db: Session = Depends(get_db)):
    return db.query(News).order_by(News.created_at.desc()).all()

# Lấy chi tiết bài viết theo id
@router.get("/news/{id}", response_model=NewsResponse)
def get_news(id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin tức")
    return news

# Cập nhật bài viết
@router.put("/admin/news/{id}", response_model=NewsResponse)
def update_news(id: int, updated: NewsCreate, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin tức")

    news.title = updated.title
    news.content = updated.content
    news.image = updated.image
    db.commit()
    db.refresh(news)
    return news

# Xoá bài viết
@router.delete("/admin/news/{id}")
def delete_news(id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin tức")
    db.delete(news)
    db.commit()
    return {"message": "Đã xoá tin tức thành công"}

UPLOAD_DIR = "static/news"

@router.post("/upload")
async def upload_news_image(file: UploadFile = File(...)):
    try:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        return {"url": f"/static/news/{filename}"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Lỗi upload: {str(e)}"})