from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # Thêm role: "student", "teacher", "admin"

class CoSoLienKet(Base):
    __tablename__ = "co_so_lien_ket"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)

class ManagerProfile(Base):
    __tablename__ = "manager_profiles"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    phone = Column(String)
    facility_id = Column(Integer, ForeignKey("co_so_lien_ket.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    facility = relationship("CoSoLienKet")
    user = relationship("User")
