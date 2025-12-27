import React from 'react';
import { Target, Zap } from 'lucide-react';

/**
 * Toggle between Strategic and Greedy search modes
 */
const ModeToggle = ({ searchMode, onModeChange }) => {
  return (
    <div className="mode-toggle-section">
      <div className="mode-toggle">
        <button
          className={`mode-btn ${searchMode === 'strategic' ? 'active' : ''}`}
          onClick={() => onModeChange('strategic')}
          aria-pressed={searchMode === 'strategic'}
        >
          <Target size={16} />
          Strategic
          <span className="mode-desc">Max Information</span>
        </button>
        <button
          className={`mode-btn ${searchMode === 'greedy' ? 'active' : ''}`}
          onClick={() => onModeChange('greedy')}
          aria-pressed={searchMode === 'greedy'}
        >
          <Zap size={16} />
          Greedy
          <span className="mode-desc">Lucky Guess</span>
        </button>
      </div>
      <p className="mode-explanation">
        {searchMode === 'strategic' 
          ? 'Using entire dictionary to maximize entropy reduction. May suggest non-solutions.'
          : 'Only considering possible solutions. May require trial-and-error in endgame.'}
      </p>
    </div>
  );
};

export default ModeToggle;
