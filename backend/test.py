from database import SessionLocal
import models

# Khởi tạo session
db = SessionLocal()

# Thêm các cơ sở liên kết tiếp theo
facilities = [
    {"name": "Trung tâm Giáo dục thường xuyên Phú Yên", "address": "114, Lê Trung Kiên, Tp. Tuy Hòa, Phú Yên", "phone": "0934 581 567"},
    {"name": "Trường Cao đẳng Phương Đông", "address": "03, Hùng Vương, Tp. Tam Kỳ, Quảng Nam", "phone": "0235 3525 379"},
    {"name": "Trường Cao đẳng Cộng đồng Sóc Trăng", "address": "139, Lê Hồng Phong, ấp Hòa Mỹ, TT. Mỹ Xuyên, huyện Mỹ Xuyên, Sóc Trăng", "phone": "0299 3821 730"},
    {"name": "Trung tâm GDNN - GDTX thị xã Ngã Năm", "address": "Khóm 3, P.1, thị xã Ngã Năm, Sóc Trăng", "phone": "0299 2228 292"},
    {"name": "Trường Đại học Tiền Giang", "address": "119, Ấp Bắc, P.5, Tp. Mỹ Tho, Tiền Giang", "phone": "0273 3888 586"},
    {"name": "Trường Cao đẳng Nông nghiệp Nam Bộ", "address": "Xã Tân Mỹ Chánh, Tp. Mỹ Tho, Tiền Giang", "phone": "0273 3958 978"},
    {"name": "Trung tâm Giáo dục thường xuyên Tiền Giang", "address": "07, Hùng Vương, Tp. Mỹ Tho, Tiền Giang", "phone": "0273 3874 898"},
    {"name": "Trường Cao đẳng Bách Khoa Sài Gòn", "address": "32, Nguyễn Bỉnh Khiêm, P.1, Q. Gò Vấp, Tp. HCM", "phone": "028 3844 0216"},
    {"name": "Trường Cao đẳng Giao thông vận tải Trung ương VI", "address": "189, Kinh Dương Vương, P.12, Q.6, Tp. HCM", "phone": "0918 977 249"},
    {"name": "Trường Cao đẳng Vĩnh Long", "address": "112A, Đinh Tiên Hoàng, Tp. Vĩnh Long, Vĩnh Long", "phone": "0270 3879 169"},
    {"name": "Trường Trung cấp Á Châu", "address": "278, Hùng Vương, ấp Xóm Mới, xã Thanh Phước, H. Gò Dầu, Tây Ninh", "phone": "0276 3521 966"},
    {"name": "Trung tâm GDTX-HN tỉnh Ninh Thuận", "address": "Số 26, đường 16/4, Tp. Phan Rang - Tháp Chàm, tỉnh Ninh Thuận", "phone": "0259 3831 784"}
]

# Thêm dữ liệu vào database
for f in facilities:
    db.add(models.CoSoLienKet(**f))

db.commit()
db.close()

print("✅ Đã thêm các cơ sở liên kết đào tạo tiếp theo.")
