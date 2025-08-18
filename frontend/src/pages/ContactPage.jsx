import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ContactPage.css";

const ContactPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: null,
    message: ''
  });
  const toast = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Danh sách nhân sự trung tâm
  const staffList = [
    {
      id: 1,
      name: "Phạm Phương Tâm",
      position: "Giám đốc",
      email: "pptam@ctu.edu.vn",
      phone: "02923 872 222",
      responsibilities: [
        "Phụ trách chung",
        "Công tác Đoàn thể"
      ]
    },
    {
      id: 2,
      name: "Trịnh Trung Hưng",
      position: "Phó Giám đốc",
      email: "trunghung@ctu.edu.vn",
      phone: "02923 650 888",
      responsibilities: [
        "Phụ trách công tác đào tạo hệ VLVH"
      ]
    },
    {
      id: 3,
      name: "Phạm Thị Ngọc Sương",
      position: "Phó Giám đốc",
      email: "ptnsuong@ctu.edu.vn",
      phone: "02923 650 555",
      responsibilities: [
        "Phụ trách công tác đào tạo hệ Từ xa"
      ]
    },
    {
      id: 4,
      name: "Ngô Hồng Phương",
      position: "Chuyên viên Chánh văn phòng",
      email: "ngohongphuong@ctu.edu.vn",
      phone: "02923 734 370",
      responsibilities: [
        "Kế hoạch công tác đơn vị",
        "Tổng hợp, thông báo tuyển sinh các hệ VLVH, Từ xa",
        "Tổng hợp thống kê, báo cáo",
        "Tư vấn tuyển sinh",
        "Phụ trách công tác Công đoàn"
      ]
    },
    {
      id: 5,
      name: "Nguyễn Thị Xuân Trang",
      position: "Chuyên viên Tổ trưởng Tổ VLVH",
      email: "ntxtrang@ctu.edu.vn",
      phone: "02923 831 634",
      responsibilities: [
        "Các công tác liên quan đến đào tạo hệ VLVH",
        "Tiếp nhận và chuyển giao công văn, hồ sơ, đơn từ từ ĐVLK và ngược lại",
        "Phụ trách đề, bài, lưu trữ điểm thi",
        "Phát hành hồ sơ các hệ"
      ]
    },
    {
      id: 6,
      name: "Nguyễn Quốc Đạt",
      position: "Chuyên viên Tổ trưởng Tổ Từ xa",
      email: "nqdat@ctu.edu.vn",
      phone: "02923 872 116",
      responsibilities: [
        "Các công tác liên quan đến đào tạo hệ Từ xa",
        "Quản lý chương trình, kế hoạch, thời khóa biểu hệ đào tạo từ xa",
        "Quản lý điểm thi hệ Từ xa",
        "Bảo lưu, miễn học phần hệ Từ xa",
        "Phụ trách công tác trang thiết bị đơn vị"
      ]
    },
    {
      id: 7,
      name: "Trần Thị Ngọc Hằng",
      position: "Chuyên viên Tổ trưởng Tổ Tài chính",
      email: "ttnhang@ctu.edu.vn",
      phone: "02923 872 116",
      responsibilities: [
        "Cập nhật, kiểm tra sĩ số sinh viên các hệ",
        "Phụ trách hợp đồng đào tạo, thanh quyết toán các hệ",
        "Các công tác tài chính đơn vị"
      ]
    },
    {
      id: 8,
      name: "Ngô Kim Hoa",
      position: "Chuyên viên Thủ quỹ",
      email: "kimhoa@ctu.edu.vn",
      phone: "02923 872 116",
      responsibilities: [
        "Công văn đi - đến",
        "Thủ quỹ đơn vị",
        "Công tác văn phòng phẩm",
        "Công tác sao y bản điểm, văn bằng, chứng chỉ"
      ]
    },
    {
      id: 9,
      name: "Nguyễn Tấn Phát",
      position: "Chuyên viên",
      email: "nguyentanphat@ctu.edu.vn",
      phone: "02923 831 634",
      responsibilities: [
        "Giấy báo trúng tuyển, nhập học các hệ",
        "Quản lý các tài khoản email",
        "Quyết định chuyển trường, lớp, thu nhận, xóa tên sinh viên các hệ",
        "Phụ trách Đoàn Thanh niên"
      ]
    },
    {
      id: 10,
      name: "Võ Minh Trí",
      position: "Chuyên viên",
      email: "vominhtri@ctu.edu.vn",
      phone: "02923 831 634",
      responsibilities: [
        "Quản lý chương trình đào tạo các ngành hệ VLVH",
        "Công tác lập kế hoạch, thời khóa biểu tại trường và các ĐVLK",
        "Quản lý điểm thi hệ VLVH",
        "Xét tốt nghiệp hệ VLVH",
        "Công tác học và thi lại hệ VLVH",
        "Bảo lưu, miễn học phần hệ VLVH"
      ]
    },
    {
      id: 11,
      name: "Trần Thị Kiều Thi",
      position: "Chuyên viên",
      email: "ttkthi@ctu.edu.vn",
      phone: "02923 734 370",
      responsibilities: [
        "Quản lý hồ sơ sinh viên",
        "Quản lý học liệu",
        "Phát hành hồ sơ tuyển sinh các hệ tại trường",
        "Thu nhận lệ phí, học phí các hệ",
        "Thu nhận đăng ký in bảng điểm",
        "Kiểm tra hồ sơ các hệ"
      ]
    },
    {
      id: 12,
      name: "Nguyễn Minh Tân",
      position: "Chuyên viên",
      email: "nmtan@ctu.edu.vn",
      phone: "02923 872 116",
      responsibilities: [
        "Phụ trách và giám sát công tác nhập và quản lí điểm thi hệ Từ xa",
        "Công tác thống kê định kỳ, báo cáo hệ Từ xa theo đề nghị",
        "Công tác học và thi lại hệ Từ xa",
        "Tổ chức xét tốt nghiệp hệ Từ xa",
        "Nhắn tin SMS cho sinh viên và cán bộ giảng dạy"
      ]
    },
    {
      id: 13,
      name: "Lâm Hùng Minh",
      position: "Chuyên viên",
      email: "lhminh@ctu.edu.vn",
      phone: "02923 734 370",
      responsibilities: [
        "Phụ trực công tác trang thiết bị đơn vị",
        "In bảng tên, thẻ sinh viên các hệ",
        "Phụ trách công tác xin giấy phép xuất bản và các ấn phẩm của đơn vị",
        "Quản lí, hỗ trợ và giám sát công tác ghi đĩa hình",
        "Nhập, thống kê và kiểm tra tài sản đơn vị"
      ]
    },
    {
      id: 14,
      name: "Nguyễn Văn Chiến",
      position: "Chuyên viên",
      email: "nvchien@ctu.edu.vn",
      phone: "02923 734 370",
      responsibilities: [
        "Theo dõi kế hoạch và thời khóa biểu các lớp tại trường",
        "Công tác tuyển sinh hệ VLVH: hồ sơ, giấy báo, danh sách, phần mềm, hồ sơ nhập học, tạo mã số sinh viên",
        "Phụ trách quản lí website đơn vị"
      ]
    },
    {
      id: 15,
      name: "Hoàng Ngọc Phượng",
      position: "Chuyên viên",
      email: "hoangngocphuong@ctu.edu.vn",
      phone: "02923 872 116",
      responsibilities: [
        "Theo dõi học phí",
        "Phụ trách văn thư đơn vị",
        "Cấp phát văn bằng"
      ]
    }
  ];

  // Thông tin liên hệ chung
  const generalContact = {
    name: "Trung tâm Đào tạo Liên tục - Đại học Cần Thơ",
    shortName: "TTDTLT - CTU",
    address: "Tầng trệt - Nhà Điều hành, Đại học Cần Thơ - Khu II, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, TP. Cần Thơ",
    phone: "(0292) 3734370 - 3831634",
    email: "ttdtlt@ctu.edu.vn",
    website: "https://ctc.ctu.edu.vn",
    workingHours: {
      weekdays: "Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00",
      saturday: "Thứ 7: 7:30 - 11:30",
      sunday: "Chủ nhật: Nghỉ"
    }
  };

  // Categories for contact form
  const contactCategories = [
    { label: "Tư vấn tuyển sinh", value: "tuyen_sinh" },
    { label: "Thông tin học phí", value: "hoc_phi" },
    { label: "Đào tạo VLVH", value: "vlvh" },
    { label: "Đào tạo từ xa", value: "tu_xa" },
    { label: "Văn bằng - Chứng chỉ", value: "van_bang" },
    { label: "Khiếu nại - Góp ý", value: "khieu_nai" },
    { label: "Khác", value: "khac" }
  ];

  // Template functions for DataTable
  const nameTemplate = (rowData) => {
    return (
      <div className="staff-name">
        <div className="name font-semibold">{rowData.name}</div>
        <div className="position text-sm text-600">{rowData.position}</div>
      </div>
    );
  };

  const contactTemplate = (rowData) => {
    return (
      <div className="staff-contact">
        <div className="contact-item">
          <i className="pi pi-envelope text-orange-500"></i>
          <span className="text-sm">{rowData.email}</span>
        </div>
        <div className="contact-item">
          <i className="pi pi-phone text-blue-500"></i>
          <span className="text-sm">{rowData.phone}</span>
        </div>
      </div>
    );
  };

  const responsibilitiesTemplate = (rowData) => {
    return (
      <div className="responsibilities">
        <ul>
          {rowData.responsibilities.map((resp, index) => (
            <li key={index} className="text-sm mb-1">{resp}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.current.show({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tin nhắn của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất có thể.',
      life: 3000
    });
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: null,
      message: ''
    });
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="contact-page">
      <div className="layout-wrapper">
        <Header />
        <Toast ref={toast} />
        
        <main className="layout-main">
          {/* Hero Banner */}
          <section className="contact-hero">
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className={`hero-text ${isLoaded ? 'loaded' : ''}`}>
                <h1>Thông tin liên hệ</h1>
                <p>Liên hệ với Trung tâm Đào tạo Liên tục - Đại học Cần Thơ</p>
                <div className="hero-contact-quick">
                  <div className="quick-contact-item">
                    <i className="pi pi-phone"></i>
                    <span>{generalContact.phone}</span>
                  </div>
                  <div className="quick-contact-item">
                    <i className="pi pi-envelope"></i>
                    <span>{generalContact.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="section-container">
            {/* Main Content */}
            <div className="contact-content">
              <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                
                {/* Tab 1: Thông tin chung */}
                <TabPanel 
                  header="Thông tin chung" 
                  leftIcon="pi pi-building mr-2"
                >
                  <div className="general-info-grid">
                    <Card className="contact-info-card">
                      <h2 className="section-title">
                        <i className="pi pi-building"></i>
                        {generalContact.name}
                      </h2>
                      
                      <div className="contact-details">
                        <div className="contact-item">
                          <div className="contact-icon">
                            <i className="pi pi-map-marker"></i>
                          </div>
                          <div className="contact-info">
                            <span className="label">Địa chỉ:</span>
                            <span className="value">{generalContact.address}</span>
                          </div>
                        </div>

                        <div className="contact-item">
                          <div className="contact-icon">
                            <i className="pi pi-phone"></i>
                          </div>
                          <div className="contact-info">
                            <span className="label">Điện thoại:</span>
                            <span className="value">{generalContact.phone}</span>
                          </div>
                        </div>

                        <div className="contact-item">
                          <div className="contact-icon">
                            <i className="pi pi-envelope"></i>
                          </div>
                          <div className="contact-info">
                            <span className="label">Email:</span>
                            <span className="value">
                              <a href={`mailto:${generalContact.email}`}>{generalContact.email}</a>
                            </span>
                          </div>
                        </div>

                        <div className="contact-item">
                          <div className="contact-icon">
                            <i className="pi pi-globe"></i>
                          </div>
                          <div className="contact-info">
                            <span className="label">Website:</span>
                            <span className="value">
                              <a href={generalContact.website} target="_blank" rel="noopener noreferrer">
                                ctc.ctu.edu.vn
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="working-hours">
                        <h4><i className="pi pi-clock"></i> Giờ làm việc:</h4>
                        <div className="hours-list">
                          <div className="hours-item">
                            <span className="day">Thứ 2 - Thứ 6:</span>
                            <span className="time">7:30 - 11:30, 13:30 - 17:00</span>
                          </div>
                          <div className="hours-item">
                            <span className="day">Thứ 7:</span>
                            <span className="time">7:30 - 11:30</span>
                          </div>
                          <div className="hours-item">
                            <span className="day">Chủ nhật:</span>
                            <span className="time">Nghỉ</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="location-map">
                      <h3><i className="pi pi-map"></i> Vị trí trên bản đồ</h3>
                      <div className="map-container">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.841615288684!2d105.77181831479827!3d10.029934692823386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a51d60719%3A0x9d76b0035f6d53d0!2sCan%20Tho%20University!5e0!3m2!1sen!2s!4v1645678901234!5m2!1sen!2s"
                          width="100%"
                          height="400"
                          style={{ border: 0, borderRadius: '8px' }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Bản đồ Trung tâm Đào tạo Liên tục - CTU"
                        ></iframe>
                      </div>
                    </Card>
                  </div>
                </TabPanel>

                {/* Tab 2: Danh bạ nhân sự */}
                <TabPanel 
                  header="Danh bạ nhân sự" 
                  leftIcon="pi pi-users mr-2"
                >
                  <Card>
                    <h2 className="section-title">
                      <i className="pi pi-users"></i>
                      Danh sách cán bộ - nhân viên
                    </h2>
                    
                    <DataTable 
                      value={staffList} 
                      className="staff-table"
                      stripedRows
                      responsiveLayout="scroll"
                      paginator
                      rows={10}
                      rowsPerPageOptions={[5, 10, 15]}
                    >
                      <Column 
                        field="name" 
                        header="Họ và tên / Chức vụ"
                        body={nameTemplate}
                        style={{ minWidth: '200px' }}
                        sortable
                      />
                      <Column 
                        field="contact" 
                        header="Thông tin liên hệ"
                        body={contactTemplate}
                        style={{ minWidth: '250px' }}
                      />
                      <Column 
                        field="responsibilities" 
                        header="Nhiệm vụ"
                        body={responsibilitiesTemplate}
                        style={{ minWidth: '350px' }}
                      />
                    </DataTable>
                  </Card>
                </TabPanel>

                {/* Tab 3: Gửi tin nhắn */}
                <TabPanel 
                  header="Gửi tin nhắn" 
                  leftIcon="pi pi-send mr-2"
                >
                  <div className="contact-form-section">
                    <Card>
                      <h2 className="section-title">
                        <i className="pi pi-send"></i>
                        Gửi tin nhắn cho chúng tôi
                      </h2>
                      
                      <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-grid">
                          <div className="form-group">
                            <label htmlFor="name">Họ và tên *</label>
                            <InputText
                              id="name"
                              value={contactForm.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Nhập họ và tên"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <InputText
                              id="email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Nhập địa chỉ email"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <InputText
                              id="phone"
                              value={contactForm.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="category">Loại yêu cầu</label>
                            <Dropdown
                              id="category"
                              value={contactForm.category}
                              options={contactCategories}
                              onChange={(e) => handleInputChange('category', e.value)}
                              placeholder="Chọn loại yêu cầu"
                            />
                          </div>

                          <div className="form-group full-width">
                            <label htmlFor="subject">Tiêu đề *</label>
                            <InputText
                              id="subject"
                              value={contactForm.subject}
                              onChange={(e) => handleInputChange('subject', e.target.value)}
                              placeholder="Nhập tiêu đề tin nhắn"
                              required
                            />
                          </div>

                          <div className="form-group full-width">
                            <label htmlFor="message">Nội dung *</label>
                            <InputTextarea
                              id="message"
                              value={contactForm.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              placeholder="Nhập nội dung tin nhắn..."
                              rows={6}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <Button 
                            type="submit" 
                            label="Gửi tin nhắn" 
                            icon="pi pi-send"
                            className="submit-button"
                          />
                          <Button 
                            type="button" 
                            label="Xóa form" 
                            icon="pi pi-refresh"
                            className="p-button-secondary"
                            onClick={() => setContactForm({
                              name: '', email: '', phone: '', subject: '', category: null, message: ''
                            })}
                          />
                        </div>
                      </form>
                    </Card>

                    <Card className="mt-4">
                      <h3><i className="pi pi-info-circle"></i> Lưu ý khi gửi tin nhắn</h3>
                      <ul className="contact-notes">
                        <li>Vui lòng điền đầy đủ thông tin để chúng tôi có thể phản hồi chính xác</li>
                        <li>Thời gian phản hồi thường trong vòng 24-48 giờ làm việc</li>
                        <li>Đối với các vấn đề cấp bách, vui lòng liên hệ trực tiếp qua số điện thoại</li>
                        <li>Chúng tôi sẽ bảo mật thông tin cá nhân của bạn</li>
                      </ul>
                    </Card>
                  </div>
                </TabPanel>
              </TabView>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default ContactPage;
