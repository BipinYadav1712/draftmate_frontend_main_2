import React, { useState } from 'react';
import { ShoppingBag, MapPin, ArrowUpRight, Eye, Reply } from 'lucide-react';

const ProfileCheckouts = ({ checkouts, compact = false, onViewAll }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Enquiry': return { bg: '#fef3c7', text: '#92400e' };
      case 'Scheduled': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Pending': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Responded': return { bg: '#d1fae5', text: '#065f46' };
      case 'Downloaded': return { bg: '#e0e7ff', text: '#3730a3' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredCheckouts =
    checkouts?.recentCheckouts?.filter(
      (item) => statusFilter === 'all' || item.status === statusFilter
    ) || [];

  const displayCheckouts = compact ? filteredCheckouts.slice(0, 3) : filteredCheckouts;

  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-title-row">
          <h3 className="lp-card-title">
            <ShoppingBag size={18} strokeWidth={2} />
            Profile Checkouts
          </h3>
          <span className="lp-card-count">{checkouts?.totalCount || 0}</span>
        </div>

        {!compact && (
          <div className="lp-card-filters">
            <div className="lp-chip-group">
              {['all', 'Enquiry', 'Scheduled', 'Pending', 'Responded', 'Downloaded'].map(
                (status) => (
                  <button
                    key={status}
                    className={`lp-chip ${statusFilter === status ? 'active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {!compact && checkouts?.checkoutsByAction && (
        <div className="lp-section">
          <h4 className="lp-section-title">Action Breakdown</h4>
          <div className="lp-action-grid">
            {Object.entries(checkouts.checkoutsByAction).map(([action, value]) => (
              <div key={action} className="lp-action-box">
                <div className="lp-action-value">{value}%</div>
                <div className="lp-action-label">{action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lp-list">
        {displayCheckouts.map((checkout) => {
          const statusStyle = getStatusStyle(checkout.status);
          return (
            <div key={checkout.id} className="lp-list-item">
              <div className="lp-list-avatar">
                <div className="lp-list-avatar-inner lp-avatar-gold">
                  {getInitials(checkout.name)}
                </div>
              </div>

              <div className="lp-list-main">
                <div className="lp-list-top">
                  <h4 className="lp-list-title">{checkout.name}</h4>
                  <span
                    className="lp-pill"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {checkout.status}
                  </span>
                </div>

                <div className="lp-list-sub">
                  <span>{checkout.action}</span>
                  <span>·</span>
                  <span>{checkout.caseType}</span>
                </div>

                {checkout.message && <p className="lp-message">"{checkout.message}"</p>}

                <div className="lp-list-sub">
                  <span><MapPin size={12} /> {checkout.location}</span>
                </div>
              </div>

              <div className="lp-side-info">
                <span className="lp-list-time">{timeAgo(checkout.checkedOutAt)}</span>
                {!compact && (
                  <div className="lp-inline-buttons">
                    <button className="lp-icon-btn"><Eye size={14} /></button>
                    <button className="lp-icon-btn"><Reply size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {compact && filteredCheckouts.length > 3 && (
        <button className="lp-view-all" onClick={onViewAll}>
          View All <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
};

export default ProfileCheckouts;