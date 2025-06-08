from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # Thêm role: "student", "teacher", "admin"

class CoSoLienKet(Base):
    __tablename__ = "co_so_lien_ket"

    id = Column(Integer, primary_key=True, index=True)  # STT tự tăng
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)