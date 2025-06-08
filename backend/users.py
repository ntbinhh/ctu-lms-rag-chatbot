from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
import models, schemas
from database import SessionLocal
from auth import create_access_token
from fastapi import Depends
from auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": db_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username,
        "role": db_user.role,
    }

@router.get("/me")
def read_current_user(current_user = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }
