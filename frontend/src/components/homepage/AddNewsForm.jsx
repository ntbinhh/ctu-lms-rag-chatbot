import React, { useState, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { FloatLabel } from "primereact/floatlabel";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

import "quill/dist/quill.snow.css";
import "./AddNewsForm.css";

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
      
      if (!file) return;
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.current.show({ 
          severity: "warn", 
          summary: "File quá lớn", 
          detail: "Kích thước ảnh không được vượt quá 5MB",
          life: 4000
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.current.show({ 
          severity: "warn", 
          summary: "File không hợp lệ", 
          detail: "Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP)",
          life: 4000
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const quill = editorRef.current?.getQuill();

      try {
        // Show uploading toast
        toast.current.show({ 
          severity: "info", 
          summary: "Đang tải ảnh", 
          detail: "Vui lòng chờ...",
          life: 2000
        });

        const res = await axios.post("http://localhost:8000/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const imageUrl = `http://localhost:8000${res.data.url}`;
        const range = quill.getSelection() || { index: 0 };
        quill.insertEmbed(range.index, "image", imageUrl);
        
        toast.current.show({ 
          severity: "success", 
          summary: "Thành công", 
          detail: "Ảnh đã được thêm vào bài viết",
          life: 3000
        });
        
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.current.show({ 
          severity: "error", 
          summary: "Lỗi tải ảnh", 
          detail: "Không thể tải ảnh lên. Vui lòng thử lại.",
          life: 4000
        });
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const handleSubmit = async () => {
    // Validate input
    if (!title.trim()) {
      toast.current.show({ 
        severity: "warn", 
        summary: "Thiếu tiêu đề", 
        detail: "Vui lòng nhập tiêu đề cho bài viết",
        life: 4000
      });
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      toast.current.show({ 
        severity: "warn", 
        summary: "Thiếu nội dung", 
        detail: "Vui lòng nhập nội dung cho bài viết",
        life: 4000
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Show loading state
      toast.current.show({ 
        severity: "info", 
        summary: "Đang xử lý", 
        detail: "Đang lưu bài viết...",
        life: 2000
      });

      await axios.post("http://localhost:8000/admin/news", {
        title: title.trim(),
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.current.show({ 
        severity: "success", 
        summary: "Thành công", 
        detail: "Bài viết đã được xuất bản thành công!",
        life: 5000
      });
      
      // Reset form
      setTitle("");
      setContent("");
      
    } catch (error) {
      console.error("Error adding news:", error);
      
      if (error.response?.status === 401) {
        toast.current.show({ 
          severity: "error", 
          summary: "Lỗi xác thực", 
          detail: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          life: 5000
        });
      } else if (error.response?.status === 403) {
        toast.current.show({ 
          severity: "error", 
          summary: "Không có quyền", 
          detail: "Bạn không có quyền thêm bài viết.",
          life: 5000
        });
      } else {
        toast.current.show({ 
          severity: "error", 
          summary: "Lỗi hệ thống", 
          detail: "Không thể xuất bản bài viết. Vui lòng thử lại sau.",
          life: 5000
        });
      }
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="add-news-page">
        <Toast ref={toast} />
        
        <div className="content-container">
          <div className="page-header">
            <h1 className="page-title">
              📝 Thêm bài viết mới
            </h1>
            <p className="page-subtitle">Tạo và xuất bản tin tức, thông báo mới cho trang chủ</p>
          </div>

          <div className="form-container">
            <div className="form-group">
              <div className="title-input-wrapper">
                <FloatLabel>
                  <InputText
                    id="news-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="news-title-input"
                  />
                  <label htmlFor="news-title">Tiêu đề bài viết</label>
                </FloatLabel>
              </div>
              <div className="form-hint">Nhập tiêu đề thu hút và mô tả rõ nội dung bài viết</div>
            </div>

            <div className="editor-container">
              <label className="editor-label">Nội dung bài viết</label>
              <div className="editor-wrapper">
                <Editor
                  ref={editorRef}
                  value={content}
                  onTextChange={(e) => setContent(e.htmlValue)}
                  modules={modules}
                  placeholder="Nhập nội dung chi tiết của bài viết..."
                />
              </div>
              <div className="form-hint">Sử dụng thanh công cụ để định dạng văn bản và chèn hình ảnh</div>
            </div>

            <div className="form-actions">
              <Button
                label="Xuất bản bài viết"
                icon="pi pi-save"
                className="submit-button"
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim()}
              />
            </div>
          </div>
        </div>
      </div>
      <AdminFooter />
    </>
  );
};

export default AddNewsForm;
