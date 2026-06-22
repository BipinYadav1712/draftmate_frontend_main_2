import React, { useState } from 'react';
import { Eye, MapPin, Clock, ArrowUpRight } from 'lucide-react';

const ProfileVisitors = ({ visitors, compact = false, onViewAll }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getTypeColor = (type) => {
    switch (type) {
      case 'Client': return '#10b981';
      case 'Lawyer': return '#3b82f6';
      case 'Corporate': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN');
  };

  const filteredVisitors =
    visitors?.recentVisitors?.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    }) || [];

  const displayVisitors = compact ? filteredVisitors.slice(0, 4) : filteredVisitors;
  const maxDaily = Math.max(...(visitors?.dailyVisitors || [{ count: 1 }]).map((i) => i.count));

  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-title-row">
          <h3 className="lp-card-title">
            <Eye size={18} strokeWidth={2} />
            Profile Visitors
          </h3>
          <span className="lp-card-count">{visitors?.totalCount || 0}</span>
        </div>

        {!compact && (
          <div className="lp-card-filters">
            <div className="lp-search-wrap">
              <input
                className="lp-search-input"
                placeholder="Search visitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="lp-chip-group">
              {['all', 'Client', 'Lawyer', 'Corporate', 'Anonymous'].map((type) => (
                <button
                  key={type}
                  className={`lp-chip ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!compact && visitors?.visitorsByType && (
        <div className="lp-section">
          <h4 className="lp-section-title">Visitor Distribution</h4>
          <div className="lp-distribution">
            {Object.entries(visitors.visitorsByType).map(([type, percent]) => (
              <div key={type} className="lp-distribution-item">
                <div className="lp-distribution-top">
                  <span>{type}</span>
                  <span>{percent}%</span>
                </div>
                <div className="lp-progress">
                  <div
                    className="lp-progress-fill"
                    style={{ width: `${percent}%`, background: getTypeColor(type) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!compact && visitors?.dailyVisitors && (
        <div className="lp-section">
          <h4 className="lp-section-title">Daily Trend</h4>
          <div className="lp-bars">
            {visitors.dailyVisitors.map((day, index) => (
              <div key={index} className="lp-bar-col">
                <div className="lp-bar-box">
                  <div
                    className="lp-bar-fill"
                    style={{ height: `${(day.count / maxDaily) * 100}%` }}
                  >
                    <span className="lp-bar-value">{day.count}</span>
                  </div>
                </div>
                <span className="lp-bar-label">
                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lp-list">
        {displayVisitors.map((visitor) => (
          <div key={visitor.id} className="lp-list-item">
            <div className="lp-list-avatar">
              {visitor.avatar ? (
                <img src={visitor.avatar} alt={visitor.name} />
              ) : (
                <div
                  className="lp-list-avatar-inner"
                  style={{
                    background: `${getTypeColor(visitor.type)}15`,
                    color: getTypeColor(visitor.type),
                  }}
                >
                  {getInitials(visitor.name)}
                </div>
              )}
            </div>

            <div className="lp-list-main">
              <div className="lp-list-top">
                <h4 className="lp-list-title">{visitor.name}</h4>
                <span
                  className="lp-pill"
                  style={{
                    background: `${getTypeColor(visitor.type)}12`,
                    color: getTypeColor(visitor.type),
                  }}
                >
                  {visitor.type}
                </span>
              </div>

              <div className="lp-list-sub">
                <span><MapPin size={12} /> {visitor.location}</span>
                <span><Clock size={12} /> {visitor.viewDuration}</span>
                <span>· {visitor.source}</span>
              </div>
            </div>

            <div className="lp-side-info">
              <span className="lp-list-time">{timeAgo(visitor.visitedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {compact && filteredVisitors.length > 4 && (
        <button className="lp-view-all" onClick={onViewAll}>
          View All <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
};

export default ProfileVisitors;