from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from users import router  

app = FastAPI()

# Cho phép mọi nguồn (trong môi trường dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc cụ thể: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các HTTP method
    allow_headers=["*"],  # Cho phép tất cả các headers
)
app.include_router(router)  # <- Bắt buộc phải include
