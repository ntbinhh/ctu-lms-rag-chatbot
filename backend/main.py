from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from users import router  
from facilities import router as facility_router
from manager import router as manager_router
from faculty import router as faculty_router
from training_major import router as major_router
from courses_routes import router as courses_router
from training_program import router as program_router
from program_view import router as program_view_router
from slider_routes import router as slider_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Cho phép mọi nguồn (trong môi trường dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc cụ thể: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các HTTP method
    allow_headers=["*"],  # Cho phép tất cả các headers
)
app.include_router(router)  # Đăng ký router cho người dùng
app.include_router(facility_router)   # Đăng ký router cho cơ sở liên kết
app.include_router(manager_router)  # Đăng ký router cho quản lý
app.include_router(faculty_router)  # Đăng ký router cho khoa
app.include_router(major_router)  # Đăng ký router cho ngành đào tạo
app.include_router(courses_router)
app.include_router(program_router)
app.include_router(program_view_router)
app.include_router(slider_router)
app.mount("/static", StaticFiles(directory="static"), name="static")
