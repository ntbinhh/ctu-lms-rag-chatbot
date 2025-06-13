import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import os

# === Cấu hình ===
EXCEL_PATH = "D:/Download/sample_courses.xlsx" # hoặc đường dẫn tuyệt đối nếu cần
ADDED, SKIPPED = 0, 0

# === Đọc dữ liệu Excel ===
df = pd.read_excel(EXCEL_PATH)

# Kiểm tra các cột bắt buộc
required_columns = {"Mã học phần", "Tên học phần", "Số tín chỉ", "Đề cương"}
if not required_columns.issubset(df.columns):
    print("❌ File thiếu cột bắt buộc.")
    exit()

# === Kết nối DB ===
db: Session = SessionLocal()

# === Thêm vào DB ===
for _, row in df.iterrows():
    code = str(row["Mã học phần"]).strip()
    name = str(row["Tên học phần"]).strip()
    credit = int(row["Số tín chỉ"])
    syllabus_url = str(row["Đề cương"]).strip() if pd.notna(row["Đề cương"]) else None

    # Bỏ qua nếu trùng mã
    if db.query(models.Course).filter_by(code=code).first():
        SKIPPED += 1
        continue

    course = models.Course(
        code=code,
        name=name,
        credit=credit,
        syllabus_url=syllabus_url
    )
    db.add(course)
    ADDED += 1

db.commit()
db.close()

# === Kết quả ===
print(f"✅ Đã thêm: {ADDED} học phần")
print(f"⚠️ Bỏ qua (trùng): {SKIPPED}")
