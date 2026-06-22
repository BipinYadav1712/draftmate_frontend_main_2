import React from 'react';
import {
  Eye,
  Users,
  ShoppingBag,
  Search,
  Phone,
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const ProfileStats = ({ profileData }) => {
  if (!profileData?.stats) return null;
  const { stats } = profileData;

  const cards = [
    { id: 'views', label: 'Total Views', value: stats.totalViews, change: stats.viewsChange, Icon: Eye, color: '#3b82f6' },
    { id: 'visitors', label: 'Unique Visitors', value: stats.uniqueVisitors, change: stats.visitorsChange, Icon: Users, color: '#10b981' },
    { id: 'checkouts', label: 'Checkouts', value: stats.profileCheckouts, change: stats.checkoutsChange, Icon: ShoppingBag, color: '#f59e0b' },
    { id: 'search', label: 'Search Appearances', value: stats.searchAppearancesCount, change: stats.searchChange, Icon: Search, color: '#8b5cf6' },
    { id: 'contacts', label: 'Contact Clicks', value: stats.contactClicks, change: stats.contactChange, Icon: Phone, color: '#ef4444' },
    { id: 'saved', label: 'Saved', value: stats.savedByUsers, change: stats.savedChange, Icon: Bookmark, color: '#06b6d4' },
  ];

  const formatNumber = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="lp-stats-grid">
      {cards.map((card) => {
        const Icon = card.Icon;
        const ArrowIcon = card.change >= 0 ? ArrowUpRight : ArrowDownRight;
        return (
          <div key={card.id} className="lp-stat-card">
            <div className="lp-stat-top">
              <div className="lp-stat-icon" style={{ background: `${card.color}12`, color: card.color }}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <span className={`lp-stat-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                <ArrowIcon size={12} strokeWidth={2.5} />
                {Math.abs(card.change)}%
              </span>
            </div>

            <div className="lp-stat-value">{formatNumber(card.value)}</div>
            <div className="lp-stat-label">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;