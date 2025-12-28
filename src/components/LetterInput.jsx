import React from 'react';
import { RotateCcw } from 'lucide-react';

const LetterInput = ({ currentGuess, setCurrentGuess, onSubmit, onUseBestMove, onReset, disabled, topCandidatesAvailable }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentGuess.length === 5) {
      onSubmit();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + e.key.toLowerCase());
    }
  };

  return (
    <div className="letter-input-container" onKeyDown={handleKeyPress} tabIndex={0}>
      <div className="letter-boxes">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`letter-input-box ${currentGuess[i] ? 'filled' : ''}`}>
            {currentGuess[i]?.toUpperCase() || ''}
          </div>
        ))}
      </div>
      <div className="input-actions">
        <button
          onClick={onSubmit}
          disabled={disabled || currentGuess.length !== 5}
          className="btn-primary submit-guess-btn"
        >
          Add Guess
        </button>
        <button 
          onClick={onUseBestMove} 
          className="btn-secondary"
          disabled={!topCandidatesAvailable}
        >
          Use Best Move
        </button>
        <button 
          onClick={onReset} 
          className="btn-icon-only"
          aria-label="Reset game"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default LetterInput;