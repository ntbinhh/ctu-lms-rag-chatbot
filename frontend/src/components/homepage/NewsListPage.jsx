import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";
import "./NewsListPage.css";

const NewsListPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useRef(null);
  const navigate = useNavigate();

  // Memoized filtered news list
  const filteredNews = useMemo(() => {
    if (!searchTerm) return newsList;
    
    return newsList.filter(news => 
      news.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [newsList, searchTerm]);

  // Memoized news statistics
  const newsStats = useMemo(() => {
    const totalNews = newsList.length;
    const recentNews = newsList.filter(news => {
      const newsDate = new Date(news.created_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return newsDate >= oneWeekAgo;
    }).length;
    
    return {
      totalNews,
      recentNews,
      searchResults: filteredNews.length
    };
  }, [newsList, filteredNews]);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 4000 });
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/news");
      setNewsList(res.data);
      showToast("success", "Thành công", `Đã tải ${res.data.length} bài viết`);
    } catch (error) {
      console.error("Error fetching news:", error);
      showToast("error", "Lỗi", "Không thể tải danh sách tin tức");
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?\nHành động này không thể hoàn tác.`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("success", "Đã xóa", "Bài viết đã được xóa thành công");
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      if (error.response?.status === 401) {
        showToast("error", "Lỗi xác thực", "Phiên đăng nhập đã hết hạn");
      } else if (error.response?.status === 403) {
        showToast("error", "Không có quyền", "Bạn không có quyền xóa bài viết");
      } else {
        showToast("error", "Lỗi", "Không thể xóa bài viết");
      }
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const truncateText = (text, length = 150) => {
    const plainText = stripHtml(text);
    if (plainText.length <= length) return plainText;
    return plainText.substring(0, length) + "...";
  };

  useEffect(() => {
    fetchNews();
  }, []);  // fetchNews is stable and doesn't change

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      
      <div className="news-list-page">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="page-title">
                <i className="pi pi-newspaper"></i>
                Quản lý tin tức
                <small style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>CTU</small>
              </h1>
              <p className="page-subtitle">
                Hệ thống quản lý tin tức và thông báo của Trường Đại học Cần Thơ
                <br />
                Tạo, chỉnh sửa và quản lý nội dung thông tin cho trang chủ
              </p>
              {newsStats && (
                <div className="news-stats">
                  <div className="stat-item">
                    <span className="stat-number">{newsStats.totalNews}</span>
                    <span className="stat-label">Tổng bài viết</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{newsStats.recentNews}</span>
                    <span className="stat-label">Bài mới (7 ngày)</span>
                  </div>
                  {searchTerm && (
                    <div className="stat-item">
                      <span className="stat-number">{newsStats.searchResults}</span>
                      <span className="stat-label">Kết quả tìm kiếm</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <div>
              <h3 className="section-title">
                <i className="pi pi-list"></i>
                Danh sách bài viết
              </h3>
            </div>
            
            <div className="action-buttons">
              <div className="search-container">
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm bài viết..."
                    className="search-input"
                    disabled={loading}
                  />
                </span>
              </div>
              
              <Button
                icon="pi pi-refresh"
                label="Làm mới"
                className="refresh-button"
                onClick={fetchNews}
                disabled={loading}
              />
              
              <Button
                icon="pi pi-plus"
                label="Thêm bài viết"
                className="add-button"
                onClick={() => navigate("/admin/homepage/news/add")}
                disabled={loading}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-content">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                <p>Đang tải danh sách bài viết...</p>
              </div>
            </div>
          ) : (
            /* News Content */
            <div className="news-container">
              {filteredNews.length === 0 ? (
                <div className="empty-state">
                  <i className="pi pi-info-circle empty-icon"></i>
                  <h3>{searchTerm ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}</h3>
                  <p>
                    {searchTerm 
                      ? `Không có bài viết nào phù hợp với từ khóa "${searchTerm}".`
                      : "Hệ thống chưa có bài viết nào. Hãy tạo bài viết đầu tiên."
                    }
                  </p>
                  <div className="empty-actions">
                    {searchTerm ? (
                      <Button
                        label="Xóa tìm kiếm"
                        icon="pi pi-times"
                        onClick={() => setSearchTerm("")}
                        className="refresh-button"
                      />
                    ) : (
                      <Button
                        label="Tạo bài viết mới"
                        icon="pi pi-plus"
                        onClick={() => navigate("/admin/homepage/news/add")}
                        className="add-button"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="news-grid">
                  {filteredNews.map((news) => (
                    <div key={news.id} className="news-card">
                      {news.image && (
                        <img
                          src={`http://localhost:8000${news.image}`}
                          alt={news.title}
                          className="news-image"
                          loading="lazy"
                        />
                      )}
                      
                      <div className="news-content">
                        <h3 className="news-title">{news.title}</h3>
                        
                        <div className="news-meta">
                          <div className="news-date">
                            <i className="pi pi-calendar"></i>
                            <span>{formatDate(news.created_at)}</span>
                          </div>
                        </div>
                        
                        <p className="news-excerpt">
                          {truncateText(news.content, 120)}
                        </p>
                        
                        <div className="news-actions">
                          <Button
                            label="Xem"
                            icon="pi pi-eye"
                            className="view-button"
                            onClick={() => window.open(`/news/${news.id}`, '_blank')}
                            tooltip="Xem bài viết trên trang chủ"
                          />
                          
                          <Button
                            label="Sửa"
                            icon="pi pi-pencil"
                            className="edit-button"
                            onClick={() => navigate(`/admin/homepage/news/edit/${news.id}`)}
                            tooltip="Chỉnh sửa bài viết"
                          />
                          
                          <Button
                            label="Xóa"
                            icon="pi pi-trash"
                            className="delete-button"
                            onClick={() => handleDelete(news.id, news.title)}
                            tooltip="Xóa bài viết"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AdminFooter />
    </>
  );
};

export default NewsListPage;
