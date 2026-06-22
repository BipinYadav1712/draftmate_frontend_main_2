import React, { useState } from 'react';
import {
  Bell,
  Eye,
  ShoppingBag,
  MessageSquare,
  Star,
  Award,
  TrendingUp,
  ChevronRight,
  BellOff,
} from 'lucide-react';

const NotificationFeed = ({
  notifications = [],
  compact = false,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
}) => {
  const [filterType, setFilterType] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'profile_view', label: 'Views' },
    { id: 'checkout', label: 'Checkouts' },
    { id: 'message', label: 'Messages' },
    { id: 'review', label: 'Reviews' },
    { id: 'milestone', label: 'Milestones' },
    { id: 'search_rank', label: 'Rankings' },
  ];

  const getIcon = (type) => {
    const props = { size: 18, strokeWidth: 2 };
    switch (type) {
      case 'profile_view': return <Eye {...props} />;
      case 'checkout': return <ShoppingBag {...props} />;
      case 'message': return <MessageSquare {...props} />;
      case 'review': return <Star {...props} />;
      case 'milestone': return <Award {...props} />;
      case 'search_rank': return <TrendingUp {...props} />;
      default: return <Bell {...props} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'profile_view': return '#3b82f6';
      case 'checkout': return '#10b981';
      case 'message': return '#f59e0b';
      case 'review': return '#eab308';
      case 'milestone': return '#ec4899';
      case 'search_rank': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter(
    (item) => filterType === 'all' || item.type === filterType
  );

  const displayNotifications = compact
    ? filteredNotifications.slice(0, 5)
    : filteredNotifications;

  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-title-row">
          <h3 className="lp-card-title">
            <Bell size={18} strokeWidth={2} />
            Notifications
            {unreadCount > 0 && <span className="lp-unread-pill">{unreadCount}</span>}
          </h3>
          {!compact && unreadCount > 0 && (
            <button className="lp-link-btn" onClick={onMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {!compact && (
          <div className="lp-card-filters">
            <div className="lp-chip-group">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`lp-chip ${filterType === filter.id ? 'active' : ''}`}
                  onClick={() => setFilterType(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lp-notif-list">
        {displayNotifications.map((item) => {
          const iconColor = getIconColor(item.type);
          return (
            <div
              key={item.id}
              className={`lp-notif-item ${!item.read ? 'unread' : ''}`}
              onClick={() => !item.read && onMarkRead?.(item.id)}
            >
              <div
                className="lp-notif-icon"
                style={{ background: `${iconColor}12`, color: iconColor }}
              >
                {getIcon(item.type)}
                {!item.read && <span className="lp-dot" />}
              </div>

              <div className="lp-notif-content">
                <h4 className="lp-notif-title">{item.title}</h4>
                <p className="lp-notif-desc">{item.description}</p>
                <span className="lp-notif-time">{timeAgo(item.timestamp)}</span>
              </div>

              {item.actionUrl && (
                <button className="lp-notif-arrow">
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          );
        })}

        {displayNotifications.length === 0 && (
          <div className="lp-empty">
            <BellOff size={32} />
            <p>No notifications</p>
          </div>
        )}
      </div>

      {compact && filteredNotifications.length > 5 && (
        <button className="lp-view-all" onClick={onViewAll}>
          View All
        </button>
      )}
    </div>
  );
};

export default NotificationFeed;