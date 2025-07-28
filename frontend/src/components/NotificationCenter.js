// Enhanced Notification System
import React, { useState, useEffect, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import apiClient from '../services/apiClient';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Setup WebSocket for real-time notifications
    setupWebSocket();
    return () => {
      if (window.notificationWS) {
        window.notificationWS.close();
      }
    };
  }, []);

  const setupWebSocket = () => {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/notifications';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔔 Notification WebSocket connected');
      };

      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        handleNewNotification(notification);
      };

      ws.onclose = () => {
        console.log('🔔 Notification WebSocket disconnected');
        // Reconnect after 3 seconds
        setTimeout(setupWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };

      window.notificationWS = ws;
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }

    // Play notification sound
    playNotificationSound(notification.type);
  };

  const playNotificationSound = (type) => {
    try {
      const audio = new Audio();
      switch (type) {
        case 'urgent':
          audio.src = '/sounds/urgent.mp3';
          break;
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const fetchNotifications = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications', {
        params: { limit: 20, offset }
      });
      
      if (offset === 0) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadMoreNotifications = () => {
    if (!loading && hasMore) {
      fetchNotifications(notifications.length);
    }
  };

  const getNotificationIcon = (type, category) => {
    const iconMap = {
      'schedule': 'pi-calendar',
      'grade': 'pi-star',
      'announcement': 'pi-megaphone',
      'assignment': 'pi-file-edit',
      'system': 'pi-cog',
      'message': 'pi-envelope',
      'alert': 'pi-exclamation-triangle',
      'success': 'pi-check-circle',
      'warning': 'pi-exclamation-circle',
      'error': 'pi-times-circle',
    };
    return iconMap[category] || iconMap[type] || 'pi-bell';
  };

  const getNotificationSeverity = (type, priority) => {
    if (priority === 'urgent' || type === 'error') return 'danger';
    if (priority === 'high' || type === 'warning') return 'warning';
    if (type === 'success') return 'success';
    return 'info';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return time.toLocaleDateString('vi-VN');
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="notification-center">
      <Button
        icon="pi pi-bell"
        className="p-button-rounded p-button-text notification-button"
        onClick={(e) => {
          overlayRef.current.toggle(e);
          requestNotificationPermission();
        }}
      >
        {unreadCount > 0 && (
          <Badge
            value={unreadCount > 99 ? '99+' : unreadCount}
            severity="danger"
            className="notification-badge"
          />
        )}
      </Button>

      <OverlayPanel
        ref={overlayRef}
        showCloseIcon
        dismissable
        className="notification-overlay"
        style={{ width: '400px', maxHeight: '600px' }}
      >
        <div className="notification-header">
          <h3>🔔 Thông báo</h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <Button
                label="Đánh dấu tất cả đã đọc"
                icon="pi pi-check"
                className="p-button-sm p-button-text"
                onClick={markAllAsRead}
              />
            )}
          </div>
        </div>

        <div className="notification-list">
          {loading && notifications.length === 0 ? (
            <div className="notification-skeletons">
              {[1, 2, 3].map((i) => (
                <div key={i} className="notification-skeleton">
                  <Skeleton shape="circle" size="3rem" />
                  <div className="skeleton-content">
                    <Skeleton width="70%" height="1rem" />
                    <Skeleton width="100%" height="0.8rem" />
                    <Skeleton width="50%" height="0.6rem" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <i className="pi pi-bell-slash"></i>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <Avatar
                    icon={`pi ${getNotificationIcon(notification.type, notification.category)}`}
                    className={`notification-avatar ${notification.type}`}
                    size="large"
                  />
                  
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      <Tag
                        value={notification.priority || 'normal'}
                        severity={getNotificationSeverity(notification.type, notification.priority)}
                        className="notification-priority"
                      />
                    </div>
                    
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.sender && (
                        <span className="notification-sender">
                          từ {notification.sender}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notification-actions-menu">
                    <Button
                      icon="pi pi-times"
                      className="p-button-rounded p-button-text p-button-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      tooltip="Xóa thông báo"
                    />
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="load-more">
                  <Button
                    label={loading ? "Đang tải..." : "Tải thêm"}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-chevron-down"}
                    className="p-button-text"
                    onClick={loadMoreNotifications}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <Divider />
        
        <div className="notification-footer">
          <Button
            label="Xem tất cả thông báo"
            icon="pi pi-external-link"
            className="p-button-text"
            onClick={() => {
              overlayRef.current.hide();
              window.location.href = '/notifications';
            }}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default NotificationCenter;
