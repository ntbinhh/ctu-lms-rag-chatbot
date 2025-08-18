import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { ProgressBar } from "primereact/progressbar";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";
import "./SliderImageUpload.css";

const SliderImageUpload = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, totalSize: 0 });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const toast = useRef(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/home/slider-images");
      const imageList = res.data || [];
      console.log("Fetched images:", imageList);
      setImages(imageList);
      
      // Calculate stats
      setStats({
        total: imageList.length,
        totalSize: imageList.length * 2.5 // Estimate 2.5MB per image
      });
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể tải danh sách ảnh",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

const handleUpload = async (event) => {
  const { files, options } = event;
  const token = localStorage.getItem("token");
  
  if (!files || files.length === 0) return;

  setLoading(true);
  setUploadProgress(0);
  
  const totalFiles = files.length;
  let uploadedFiles = 0;

  for (let file of files) {
    // File validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: `File ${file.name} quá lớn. Tối đa 10MB.`,
        life: 3000,
      });
      continue;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/admin/slider-images/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      uploadedFiles++;
      setUploadProgress((uploadedFiles / totalFiles) * 100);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: `Tải ảnh thất bại: ${file.name}`,
        life: 3000,
      });
    }
  }

  // Clear UI
  if (options && typeof options.clear === "function") {
    options.clear();
  }

  setLoading(false);
  setUploadProgress(0);

  if (uploadedFiles > 0) {
    toast.current?.show({
      severity: "success",
      summary: "Thành công",
      detail: `Đã tải lên ${uploadedFiles}/${totalFiles} ảnh`,
      life: 3000,
    });
  }

  fetchImages();
};
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/slider-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.current?.show({ 
        severity: "success", 
        summary: "Thành công", 
        detail: "Ảnh đã được xóa thành công", 
        life: 3000 
      });
      
      fetchImages();
    } catch (error) {
      console.error("Delete error:", error);
      toast.current?.show({ 
        severity: "error", 
        summary: "Lỗi", 
        detail: "Không thể xóa ảnh", 
        life: 3000 
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setImageToDelete(null);
    }
  };

  const confirmDelete = (image) => {
    setImageToDelete(image);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="slider-admin-container">
        <Toast ref={toast} />
        
        {/* Header Section */}
        <div className="slider-admin-header">
          <div className="slider-header-info">
            <h1>Quản lý Slider Homepage</h1>
            <p>Quản lý hình ảnh slideshow hiển thị trên trang chủ website</p>
          </div>
          
          <div className="slider-header-stats">
            <Card className="slider-stat-card">
              <div className="slider-stat-content">
                <div className="slider-stat-number">{stats.total}</div>
                <div className="slider-stat-label">Tổng ảnh</div>
              </div>
            </Card>
            <Card className="slider-stat-card">
              <div className="slider-stat-content">
                <div className="slider-stat-number">{stats.totalSize.toFixed(1)}MB</div>
                <div className="slider-stat-label">Dung lượng</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Upload Section */}
        <Panel header="📤 Tải lên ảnh mới" className="slider-upload-panel">
          <div className="slider-upload-section">
            <FileUpload
              name="files"
              multiple
              customUpload
              uploadHandler={handleUpload}
              accept="image/*"
              mode="advanced"
              auto={false}
              chooseLabel="Chọn ảnh"
              uploadLabel="Tải lên"
              cancelLabel="Hủy"
              className="slider-modern-upload"
              disabled={loading}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="slider-upload-progress">
                <ProgressBar value={uploadProgress} />
                <span>{uploadProgress.toFixed(0)}% hoàn thành</span>
              </div>
            )}
            
            <div className="slider-upload-hints">
              <div className="slider-hint-item">
                <i className="pi pi-info-circle"></i>
                <span>Kích thước khuyến nghị: <strong>2560 x 734px</strong></span>
              </div>
              <div className="slider-hint-item">
                <i className="pi pi-file"></i>
                <span>Định dạng: JPG, PNG, WebP</span>
              </div>
              <div className="slider-hint-item">
                <i className="pi pi-cloud"></i>
                <span>Dung lượng tối đa: <strong>10MB/ảnh</strong></span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Images Gallery */}
        <Panel header={`📁 Thư viện ảnh (${images.length})`} className="slider-gallery-panel">
          {loading && images.length === 0 ? (
            <div className="slider-loading-state">
              <ProgressBar mode="indeterminate" />
              <p>Đang tải ảnh...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="slider-empty-state">
              <i className="pi pi-image"></i>
              <h3>Chưa có ảnh nào</h3>
              <p>Hãy tải lên ảnh đầu tiên cho slider homepage</p>
            </div>
          ) : (
            <div className="slider-images-grid">
              {images.map((img) => (
                <Card key={img.id} className="slider-image-card">
                  <div className="slider-image-container">
                    <Image
                      src={`http://localhost:8000${img.url}?v=${img.id}`}
                      alt="Slider"
                      width="100%"
                      height="280px"
                      preview
                      className="slider-preview-image"
                      imageStyle={{ 
                        width: '100%', 
                        height: '280px', 
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={() => {
                        console.error("Image load error:", `http://localhost:8000${img.url}`);
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", `http://localhost:8000${img.url}`);
                      }}
                    />
                    
                    <div className="slider-image-overlay">
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-sm"
                        tooltip="Xóa ảnh"
                        onClick={() => confirmDelete(img)}
                      />
                    </div>
                  </div>
                  
                  <div className="slider-image-info">
                    <div className="slider-image-id">
                      <Badge value={`ID: ${img.id}`} severity="info" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Panel>

        {/* Delete Confirmation Dialog */}
        <Dialog
          header="Xác nhận xóa ảnh"
          visible={showDeleteDialog}
          onHide={() => setShowDeleteDialog(false)}
          footer={
            <div>
              <Button
                label="Hủy"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowDeleteDialog(false)}
              />
              <Button
                label="Xóa"
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => handleDelete(imageToDelete?.id)}
                loading={loading}
              />
            </div>
          }
        >
          <div className="delete-confirmation">
            <i className="pi pi-exclamation-triangle"></i>
            <p>Bạn có chắc chắn muốn xóa ảnh này không?</p>
            {imageToDelete && (
              <div className="delete-preview">
                <img 
                  src={`http://localhost:8000${imageToDelete.url}`} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                />
                <p><strong>ID:</strong> {imageToDelete.id}</p>
              </div>
            )}
          </div>
        </Dialog>
      </div>
      <AdminFooter />
    </>
  );
};

export default SliderImageUpload;
