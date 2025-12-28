import React from 'react';

/**
 * Display list of top candidate guesses - SIDEBAR VERSION (Top 20)
 * Top 1 candidate gets blue highlight
 */
const CandidatesList = ({ 
  candidates, 
  searchMode, 
  filterSolutions, 
  onFilterChange, 
  onWordSelect 
}) => {
  const displayedCandidates = filterSolutions 
    ? candidates.filter(c => !c.isSolution).slice(0, 20) 
    : candidates.slice(0, 20); 

  return (
    <>
      <div className="candidates-header">
        <h3>
          {searchMode === 'strategic' ? 'Top 20 Strategic' : 'Top 20 Solutions'}
        </h3>
        {searchMode === 'strategic' && (
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={filterSolutions}
              onChange={(e) => onFilterChange(e.target.checked)}
            />
            <span>Hide solutions</span>
          </label>
        )}
      </div>

      <div className="candidates-list">
        {displayedCandidates.length === 0 ? (
          <p className="no-results">
            {filterSolutions 
              ? 'All top moves are solutions. Uncheck to see them.'
              : 'No candidates available'}
          </p>
        ) : (
          displayedCandidates.map((candidate, index) => (
            <div 
              key={candidate.word} 
              className={`candidate-item ${candidate.isSolution ? 'is-solution' : ''} ${index === 0 ? 'top-candidate' : ''}`}
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
                    ? `${candidate.winProbability}% win` 
                    : 'Info play'} • 
                  {' '}{candidate.rawEntropy.toFixed(2)} bits
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default CandidatesList;