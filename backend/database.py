from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # thư mục của database.py
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}"

# Cấu hình engine với pool settings tối ưu cho SQLite
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    pool_size=20,           # Tăng pool size
    max_overflow=0,         # Không cho overflow để tránh tạo quá nhiều connection
    pool_timeout=30,        # Timeout 30 giây
    pool_recycle=3600,      # Recycle connection sau 1 giờ
    pool_pre_ping=True,     # Test connection trước khi sử dụng
    echo=False              # Tắt logging SQL để tăng performance
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()