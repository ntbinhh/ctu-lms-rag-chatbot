import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../AdminFooter";
import "../FacilitiesListPage.css";

const AddCourseForm = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credit, setCredit] = useState("");
  const [syllabusUrl, setSyllabusUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/courses", {
        code,
        name,
        credit: parseInt(credit),
        syllabus_url: syllabusUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Đã thêm học phần thành công!");
      setCode("");
      setName("");
      setCredit("");
      setSyllabusUrl("");
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  const handleUpload = async ({ files }) => {
    const file = files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8000/admin/courses/upload_excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadMessage(`✅ Thêm: ${res.data.added}, Bỏ qua: ${res.data.skipped}`);
    } catch (err) {
      setUploadMessage("❌ Upload thất bại: " + (err.response?.data?.detail || "Lỗi không xác định"));
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Học Phần</h2>

        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <InputText id="code" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: "100%" }} />
              <label htmlFor="code">Mã học phần</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
              <label htmlFor="name">Tên học phần</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText
                id="credit"
                value={credit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCredit(value);
                  }
                }}
                style={{ width: "100%" }}
              />
              <label htmlFor="credit">Số tín chỉ</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText
                id="syllabusUrl"
                value={syllabusUrl}
                onChange={(e) => setSyllabusUrl(e.target.value)}
                style={{ width: "100%" }}
              />
              <label htmlFor="syllabusUrl">Link đề cương chi tiết</label>
            </FloatLabel>
          </div>

          <Button
            label="Lưu thủ công"
            className="submit-btn p-button-sm p-button-outlined"
            disabled={!code || !name || !credit}
          />
        </form>

        {/* <hr style={{ margin: "2rem 0" }} />

        <h3>Hoặc Upload file Excel</h3>
        {uploadMessage && <div className="alert">{uploadMessage}</div>}

        <div style={{ marginTop: "1rem" }}>
          <FileUpload
            name="file"
            mode="basic"
            accept=".xlsx"
            customUpload
            uploadHandler={handleUpload}
            chooseLabel="Chọn file Excel"
            style={{ marginBottom: "1rem" }}
          />

          <Button
            label="📥 Tải file mẫu Excel"
            icon="pi pi-download"
            className="p-button-sm p-button-secondary"
            onClick={() => window.open("/sample_courses.xlsx", "_blank")}
          />
        </div> */}
      </div>
      <AdminFooter />
    </>
  );
};

export default AddCourseForm;
