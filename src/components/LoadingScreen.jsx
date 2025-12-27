import React from 'react';
import { Brain } from 'lucide-react';

/**
 * Loading screen shown during initialization
 */
const LoadingScreen = ({ darkMode, loading, matrixProgress, statusMessage }) => {
  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container center">
        <div className="card loading-card">
          <Brain className="icon-large pulse" />
          <h2>{loading ? 'Loading Word Lists' : 'Initializing System'}</h2>
          {!loading && (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${matrixProgress}%` }} />
              </div>
              <p className="progress-text">{matrixProgress.toFixed(1)}%</p>
            </>
          )}
          <p className="status-message">{statusMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
