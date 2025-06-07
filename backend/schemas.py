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
