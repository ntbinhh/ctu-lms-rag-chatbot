from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
import bcrypt

def create_admin():
    db: Session = SessionLocal()
    admin = db.query(User).filter_by(username="admin").first()
    if not admin:
        # Mã hóa mật khẩu bằng bcrypt
        hashed_password = bcrypt.hashpw("admin".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_admin = User(
            username="admin",
            password=hashed_password,
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        print("Admin user created.")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    create_admin()