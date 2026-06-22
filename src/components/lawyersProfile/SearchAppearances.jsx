import React from 'react';
import { Search, ArrowUpRight } from 'lucide-react';

const SearchAppearances = ({ searchData, compact = false, onViewAll }) => {
  if (!searchData) return null;

  const displayKeywords = compact ? searchData.topKeywords.slice(0, 4) : searchData.topKeywords;
  const maxKeywordCount = Math.max(...(searchData.topKeywords || [{ count: 1 }]).map((i) => i.count));
  const maxDailyCount = Math.max(...(searchData.dailyAppearances || [{ count: 1 }]).map((i) => i.count));

  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-title-row">
          <h3 className="lp-card-title">
            <Search size={18} strokeWidth={2} />
            Search Appearances
          </h3>
          <span className="lp-card-count">{searchData.totalCount.toLocaleString()}</span>
        </div>
      </div>

      {!compact && (
        <div className="lp-section">
          <h4 className="lp-section-title">Daily Appearances</h4>
          <div className="lp-bars">
            {searchData.dailyAppearances.map((day, index) => (
              <div key={index} className="lp-bar-col">
                <div className="lp-bar-box">
                  <div
                    className="lp-bar-fill"
                    style={{ height: `${(day.count / maxDailyCount) * 100}%` }}
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

      <div className="lp-section">
        <h4 className="lp-section-title">Top Keywords</h4>
        <div className="lp-keywords">
          {displayKeywords.map((item, index) => (
            <div key={index} className="lp-keyword-item">
              <div className="lp-rank">#{item.rank}</div>
              <div className="lp-keyword-main">
                <div className="lp-keyword-text">{item.keyword}</div>
                <div className="lp-progress">
                  <div
                    className="lp-progress-fill"
                    style={{ width: `${(item.count / maxKeywordCount) * 100}%` }}
                  />
                </div>
              </div>
              <div className="lp-keyword-count">{item.count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {compact && searchData.topKeywords.length > 4 && (
        <button className="lp-view-all" onClick={onViewAll}>
          View All <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchAppearances;