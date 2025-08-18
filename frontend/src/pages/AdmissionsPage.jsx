import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Timeline } from "primereact/timeline";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Accordion, AccordionTab } from "primereact/accordion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./AdmissionsPage.css";

const AdmissionsPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Dữ liệu phương thức tuyển sinh
  const admissionMethods = [
    {
      id: 1,
      name: "Phương thức 1: Tuyển thẳng và ưu tiên",
      description: "Dành cho học sinh đạt giải trong các kỳ thi học sinh giỏi, olympiad hoặc có thành tích xuất sắc",
      requirements: [
        "Giải nhất, nhì, ba các kỳ thi học sinh giỏi cấp tỉnh trở lên",
        "Giải trong các cuộc thi Olympic quốc tế",
        "Tốt nghiệp THPT loại xuất sắc với điểm trung bình ≥ 8.5"
      ],
      documents: [
        "Bằng tốt nghiệp THPT",
        "Học bạ THPT",
        "Giấy chứng nhận giải thưởng",
        "Đơn đăng ký xét tuyển"
      ],
      deadline: "31/05/2025",
      status: "active"
    },
    {
      id: 2,
      name: "Phương thức 2: Xét tuyển dựa trên kết quả thi tốt nghiệp THPT",
      description: "Xét tuyển dựa trên điểm thi tốt nghiệp THPT theo tổ hợp môn",
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Đạt điểm sàn xét tuyển của từng ngành",
        "Đăng ký nguyện vọng đúng hạn"
      ],
      combinations: [
        { name: "A00", subjects: "Toán, Lý, Hóa", majors: "Kỹ thuật, Công nghệ" },
        { name: "A01", subjects: "Toán, Lý, Anh", majors: "Công nghệ thông tin" },
        { name: "D01", subjects: "Văn, Toán, Anh", majors: "Kinh tế, Quản trị" }
      ],
      deadline: "30/07/2025",
      status: "active"
    },
    {
      id: 3,
      name: "Phương thức 3: Xét tuyển học bạ THPT",
      description: "Xét tuyển dựa trên điểm trung bình học bạ 3 năm THPT",
      requirements: [
        "Điểm trung bình chung 3 năm ≥ 7.0",
        "Điểm trung bình các môn xét tuyển ≥ 7.5",
        "Hạnh kiểm tốt trở lên"
      ],
      advantages: [
        "Biết kết quả sớm",
        "Không phụ thuộc vào kết quả thi",
        "Ưu tiên học sinh học giỏi ổn định"
      ],
      deadline: "15/06/2025",
      status: "active"
    },
    {
      id: 4,
      name: "Phương thức 4: Xét tuyển dựa trên kết quả VSAT",
      description: "Sử dụng kết quả kỳ thi đánh giá năng lực VSAT",
      requirements: [
        "Tham gia kỳ thi VSAT",
        "Đạt điểm chuẩn theo từng ngành",
        "Tốt nghiệp THPT"
      ],
      benefits: [
        "Đề thi chuẩn quốc tế",
        "Đánh giá tư duy logic",
        "Phù hợp với xu hướng hiện đại"
      ],
      deadline: "20/08/2025",
      status: "active"
    },
    {
      id: 5,
      name: "Phương thức 5: Chương trình CTTT & CTLC",
      description: "Tuyển sinh cho các chương trình chất lượng cao và tiên tiến",
      requirements: [
        "Điểm xét tuyển cao hơn chương trình chuẩn",
        "Khả năng tiếng Anh tốt",
        "Cam kết học phí cao hơn"
      ],
      programs: [
        "Chương trình chất lượng cao (CLC)",
        "Chương trình tiên tiến (CTTT)",
        "Chương trình liên kết quốc tế"
      ],
      deadline: "25/08/2025",
      status: "active"
    }
  ];

  // Timeline data
  const timelineEvents = [
    {
      status: "Mở đầu",
      date: "01/03/2025",
      icon: "pi pi-flag",
      color: "#0c4da2",
      title: "Công bố thông tin tuyển sinh",
      description: "Phát hành brochure, thông báo chính thức"
    },
    {
      status: "Đăng ký",
      date: "15/03 - 31/05",
      icon: "pi pi-user-edit",
      color: "#f97316",
      title: "Tiếp nhận hồ sơ đăng ký",
      description: "Các phương thức tuyển sinh mở đăng ký"
    },
    {
      status: "Xét tuyển",
      date: "01/06 - 30/08",
      icon: "pi pi-check-circle",
      color: "#f59e0b",
      title: "Quá trình xét tuyển",
      description: "Xét hồ sơ, công bố kết quả từng đợt"
    },
    {
      status: "Xác nhận",
      date: "01/09 - 15/09",
      icon: "pi pi-verified",
      color: "#ea580c",
      title: "Xác nhận nhập học",
      description: "Sinh viên xác nhận nhập học và đóng học phí"
    },
    {
      status: "Khai giảng",
      date: "20/09/2025",
      icon: "pi pi-graduation-cap",
      color: "#dc2626",
      title: "Khai giảng năm học mới",
      description: "Lễ khai giảng và bắt đầu học tập"
    }
  ];

  // Tuition fees data
  const tuitionFees = [
    {
      program: "Chương trình chuẩn - Sư phạm",
      fee: "22.200.000",
      unit: "VNĐ/năm",
      total: "22.200.000 VNĐ/năm",
      note: "Các ngành sư phạm (Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Anh, Pháp, Giáo dục...)"
    },
    {
      program: "Chương trình chuẩn - Khoa học xã hội",
      fee: "22.900.000",
      unit: "VNĐ/năm", 
      total: "22.900.000 VNĐ/năm",
      note: "Kinh tế, Luật, Quản trị, Marketing, Ngôn ngữ Anh, Báo chí..."
    },
    {
      program: "Chương trình chuẩn - Khoa học tự nhiên",
      fee: "23.300.000 - 25.900.000",
      unit: "VNĐ/năm",
      total: "23.300.000 - 25.900.000 VNĐ/năm",
      note: "Sinh học, Hóa học, Công nghệ thông tin, Kỹ thuật, Nông nghiệp, Thủy sản..."
    },
    {
      program: "Chương trình chất lượng cao (CTCLC)",
      fee: "37.000.000 - 40.000.000",
      unit: "VNĐ/năm",
      total: "37.000.000 - 40.000.000 VNĐ/năm",
      note: "Chương trình nâng cao với tiêu chuẩn quốc tế, cơ sở vật chất hiện đại"
    },
    {
      program: "Chương trình tiên tiến (CTTT)",
      fee: "40.000.000",
      unit: "VNĐ/năm",
      total: "40.000.000 VNĐ/năm",
      note: "Nuôi trồng thủy sản CTTT - chương trình đào tạo quốc tế"
    }
  ];

  // Contact info
  const contactInfo = [
    {
      type: "Địa chỉ",
      value: "Tầng trệt - Nhà Điều hành Trường Đại học Cần Thơ, Khu II, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, TP. Cần Thơ",
      icon: "pi pi-map-marker"
    },
    {
      type: "Điện thoại",
      value: "(0292) 3734370 - 3831634",
      icon: "pi pi-phone"
    },
    {
      type: "Email",
      value: "ttlkdt@ctu.edu.vn",
      icon: "pi pi-envelope"
    },
    {
      type: "Website",
      value: "www.ctu.edu.vn",
      icon: "pi pi-globe"
    }
  ];

  const customizeMarker = (item) => {
    return (
      <span 
        className="custom-marker p-2 border-circle z-1 border-3 surface-border" 
        style={{ backgroundColor: item.color, color: '#fff' }}
      >
        <i className={item.icon}></i>
      </span>
    );
  };

  const feeTemplate = (rowData) => {
    return (
      <div className="fee-cell">
        <div className="fee-amount">{rowData.fee}</div>
        <div className="fee-unit text-sm text-500">{rowData.unit}</div>
      </div>
    );
  };

  const programTemplate = (rowData) => {
    return (
      <div className="program-cell">
        <div className="program-name font-semibold">{rowData.program}</div>
        <div className="program-note text-sm text-600 mt-1">{rowData.note}</div>
      </div>
    );
  };

  return (
    <div className="admissions-page">
      <div className="layout-wrapper">
        <Header />
        <Toast ref={toast} />
        
        <main className="layout-main">
        {/* Hero Banner */}
        <section className="admissions-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className={`hero-text ${isLoaded ? 'loaded' : ''}`}>
              <h1>Tuyển sinh 2025</h1>
              <p>Cùng khám phá cơ hội học tập tại Trung tâm Liên kết Đào tạo - Đại học Cần Thơ</p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Phương thức tuyển sinh</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">20+</span>
                  <span className="stat-label">Ngành đào tạo</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Sinh viên có việc làm</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-container">
          {/* Main Content */}
          <div className="admissions-content">
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
              
              {/* Tab 1: Phương thức tuyển sinh */}
              <TabPanel 
                header="Phương thức tuyển sinh" 
                leftIcon="pi pi-list mr-2"
              >
                <div className="methods-grid">
                  {admissionMethods.map((method) => (
                    <Card key={method.id} className="method-card">
                      <div className="method-header">
                        <div className="method-number">
                          <Badge value={method.id} />
                        </div>
                        <div className="method-status">
                          <Tag 
                            value={method.status === 'active' ? 'Đang mở' : 'Đã đóng'} 
                            severity={method.status === 'active' ? 'success' : 'danger'} 
                          />
                        </div>
                      </div>
                      
                      <h3>{method.name}</h3>
                      <p className="method-description">{method.description}</p>
                      
                      <Divider />
                      
                      <div className="method-details">
                        <h4><i className="pi pi-check-circle"></i> Yêu cầu:</h4>
                        <ul>
                          {method.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>

                        {method.combinations && (
                          <>
                            <h4><i className="pi pi-bookmark"></i> Tổ hợp xét tuyển:</h4>
                            <div className="combinations">
                              {method.combinations.map((combo, index) => (
                                <div key={index} className="combo-item">
                                  <Chip label={combo.name} className="combo-name" />
                                  <span className="combo-subjects">{combo.subjects}</span>
                                  <small className="combo-majors">{combo.majors}</small>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {method.documents && (
                          <>
                            <h4><i className="pi pi-file"></i> Hồ sơ cần thiết:</h4>
                            <ul>
                              {method.documents.map((doc, index) => (
                                <li key={index}>{doc}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        {(method.advantages || method.benefits || method.programs) && (
                          <>
                            <h4><i className="pi pi-star"></i> Ưu điểm:</h4>
                            <ul>
                              {(method.advantages || method.benefits || method.programs)?.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                      
                      <div className="method-footer">
                        <div className="deadline">
                          <i className="pi pi-calendar"></i>
                          <span>Hạn nộp: {method.deadline}</span>
                        </div>
                        <Button 
                          label="Đăng ký ngay" 
                          icon="pi pi-external-link" 
                          className="p-button-sm" 
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </TabPanel>

              {/* Tab 2: Lịch tuyển sinh */}
              <TabPanel 
                header="Lịch tuyển sinh" 
                leftIcon="pi pi-calendar mr-2"
              >
                <Card className="timeline-card">
                  <h2 className="section-title">
                    <i className="pi pi-clock"></i>
                    Lịch trình tuyển sinh năm 2025
                  </h2>
                  
                  <Timeline 
                    value={timelineEvents} 
                    opposite={(item) => (
                      <div className="timeline-date">
                        <Badge value={item.date} className="date-badge" />
                      </div>
                    )}
                    content={(item) => (
                      <Card className="timeline-event">
                        <div className="event-content">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </Card>
                    )}
                    marker={customizeMarker}
                    className="customized-timeline"
                  />
                </Card>
              </TabPanel>

              {/* Tab 3: Học phí */}
              <TabPanel 
                header="Học phí" 
                leftIcon="pi pi-dollar mr-2"
              >
                <div className="fees-section">
                  <Card>
                    <h2 className="section-title">
                      <i className="pi pi-money-bill"></i>
                      Bảng học phí năm học 2025-2026
                    </h2>
                    
                    <DataTable 
                      value={tuitionFees} 
                      className="fees-table"
                      stripedRows
                      responsiveLayout="scroll"
                    >
                      <Column 
                        field="program" 
                        header="Chương trình đào tạo"
                        body={programTemplate}
                        style={{ minWidth: '250px' }}
                      />
                      <Column 
                        field="fee" 
                        header="Học phí năm học"
                        body={feeTemplate}
                        style={{ width: '300px', textAlign: 'center' }}
                      />
                    </DataTable>

                    <div className="fee-notes mt-4">
                      <h4><i className="pi pi-info-circle"></i> Lưu ý quan trọng:</h4>
                      <ul>
                        <li>Học phí được tính theo năm học và có thể đóng theo từng học kỳ</li>
                        <li>Học phí khác nhau tùy theo chương trình đào tạo và nhóm ngành</li>
                        <li>Sinh viên có hoàn cảnh khó khăn được xem xét miễn giảm học phí</li>
                        <li>Các khoản phí khác: phí đăng ký xét tuyển, lệ phí thi, phí ký túc xá</li>
                        <li>Học phí chương trình CTCLC và CTTT cao hơn chương trình chuẩn</li>
                        <li>Học phí có thể thay đổi theo quyết định của Hội đồng Trường</li>
                      </ul>
                    </div>
                  </Card>

                  <Card className="mt-4">
                    <h3><i className="pi pi-gift"></i> Chính sách học bổng</h3>
                    <div className="scholarship-grid">
                      <div className="scholarship-item">
                        <h4>Học bổng khuyến khích học tập</h4>
                        <p>Dành cho sinh viên đạt điểm xét tuyển cao</p>
                        <Badge value="50% - 100%" severity="success" />
                      </div>
                      <div className="scholarship-item">
                        <h4>Học bổng xã hội</h4>
                        <p>Hỗ trợ sinh viên có hoàn cảnh khó khăn</p>
                        <Badge value="30% - 70%" severity="info" />
                      </div>
                      <div className="scholarship-item">
                        <h4>Học bổng tài năng</h4>
                        <p>Sinh viên có thành tích xuất sắc trong học tập</p>
                        <Badge value="100%" severity="warning" />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              {/* Tab 4: Thông tin liên hệ */}
              <TabPanel 
                header="Liên hệ" 
                leftIcon="pi pi-phone mr-2"
              >
                <div className="contact-section">
                  <div className="contact-grid">
                    <Card className="contact-info">
                      <h2 className="section-title">
                        <i className="pi pi-building"></i>
                        Phòng Đào tạo
                      </h2>
                      
                      <div className="contact-list">
                        {contactInfo.map((info, index) => (
                          <div key={index} className="contact-item">
                            <div className="contact-icon">
                              <i className={info.icon}></i>
                            </div>
                            <div className="contact-details">
                              <span className="contact-type">{info.type}:</span>
                              <span className="contact-value">{info.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Divider />

                      <div className="office-hours">
                        <h4><i className="pi pi-clock"></i> Giờ làm việc:</h4>
                        <div className="hours-grid">
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
                      <div className="map-placeholder">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.841615288684!2d105.77181831479827!3d10.029934692823386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a51d60719%3A0x9d76b0035f6d53d0!2sCan%20Tho%20University!5e0!3m2!1sen!2s!4v1645678901234!5m2!1sen!2s"
                          width="100%"
                          height="300"
                          style={{ border: 0, borderRadius: '8px' }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Bản đồ Đại học Cần Thơ"
                        ></iframe>
                      </div>
                    </Card>
                  </div>

                  <Card className="mt-4">
                    <h3><i className="pi pi-question-circle"></i> Câu hỏi thường gặp</h3>
                    <Accordion>
                      <AccordionTab header="Làm thế nào để đăng ký xét tuyển?">
                        <p>
                          Thí sinh có thể đăng ký xét tuyển online tại website chính thức của trường 
                          hoặc nộp hồ sơ trực tiếp tại Phòng Đào tạo. Hồ sơ bao gồm đơn đăng ký, 
                          bằng tốt nghiệp THPT, học bạ và các giấy tờ liên quan.
                        </p>
                      </AccordionTab>
                      
                      <AccordionTab header="Khi nào có kết quả xét tuyển?">
                        <p>
                          Kết quả xét tuyển được công bố theo từng đợt, thường vào cuối tháng 7 
                          và đầu tháng 8. Thí sinh có thể tra cứu kết quả trên website hoặc 
                          nhận thông báo qua email/SMS đã đăng ký.
                        </p>
                      </AccordionTab>
                      
                      <AccordionTab header="Có những hình thức hỗ trợ học phí nào?">
                        <p>
                          Trường có nhiều chính sách hỗ trợ như học bổng khuyến khích học tập, 
                          học bổng xã hội, vay vốn ngân hàng ưu đãi. Sinh viên có hoàn cảnh 
                          khó khăn có thể được miễn giảm học phí lên đến 100%.
                        </p>
                      </AccordionTab>
                      
                      <AccordionTab header="Cơ sở vật chất và ký túc xá như thế nào?">
                        <p>
                          Trường có cơ sở vật chất hiện đại với các phòng học được trang bị 
                          đầy đủ thiết bị. Ký túc xá có sức chứa hơn 1000 sinh viên với đầy đủ 
                          tiện nghi như wifi, điều hòa, tủ lạnh.
                        </p>
                      </AccordionTab>
                    </Accordion>
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

export default AdmissionsPage;
