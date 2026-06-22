import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid,
  Eye,
  ShoppingBag,
  Bell,
  TrendingUp,
  Search,
} from 'lucide-react';
import ProfileHeader from '../../components/lawyersProfile/ProfileHeader';
import ProfileStats from '../../components/lawyersProfile/ProfileStats';
import ProfileVisitors from '../../components/lawyersProfile/ProfileVisitors';
import ProfileCheckouts from '../../components/lawyersProfile/ProfileCheckouts';
import NotificationFeed from '../../components/lawyersProfile/NotificationFeed';
import ReachAnalytics from '../../components/lawyersProfile/ReachAnalytics';
import SearchAppearances from '../../components/lawyersProfile/SearchAppearances';
import { dummyNotifications, dummyProfileData } from '../../data/lawyersProfileMock';
import '../../components/lawyersProfile/lawyersProfile.css';

const LawyersProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('7days');
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', Icon: LayoutGrid },
    { id: 'visitors', label: 'Visitors', Icon: Eye },
    { id: 'checkouts', label: 'Checkouts', Icon: ShoppingBag },
    { id: 'notifications', label: 'Notifications', Icon: Bell },
    { id: 'analytics', label: 'Analytics', Icon: TrendingUp },
    { id: 'search', label: 'Search', Icon: Search },
  ];

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    fetchProfileData();
  }, [timeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/lawyers-profile/analytics?period=${timeFilter}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      setProfileData(dummyProfileData);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/lawyers-profile/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setNotifications(dummyNotifications);
    }
  };

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  if (loading) {
    return (
      <div className="lp-loading">
        <div className="lp-spinner" />
        <p>Loading insights</p>
      </div>
    );
  }

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h1 className="lp-title">Lawyers Profile</h1>
          <p className="lp-subtitle">
            Monitor your profile performance, visitor activity, and engagement metrics.
          </p>
        </div>

        <div className="lp-time-filter">
          {[
            { id: '24hrs', label: '24h' },
            { id: '7days', label: '7d' },
            { id: '30days', label: '30d' },
            { id: '90days', label: '90d' },
          ].map((item) => (
            <button
              key={item.id}
              className={`lp-filter-btn ${timeFilter === item.id ? 'active' : ''}`}
              onClick={() => setTimeFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ProfileHeader profileData={profileData} />
      <ProfileStats profileData={profileData} />

      <div className="lp-tabs-wrap">
        <div className="lp-tabs">
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                className={`lp-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{tab.label}</span>
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="lp-badge">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="lp-overview-grid">
            <div className="lp-col">
              <ProfileVisitors
                visitors={profileData?.visitors}
                compact
                onViewAll={() => setActiveTab('visitors')}
              />
              <ProfileCheckouts
                checkouts={profileData?.checkouts}
                compact
                onViewAll={() => setActiveTab('checkouts')}
              />
            </div>

            <div className="lp-col">
              <NotificationFeed
                notifications={notifications}
                compact
                onMarkRead={markNotificationRead}
                onViewAll={() => setActiveTab('notifications')}
              />
              <SearchAppearances
                searchData={profileData?.searchAppearances}
                compact
                onViewAll={() => setActiveTab('search')}
              />
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <ProfileVisitors visitors={profileData?.visitors} />
        )}

        {activeTab === 'checkouts' && (
          <ProfileCheckouts checkouts={profileData?.checkouts} />
        )}

        {activeTab === 'notifications' && (
          <NotificationFeed
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
          />
        )}

        {activeTab === 'analytics' && (
          <ReachAnalytics analyticsData={profileData?.analytics} />
        )}

        {activeTab === 'search' && (
          <SearchAppearances searchData={profileData?.searchAppearances} />
        )}
      </div>
    </div>
  );
};

export default LawyersProfile;