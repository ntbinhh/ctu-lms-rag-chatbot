import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const SliderImageUpload = () => {
  const [images, setImages] = useState([]);
  const toast = useRef(null);

  const fetchImages = async () => {
    try {
      const res = await axios.get("http://localhost:8000/home/slider-images");
      setImages(res.data);
    } catch {
      setImages([]);
    }
  };

const handleUpload = async (event) => {
  const { files, options } = event;
  const token = localStorage.getItem("token");

  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/admin/slider-images/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    } catch {
      toast.current.show({
        severity: "error",
        summary: "Lỗi",
        detail: `Tải ảnh thất bại: ${file.name}`,
        life: 3000,
      });
    }
  }

  // ✅ Clear UI trạng thái "Pending"
  if (options && typeof options.clear === "function") {
    options.clear();
  }

  toast.current.show({
    severity: "success",
    summary: "Thành công",
    detail: "Đã tải tất cả ảnh",
    life: 3000,
  });

  fetchImages();
};
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá ảnh này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/slider-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.current.show({ severity: "info", summary: "Đã xoá", detail: "Ảnh đã được xoá", life: 3000 });
      fetchImages();
    } catch {
      toast.current.show({ severity: "error", summary: "Lỗi", detail: "Không thể xoá ảnh", life: 3000 });
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper" style={{ padding: "2rem" }}>
        <Toast ref={toast} />
        <h2 className="form-title">🖼 Quản lý Ảnh Slider</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <FileUpload
            name="files"
            multiple
            customUpload
            uploadHandler={handleUpload}
            accept="image/*"
            mode="advanced"         // ✅ giao diện kéo thả
            auto                    // ✅ tự động upload ngay khi chọn
            chooseLabel="Chọn ảnh"
            uploadLabel="Tải lên"
            cancelLabel="Hủy"
            style={{ width: "100%", marginBottom: "1.5rem" }}
            />
          <small style={{ display: "block", marginTop: "0.5rem", color: "#888" }}>
            Kích thước khuyến nghị: <strong>2560 x 734px</strong>
          </small>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: "relative", border: "1px solid #eee", borderRadius: "6px", overflow: "hidden" }}>
              <Image
                src={`http://localhost:8000${img.url}?v=${img.id}`}  // ép browser load lại ảnh mới
                alt="slider"
                width="100%"
                preview
                />
              <Button
                icon="pi pi-trash"
                className="p-button-sm p-button-danger"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                  backgroundColor: "rgba(255, 0, 0, 0.7)",
                  border: "none"
                }}
                onClick={() => handleDelete(img.id)}
                tooltip="Xoá ảnh"
              />
            </div>
          ))}
        </div>
      </div>
      <AdminFooter />
    </>
  );
};

export default SliderImageUpload;
