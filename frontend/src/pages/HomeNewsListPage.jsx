import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Paginator } from "primereact/paginator";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import "./HomeNewsListPage.css";

const NewsListPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterBy, setFilterBy] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(9);
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  
  const toast = React.useRef(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteNews');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:8000/news")
      .then(res => {
        setNews(res.data);
        setLoading(false);
      })
      .catch(() => {
        setNews([]);
        setLoading(false);
        showToast("error", "Lỗi", "Không thể tải tin tức");
      });
  }, []);

  // Enhanced utility functions
  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const toggleFavorite = useCallback((newsId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId];
      
      localStorage.setItem('favoriteNews', JSON.stringify(newFavorites));
      showToast(
        'success', 
        'Thành công', 
        newFavorites.includes(newsId) ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'
      );
      
      return newFavorites;
    });
  }, [showToast]);

  const extractThumbnail = (html) => {
    const imgMatch = html.match(/<img.*?src=["'](.*?)["']/);
    return imgMatch ? imgMatch[1] : "https://via.placeholder.com/600x350?text=Không+có+ảnh";
  };

  const extractText = (html, max = 180) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.slice(0, max) + (text.length > max ? "..." : "");
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Vừa mới";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return formatDate(dateString);
  };

  // Enhanced filtering and sorting
  const filteredAndSortedNews = useMemo(() => {
    let filtered = [...news];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extractText(item.content).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      if (filterBy === "favorites") {
        filtered = filtered.filter(item => favorites.includes(item.id));
      }
      // Add more filter categories as needed
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange[0] && itemDate <= dateRange[1];
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
        case "oldest":
          return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [news, searchTerm, sortBy, filterBy, dateRange, favorites]);

  // Pagination
  const paginatedNews = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredAndSortedNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedNews, currentPage, itemsPerPage]);

  const onPageChange = (event) => {
    setCurrentPage(event.page);
  };

  // Sort and filter options
  const sortOptions = [
    { label: "Mới nhất", value: "latest" },
    { label: "Cũ nhất", value: "oldest" },
    { label: "Theo tên", value: "title" }
  ];

  const filterOptions = [
    { label: "Tất cả", value: "all" },
    { label: "Yêu thích", value: "favorites" }
  ];

  return (
    <>
      <Header />
      <Toast ref={toast} />
      
      <main className="news-list-container">
        {/* Hero Section */}
        <div className="news-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="pi pi-newspaper"></i>
              Tin tức & sự kiện
            </h1>
            <p className="hero-subtitle">
              Cập nhật những thông tin mới nhất từ Trường Đại học Cần Thơ
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{filteredAndSortedNews.length}</span>
                <span className="stat-label">Bài viết</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{favorites.length}</span>
                <span className="stat-label">Yêu thích</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Section */}
        <Card className="filter-card">
          <div className="filter-header">
            <h3 className="filter-title">
              <i className="pi pi-filter"></i>
              Bộ lọc và tìm kiếm
            </h3>
            <Button
              icon={`pi pi-${viewMode === 'grid' ? 'list' : 'th-large'}`}
              label={viewMode === 'grid' ? 'Dạng danh sách' : 'Dạng lưới'}
              className="p-button-outlined"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
          </div>
          
          {/* Quick Filters */}
          <div className="quick-filters">
            <div 
              className={`quick-filter-chip ${filterBy === 'all' ? 'active' : ''}`}
              onClick={() => setFilterBy('all')}
            >
              <i className="pi pi-list"></i> Tất cả
            </div>
            <div 
              className={`quick-filter-chip ${filterBy === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilterBy('favorites')}
            >
              <i className="pi pi-heart"></i> Yêu thích ({favorites.length})
            </div>
            <div 
              className={`quick-filter-chip ${sortBy === 'latest' ? 'active' : ''}`}
              onClick={() => setSortBy('latest')}
            >
              <i className="pi pi-clock"></i> Mới nhất
            </div>
            <div 
              className={`quick-filter-chip ${dateRange ? 'active' : ''}`}
              onClick={() => {
                if (!dateRange) {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setDateRange([weekAgo, today]);
                } else {
                  setDateRange(null);
                }
              }}
            >
              <i className="pi pi-calendar"></i> 7 ngày qua
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="main-filter-row">
              <div className="search-group">
                <label className="filter-label">Tìm kiếm</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập từ khóa tìm kiếm..."
                    className={`search-input ${searchTerm ? 'filter-active' : ''}`}
                  />
                </span>
              </div>
              
              <div className="filter-section">
                <label className="filter-label">Sắp xếp</label>
                <Dropdown
                  value={sortBy}
                  options={sortOptions}
                  onChange={(e) => setSortBy(e.value)}
                  placeholder="Chọn cách sắp xếp"
                  className={`sort-dropdown ${sortBy !== 'latest' ? 'filter-active' : ''}`}
                />
              </div>
              
              <div className="filter-section">
                <label className="filter-label">Lọc theo</label>
                <Dropdown
                  value={filterBy}
                  options={filterOptions}
                  onChange={(e) => setFilterBy(e.value)}
                  placeholder="Chọn bộ lọc"
                  className={`filter-dropdown ${filterBy !== 'all' ? 'filter-active' : ''}`}
                />
              </div>
              
              <div className="filter-section">
                <label className="filter-label">Thời gian</label>
                <Calendar
                  value={dateRange}
                  onChange={(e) => setDateRange(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Chọn khoảng thời gian"
                  className={`date-filter ${dateRange ? 'filter-active' : ''}`}
                  showIcon
                  dateFormat="dd/mm/yy"
                />
              </div>
              
              <div className="action-group">
                <Button
                  icon="pi pi-times"
                  label="Đặt lại"
                  className="p-button-outlined"
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("latest");
                    setFilterBy("all");
                    setDateRange(null);
                    setCurrentPage(0);
                  }}
                  disabled={!searchTerm && sortBy === 'latest' && filterBy === 'all' && !dateRange}
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="filter-results">
            <span className="results-text">
              Hiển thị <span className="results-count">{filteredAndSortedNews.length}</span> kết quả
              {searchTerm && (
                <> cho "<strong>{searchTerm}</strong>"</>
              )}
            </span>
            {(searchTerm || filterBy !== 'all' || dateRange || sortBy !== 'latest') && (
              <Button
                icon="pi pi-filter-slash"
                label="Xóa tất cả bộ lọc"
                className="p-button-text p-button-sm"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("latest");
                  setFilterBy("all");
                  setDateRange(null);
                  setCurrentPage(0);
                }}
              />
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="news-loading">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="news-skeleton">
                <Skeleton width="100%" height="200px" className="mb-3" />
                <Skeleton width="80%" height="20px" className="mb-2" />
                <Skeleton width="60%" height="20px" />
              </Card>
            ))}
          </div>
        )}

        {/* News Content */}
        {!loading && (
          <>
            {paginatedNews.length > 0 ? (
              <>
                <div className={`news-content ${viewMode}-view`}>
                  {paginatedNews.map((item) => (
                    <Card key={item.id} className="news-item-card">
                      <div className="news-item-content">
                        <div className="news-image-container">
                          <img
                            src={extractThumbnail(item.content)}
                            alt={item.title}
                            className="news-image"
                            loading="lazy"
                          />
                          <Button
                            icon={favorites.includes(item.id) ? "pi pi-heart-fill" : "pi pi-heart"}
                            className={`favorite-btn ${favorites.includes(item.id) ? 'favorite-active' : ''}`}
                            onClick={() => toggleFavorite(item.id)}
                            tooltip={favorites.includes(item.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                          />
                        </div>
                        
                        <div className="news-text-content">
                          <div className="news-meta">
                            <Tag value="TIN TỨC" severity="info" />
                            <small className="news-date">
                              <i className="pi pi-clock"></i>
                              {getTimeAgo(item.created_at || new Date())}
                            </small>
                          </div>
                          
                          <h3 className="news-title">
                            <Link to={`/news/${item.id}`}>
                              {item.title}
                            </Link>
                          </h3>
                          
                          <p className="news-excerpt">
                            {extractText(item.content)}
                          </p>
                          
                          <div className="news-actions">
                            <Link to={`/news/${item.id}`} className="read-more-btn">
                              <i className="pi pi-arrow-right"></i>
                              Đọc tiếp
                            </Link>
                            <Button
                              icon="pi pi-share-alt"
                              className="p-button-rounded p-button-text"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: item.title,
                                    url: `${window.location.origin}/news/${item.id}`
                                  });
                                } else {
                                  navigator.clipboard.writeText(`${window.location.origin}/news/${item.id}`);
                                  showToast("success", "Thành công", "Đã sao chép đường dẫn");
                                }
                              }}
                              tooltip="Chia sẻ"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {filteredAndSortedNews.length > itemsPerPage && (
                  <Paginator
                    first={currentPage * itemsPerPage}
                    rows={itemsPerPage}
                    totalRecords={filteredAndSortedNews.length}
                    onPageChange={onPageChange}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} bài viết"
                    className="news-paginator"
                  />
                )}
              </>
            ) : (
              <Card className="empty-state">
                <div className="empty-content">
                  <i className="pi pi-search empty-icon"></i>
                  <h3>Không tìm thấy tin tức</h3>
                  <p>Không có bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
                  <Button
                    label="Xóa bộ lọc"
                    icon="pi pi-times"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterBy("all");
                      setDateRange(null);
                    }}
                    className="p-button-outlined"
                  />
                </div>
              </Card>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default NewsListPage;