import React from 'react';
import { Target } from 'lucide-react';

/**
 * Display remaining solutions when count is low (≤5)
 */
const EndgameSection = ({ 
  remainingSolutions, 
  searchMode, 
  topCandidates,
  onWordSelect 
}) => {
  if (remainingSolutions.length > 5 || remainingSolutions.length <= 1) {
    return null;
  }

  return (
    <div className="endgame-section">
      <div className="endgame-header">
        <div>
          <h2>{remainingSolutions.length} Remaining Solutions</h2>
          <p>
            {searchMode === 'strategic' 
              ? 'Strategic move shown below may not be one of these (burner word)'
              : 'Best guess shown below is one of these words'}
          </p>
        </div>
      </div>
      <div className="solution-cards">
        {remainingSolutions.map((word, idx) => {
          const candidate = topCandidates.find(c => c.word === word);
          const winProb = candidate 
            ? parseFloat(candidate.winProbability) 
            : (100 / remainingSolutions.length);
          
          return (
            <div 
              key={idx} 
              className="solution-card"
              onClick={() => onWordSelect(word)}
              role="button"
              tabIndex={0}
            >
              <div className="solution-word">{word}</div>
              <div className="solution-meta">
                <span className="win-prob">{winProb.toFixed(1)}% if guessed</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EndgameSection;
