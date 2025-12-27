import React from 'react';

/**
 * Display list of top candidate guesses with their entropy scores
 */
const CandidatesList = ({ 
  candidates, 
  searchMode, 
  filterSolutions, 
  onFilterChange, 
  onWordSelect 
}) => {
  const displayedCandidates = filterSolutions 
    ? candidates.filter(c => c.isSolution)
    : candidates;

  if (candidates.length === 0) return null;

  return (
    <div className="candidates-section">
      <div className="candidates-header">
        <h3>
          {searchMode === 'strategic' ? 'Top 5 Strategic Moves' : 'Top 5 Solutions to Try'}
        </h3>
        {searchMode === 'strategic' && (
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={filterSolutions}
              onChange={(e) => onFilterChange(e.target.checked)}
            />
            <span>Hide burner words</span>
          </label>
        )}
      </div>
      <div className="candidates-list">
        {displayedCandidates.map((candidate, index) => (
          <div 
            key={candidate.word} 
            className={`candidate-item ${candidate.isSolution ? 'is-solution' : ''}`}
            onClick={() => onWordSelect(candidate.word)}
            role="button"
            tabIndex={0}
          >
            <div className="candidate-rank">#{index + 1}</div>
            <div className="candidate-info">
              <div className="candidate-word">
                {candidate.word}
                {!candidate.isSolution && searchMode === 'strategic' && (
                  <span className="burner-tag">BURNER</span>
                )}
              </div>
              <div className="candidate-meta">
                {candidate.isSolution 
                  ? `${candidate.winProbability}% win chance` 
                  : 'Pure information play'} • 
                {' '}{candidate.rawEntropy.toFixed(3)} bits
              </div>
            </div>
          </div>
        ))}
      </div>
      {searchMode === 'strategic' && filterSolutions && displayedCandidates.length === 0 && (
        <p className="no-results">
          All top moves are burner words (non-solutions). 
          This is correct strategic play for maximum information gain.
        </p>
      )}
    </div>
  );
};

export default CandidatesList;
