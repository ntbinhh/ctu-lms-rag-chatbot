import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import ManagerHeader from "../manager/ManagerHeader";

const AddRoomForm = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("theory");
  const [building, setBuilding] = useState("");

  const [isMainUniversity, setIsMainUniversity] = useState(false); // ✅ để kiểm tra cơ sở
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const roomTypes = [
    { label: "Phòng lý thuyết", value: "theory" },
    { label: "Phòng thực hành", value: "computer" },
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.facility_id === 47) {
          setIsMainUniversity(true);
        }
      } catch (err) {
        console.error("Không thể xác định cơ sở quản lý.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/manager/rooms/add",
        {
          room_number: roomNumber,
          capacity: parseInt(capacity),
          type: type,
          building: isMainUniversity ? building : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("✅ Đã thêm phòng học thành công!");
      setRoomNumber("");
      setCapacity("");
      setType("theory");
      setBuilding("");
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm phòng học thất bại");
    }
  };

  return (
    <div>
      <ManagerHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm phòng học</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          {isMainUniversity && (
            <div className="form-group">
              <FloatLabel>
                <InputText
                  id="building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                />
                <label htmlFor="building">Nhà học </label>
              </FloatLabel>
            </div>
          )}

          <div className="form-group">
            <FloatLabel>
              <InputText
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
              <label htmlFor="roomNumber">Số phòng</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText
                id="capacity"
                keyfilter="int"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <label htmlFor="capacity">Sức chứa</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <Dropdown
                inputId="type"
                value={type}
                options={roomTypes}
                onChange={(e) => setType(e.value)}
                style={{ width: "100%" }}
              />
              <label htmlFor="type">Loại phòng</label>
            </FloatLabel>
          </div>

          

          <Button
            label="Lưu phòng học"
            className="submit-btn p-button-sm p-button-outlined"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default AddRoomForm;
