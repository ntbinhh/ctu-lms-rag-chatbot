import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const NewsListPage = () => {
  const [newsList, setNewsList] = useState([]);
  const toast = useRef(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:8000/news");
      setNewsList(res.data);
    } catch {
      toast.current.show({ severity: "error", summary: "Lỗi", detail: "Không lấy được danh sách tin" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá bài viết này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.current.show({ severity: "info", summary: "Đã xoá", detail: "Xoá thành công" });
      fetchNews();
    } catch {
      toast.current.show({ severity: "error", summary: "Lỗi", detail: "Không thể xoá" });
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>📚 Danh sách tin tức</h2>
          <Button label="➕ Thêm tin mới" onClick={() => navigate("/admin/news/add")} />
        </div>

        {newsList.length === 0 ? (
          <p>Không có bài viết nào.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {newsList.map((item) => (
              <div key={item.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
                <h3>{item.title}</h3>
                <p style={{ color: "#888" }}>{new Date(item.created_at).toLocaleString()}</p>
                {item.image && (
                  <img
                    src={`http://localhost:8000${item.image}`}
                    alt="thumb"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "4px" }}
                  />
                )}
                <p dangerouslySetInnerHTML={{ __html: item.content.slice(0, 200) + "..." }} />

                <div style={{ marginTop: "0.5rem" }}>
                  <Button label="🗑 Xoá" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDelete(item.id)} />
                  {/* <Button label="✏ Sửa" icon="pi pi-pencil" className="p-button-text" /> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AdminFooter />
    </>
  );
};

export default NewsListPage;
