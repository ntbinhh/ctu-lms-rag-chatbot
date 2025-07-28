// Enhanced Dashboard Analytics
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';
import { Dropdown } from 'primereact/dropdown';
import apiClient from '../services/apiClient';
import './DashboardAnalytics.css';

const DashboardAnalytics = ({ userRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartData, setChartData] = useState({});

  const periodOptions = [
    { label: 'Tháng này', value: 'month' },
    { label: 'Quý này', value: 'quarter' },
    { label: 'Năm này', value: 'year' },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedPeriod, userRole]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/analytics/dashboard`, {
        params: { period: selectedPeriod, role: userRole }
      });
      setStats(response.data);
      prepareChartData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    // Enrollment trend chart
    const enrollmentData = {
      labels: data.enrollmentTrend?.labels || [],
      datasets: [
        {
          label: 'Số học viên đăng ký',
          data: data.enrollmentTrend?.data || [],
          backgroundColor: 'rgba(12, 77, 162, 0.2)',
          borderColor: '#0c4da2',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Course completion chart
    const completionData = {
      labels: ['Hoàn thành', 'Đang học', 'Bỏ dở'],
      datasets: [
        {
          data: [
            data.courseCompletion?.completed || 0,
            data.courseCompletion?.inProgress || 0,
            data.courseCompletion?.dropped || 0,
          ],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
          borderWidth: 0,
        },
      ],
    };

    // Facility utilization
    const facilityData = {
      labels: data.facilityUtilization?.map(f => f.name) || [],
      datasets: [
        {
          label: 'Tỷ lệ sử dụng (%)',
          data: data.facilityUtilization?.map(f => f.utilization) || [],
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4caf50',
          borderWidth: 1,
        },
      ],
    };

    setChartData({
      enrollment: enrollmentData,
      completion: completionData,
      facility: facilityData,
    });
  };

  const getStatCards = () => {
    const baseStats = [
      {
        title: 'Tổng số học viên',
        value: stats?.totalStudents || 0,
        icon: 'pi pi-users',
        color: '#2196f3',
        trend: stats?.trends?.students || 0,
      },
      {
        title: 'Chương trình đào tạo',
        value: stats?.totalPrograms || 0,
        icon: 'pi pi-book',
        color: '#4caf50',
        trend: stats?.trends?.programs || 0,
      },
      {
        title: 'Cơ sở liên kết',
        value: stats?.totalFacilities || 0,
        icon: 'pi pi-building',
        color: '#ff9800',
        trend: stats?.trends?.facilities || 0,
      },
    ];

    // Add role-specific stats
    switch (userRole) {
      case 'admin':
        baseStats.push({
          title: 'Giảng viên',
          value: stats?.totalTeachers || 0,
          icon: 'pi pi-user-edit',
          color: '#9c27b0',
          trend: stats?.trends?.teachers || 0,
        });
        break;
      case 'manager':
        baseStats.push({
          title: 'Phòng học',
          value: stats?.totalRooms || 0,
          icon: 'pi pi-home',
          color: '#607d8b',
          trend: stats?.trends?.rooms || 0,
        });
        break;
      case 'teacher':
        baseStats.push({
          title: 'Lớp học của tôi',
          value: stats?.myClasses || 0,
          icon: 'pi pi-graduation-cap',
          color: '#795548',
          trend: stats?.trends?.myClasses || 0,
        });
        break;
      case 'student':
        baseStats.push({
          title: 'Môn học đang học',
          value: stats?.enrolledCourses || 0,
          icon: 'pi pi-calendar',
          color: '#e91e63',
          trend: stats?.trends?.enrolledCourses || 0,
        });
        break;
    }

    return baseStats;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-analytics">
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="stat-card">
              <Skeleton width="100%" height="120px" />
            </Card>
          ))}
        </div>
        <div className="charts-grid">
          <Card className="chart-card">
            <Skeleton width="100%" height="300px" />
          </Card>
          <Card className="chart-card">
            <Skeleton width="100%" height="300px" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-analytics">
      <div className="dashboard-header">
        <h2>📊 Thống kê tổng quan</h2>
        <Dropdown
          value={selectedPeriod}
          options={periodOptions}
          onChange={(e) => setSelectedPeriod(e.value)}
          className="period-selector"
        />
      </div>

      <div className="stats-grid">
        {getStatCards().map((stat, index) => (
          <Card key={index} className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <i className={stat.icon}></i>
              </div>
              <div className="stat-details">
                <div className="stat-value">{stat.value.toLocaleString()}</div>
                <div className="stat-title">{stat.title}</div>
                {stat.trend !== 0 && (
                  <div className={`stat-trend ${stat.trend > 0 ? 'positive' : 'negative'}`}>
                    <i className={`pi ${stat.trend > 0 ? 'pi-arrow-up' : 'pi-arrow-down'}`}></i>
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="charts-grid">
        {chartData.enrollment && (
          <Card className="chart-card">
            <h3>📈 Xu hướng đăng ký</h3>
            <div className="chart-container">
              <Chart
                type="line"
                data={chartData.enrollment}
                options={chartOptions}
              />
            </div>
          </Card>
        )}

        {chartData.completion && (
          <Card className="chart-card">
            <h3>🎯 Tình trạng học tập</h3>
            <div className="chart-container">
              <Chart
                type="doughnut"
                data={chartData.completion}
                options={pieChartOptions}
              />
            </div>
          </Card>
        )}

        {chartData.facility && userRole === 'admin' && (
          <Card className="chart-card full-width">
            <h3>🏢 Tỷ lệ sử dụng cơ sở</h3>
            <div className="chart-container">
              <Chart
                type="bar"
                data={chartData.facility}
                options={chartOptions}
              />
            </div>
          </Card>
        )}
      </div>

      {stats?.recentActivities && (
        <Card className="activity-card">
          <h3>🔔 Hoạt động gần đây</h3>
          <div className="activity-list">
            {stats.recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={activity.icon}></i>
                </div>
                <div className="activity-details">
                  <div className="activity-text">{activity.message}</div>
                  <div className="activity-time">{activity.timestamp}</div>
                </div>
                <Badge
                  value={activity.type}
                  severity={activity.type === 'success' ? 'success' : 'info'}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardAnalytics;
