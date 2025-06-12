# init_db.py
from database import Base, engine
import models
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

# Tạo tất cả các bảng đã khai báo trong models.py
Base.metadata.create_all(bind=engine)
print("✅ Đã tạo bảng thành công.")
