import React from 'react';

/**
 * Display card for showing statistics and current best guess
 */
const StatCard = ({ icon: Icon, title, value, meta, isComputing, computeProgress, isPrimary }) => {
  return (
    <div className={`stat-card ${isPrimary ? 'primary' : 'secondary'}`}>
      <div className="stat-header">
        {Icon && <Icon size={16} />}
        <h3>{title}</h3>
      </div>
      {isComputing ? (
        <div className="computing">
          <div className="spinner" />
          <span>Analyzing{computeProgress > 0 && ` ${computeProgress}%`}</span>
        </div>
      ) : (
        <>
          <div className="stat-value">{value || '—'}</div>
          {meta && <div className="stat-meta">{meta}</div>}
        </>
      )}
    </div>
  );
};

export default StatCard;
