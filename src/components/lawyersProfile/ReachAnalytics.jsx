import React from 'react';
import { Activity, Clock, TrendingDown, MapPin, Smartphone, Globe } from 'lucide-react';

const ReachAnalytics = ({ analyticsData }) => {
  if (!analyticsData) return null;
  const maxReach = Math.max(...(analyticsData.weeklyReach || [{ reach: 1 }]).map((i) => i.reach));

  return (
    <div className="lp-analytics-wrap">
      <div className="lp-metrics">
        <div className="lp-metric-card">
          <div className="lp-metric-icon"><Activity size={22} color="#3b82f6" /></div>
          <div>
            <div className="lp-metric-value">{analyticsData.engagementRate}%</div>
            <div className="lp-metric-label">Engagement Rate</div>
          </div>
        </div>
        <div className="lp-metric-card">
          <div className="lp-metric-icon"><Clock size={22} color="#10b981" /></div>
          <div>
            <div className="lp-metric-value">{analyticsData.avgTimeOnProfile}</div>
            <div className="lp-metric-label">Avg. Time on Profile</div>
          </div>
        </div>
        <div className="lp-metric-card">
          <div className="lp-metric-icon"><TrendingDown size={22} color="#ef4444" /></div>
          <div>
            <div className="lp-metric-value">{analyticsData.bounceRate}%</div>
            <div className="lp-metric-label">Bounce Rate</div>
          </div>
        </div>
      </div>

      <div className="lp-analytics-grid">
        <div className="lp-card">
          <div className="lp-card-header">
            <h3 className="lp-card-title">
              <Globe size={18} strokeWidth={2} />
              Weekly Reach
            </h3>
          </div>
          <div className="lp-section">
            <div className="lp-bars">
              {analyticsData.weeklyReach.map((week, index) => (
                <div key={index} className="lp-bar-col">
                  <div className="lp-bar-box">
                    <div
                      className="lp-bar-fill"
                      style={{ height: `${(week.reach / maxReach) * 100}%` }}
                    >
                      <span className="lp-bar-value">{(week.reach / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                  <span className="lp-bar-label">{week.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-card">
          <div className="lp-card-header">
            <h3 className="lp-card-title">
              <MapPin size={18} strokeWidth={2} />
              Top Locations
            </h3>
          </div>
          <div className="lp-section">
            <div className="lp-distribution">
              {analyticsData.topLocations.map((item, index) => (
                <div key={index} className="lp-distribution-item">
                  <div className="lp-distribution-top">
                    <span>{item.city}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="lp-progress">
                    <div className="lp-progress-fill" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-card">
          <div className="lp-card-header">
            <h3 className="lp-card-title">
              <Smartphone size={18} strokeWidth={2} />
              Device Breakdown
            </h3>
          </div>
          <div className="lp-section">
            <div className="lp-distribution">
              {Object.entries(analyticsData.deviceBreakdown).map(([device, percent]) => (
                <div key={device} className="lp-distribution-item">
                  <div className="lp-distribution-top">
                    <span>{device}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="lp-progress">
                    <div className="lp-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachAnalytics;