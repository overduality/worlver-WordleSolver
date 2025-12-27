import React from 'react';

/**
 * Error screen shown when word lists fail to load
 */
const ErrorScreen = ({ darkMode, error }) => {
  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container center">
        <div className="card error-card">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Words</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
