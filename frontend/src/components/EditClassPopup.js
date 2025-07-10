import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import axios from "axios";

const EditClassPopup = ({ visible, onHide, classData, onSuccess }) => {
  const [maLop, setMaLop] = useState("");
  const [khoa, setKhoa] = useState("");
  const [heDaoTao, setHeDaoTao] = useState("");
  const [facilityId, setFacilityId] = useState(null);
  const [majorId, setMajorId] = useState(null);

  const [facilities, setFacilities] = useState([]);
  const [majors, setMajors] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const heDaoTaoOptions = [
    { label: "Vừa học vừa làm", value: "vhvl" },
    { label: "Từ xa", value: "tu_xa" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const res1 = await axios.get("http://localhost:8000/admin/facilities", { headers });
        const res2 = await axios.get("http://localhost:8000/admin/majors", { headers });
        setFacilities(res1.data);
        setMajors(res2.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (classData) {
      setMaLop(classData.ma_lop || "");
      setKhoa(classData.khoa || "");
      setHeDaoTao(classData.he_dao_tao || "");
      setFacilityId(classData.facility_id || null);
      setMajorId(classData.major_id || null);
    }
  }, [classData]);

  useEffect(() => {
    if (!visible) {
      setError("");
      setSuccess("");
    }
  }, [visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/admin/classes/${classData.id}`, {
        ma_lop: maLop,
        khoa,
        he_dao_tao: heDaoTao,
        facility_id: facilityId,
        major_id: majorId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Cập nhật lớp thành công!");
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "");
    }
  };

  return (
    <Dialog header="Chỉnh sửa lớp học" visible={visible} style={{ width: "40vw" }} onHide={onHide} modal>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit} className="facility-form">
        <div className="form-group">
          <FloatLabel>
            <InputText id="maLop" value={maLop} onChange={(e) => setMaLop(e.target.value)} />
            <label htmlFor="maLop">Mã lớp</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <InputText id="khoa" value={khoa} onChange={(e) => setKhoa(e.target.value)} />
            <label htmlFor="khoa">Khoá</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <Dropdown
              id="heDaoTao"
              value={heDaoTao}
              options={heDaoTaoOptions}
              onChange={(e) => setHeDaoTao(e.value)}
              placeholder="Chọn hệ đào tạo"
              style={{ width: "100%" }}
            />
            <label htmlFor="heDaoTao">Hệ đào tạo</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <Dropdown
              id="facility"
              value={facilityId}
              options={facilities}
              onChange={(e) => setFacilityId(e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn đơn vị liên kết"
              style={{ width: "100%" }}
            />
            <label htmlFor="facility">Đơn vị liên kết</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <Dropdown
              id="major"
              value={majorId}
              options={majors}
              onChange={(e) => setMajorId(e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn ngành"
              style={{ width: "100%" }}
            />
            <label htmlFor="major">Ngành đào tạo</label>
          </FloatLabel>
        </div>

        <Button label="Lưu thay đổi" className="p-button-sm p-button-outlined" />
      </form>
    </Dialog>
  );
};

export default EditClassPopup;
