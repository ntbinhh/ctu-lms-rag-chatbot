import React, { useState, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

import "quill/dist/quill.snow.css";

const AddNewsForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const toast = useRef(null);
  const editorRef = useRef(null);

  // Tùy chỉnh upload ảnh trong editor
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const quill = editorRef.current?.getQuill(); // Lấy Quill editor

      try {
        const res = await axios.post("http://localhost:8000/upload", formData);
        const imageUrl = `http://localhost:8000${res.data.url}`;
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
      } catch (err) {
        toast.current.show({ severity: "error", summary: "Lỗi", detail: "Không thể tải ảnh" });
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.current.show({ severity: "warn", summary: "Thiếu dữ liệu", detail: "Vui lòng điền đầy đủ" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/news", {
        title,
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.current.show({ severity: "success", summary: "Thành công", detail: "Đã thêm bài viết" });
      setTitle(""); setContent("");
    } catch {
      toast.current.show({ severity: "error", summary: "Lỗi", detail: "Không thể thêm bài viết" });
    }
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <h2>📝 Thêm bài viết mới</h2>

        <span className="p-float-label" style={{ marginBottom: "1rem" }}>
          <InputText
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%" }}
          />
          <label>Tiêu đề</label>
        </span>

        <Editor
          ref={editorRef}
          value={content}
          onTextChange={(e) => setContent(e.htmlValue)}
          style={{ height: "300px" }}
          modules={modules}
        />

        <Button
          label="Lưu bài viết"
          icon="pi pi-save"
          onClick={handleSubmit}
          style={{ marginTop: "1.5rem" }}
        />
      </div>
      <AdminFooter />
    </>
  );
};

export default AddNewsForm;
