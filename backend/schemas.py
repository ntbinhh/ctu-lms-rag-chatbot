from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # thêm role

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str  # trả về role
    class Config:
        orm_mode = True

class CoSoLienKetCreate(BaseModel):
    name: str
    address: str
    phone: str

class CoSoLienKetOut(BaseModel):
    id: int
    name: str
    address: str
    phone: str

    class Config:
        orm_mode = True

class ManagerCreate(BaseModel):
    full_name: str
    phone: str
    facility_id: int