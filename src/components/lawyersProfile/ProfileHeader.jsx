import React from 'react';
import { BadgeCheck, Star, IdCard, Calendar } from 'lucide-react';

const ProfileHeader = ({ profileData }) => {
  if (!profileData?.lawyer) return null;
  const { lawyer } = profileData;

  const getInitials = (name = '') =>
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="lp-profile-card">
      <div className="lp-banner" />

      <div className="lp-profile-content">
        <div className="lp-avatar-wrap">
          <div className="lp-avatar">
            {lawyer.avatar ? (
              <img src={lawyer.avatar} alt={lawyer.name} />
            ) : (
              <div className="lp-avatar-placeholder">{getInitials(lawyer.name)}</div>
            )}
            {lawyer.verified && (
              <span className="lp-verified">
                <BadgeCheck size={20} fill="#3b82f6" color="#fff" />
              </span>
            )}
          </div>
        </div>

        <div className="lp-profile-info">
          <div className="lp-name-row">
            <h2 className="lp-name">{lawyer.name}</h2>
            <div className="lp-rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{lawyer.rating}</span>
              <span className="lp-muted">· {lawyer.totalReviews} reviews</span>
            </div>
          </div>

          <p className="lp-designation">
            {lawyer.designation} · {lawyer.court}
          </p>

          <div className="lp-tags">
            {lawyer.specializations?.map((item, index) => (
              <span key={index} className="lp-tag">{item}</span>
            ))}
          </div>

          <div className="lp-meta">
            <span className="lp-meta-item">
              <IdCard size={14} />
              Bar Council: {lawyer.barCouncilId}
            </span>
            <span className="lp-meta-item">
              <Calendar size={14} />
              Member since{' '}
              {new Date(lawyer.memberSince).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="lp-strength">
          <div className="lp-strength-top">
            <span>Profile Strength</span>
            <strong>{lawyer.profileStrength}%</strong>
          </div>
          <div className="lp-strength-bar">
            <div
              className="lp-strength-fill"
              style={{ width: `${lawyer.profileStrength}%` }}
            />
          </div>
          {lawyer.profileStrength < 100 && (
            <button className="lp-outline-btn">Complete Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;