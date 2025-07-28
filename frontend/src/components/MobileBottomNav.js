// Mobile Bottom Navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { 
            icon: 'pi pi-home', 
            label: 'Trang chủ', 
            path: '/student',
            color: '#2196f3'
          },
          { 
            icon: 'pi pi-book', 
            label: 'Chương trình', 
            path: '/student/programs',
            color: '#4caf50'
          },
          { 
            icon: 'pi pi-calendar', 
            label: 'Lịch học', 
            path: '/student/schedule',
            color: '#ff9800'
          },
          { 
            icon: 'pi pi-user', 
            label: 'Hồ sơ', 
            path: '/student/profile',
            color: '#9c27b0'
          }
        ];
      case 'teacher':
        return [
          { 
            icon: 'pi pi-home', 
            label: 'Dashboard', 
            path: '/teacher',
            color: '#2196f3'
          },
          { 
            icon: 'pi pi-calendar', 
            label: 'Lịch dạy', 
            path: '/teacher/schedule',
            color: '#4caf50'
          },
          { 
            icon: 'pi pi-users', 
            label: 'Lớp học', 
            path: '/teacher/classes',
            color: '#ff9800'
          },
          { 
            icon: 'pi pi-user', 
            label: 'Hồ sơ', 
            path: '/teacher/profile',
            color: '#9c27b0'
          }
        ];
      case 'manager':
        return [
          { 
            icon: 'pi pi-home', 
            label: 'Dashboard', 
            path: '/manager',
            color: '#2196f3'
          },
          { 
            icon: 'pi pi-building', 
            label: 'Phòng học', 
            path: '/manager/rooms',
            color: '#4caf50'
          },
          { 
            icon: 'pi pi-calendar', 
            label: 'Lịch học', 
            path: '/manager/schedules',
            color: '#ff9800'
          },
          { 
            icon: 'pi pi-cog', 
            label: 'Cài đặt', 
            path: '/manager/settings',
            color: '#9c27b0'
          }
        ];
      case 'admin':
        return [
          { 
            icon: 'pi pi-home', 
            label: 'Dashboard', 
            path: '/admin',
            color: '#2196f3'
          },
          { 
            icon: 'pi pi-users', 
            label: 'Người dùng', 
            path: '/admin/users',
            color: '#4caf50'
          },
          { 
            icon: 'pi pi-building', 
            label: 'Cơ sở', 
            path: '/admin/facilities',
            color: '#ff9800'
          },
          { 
            icon: 'pi pi-cog', 
            label: 'Cài đặt', 
            path: '/admin/settings',
            color: '#9c27b0'
          }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (navItems.length === 0) {
    return null;
  }

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <button
            key={index}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{
              '--item-color': item.color,
            }}
          >
            <i className={item.icon}></i>
            <span className="nav-label">{item.label}</span>
            {isActive && <div className="active-indicator"></div>}
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
