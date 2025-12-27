import React from 'react';
import FeedbackInput from './FeedbackInput';

/**
 * Display history of guesses with feedback patterns
 */
const GuessHistory = ({ guesses, onFeedbackSubmit }) => {
  if (guesses.length === 0) return null;

  return (
    <div className="guesses-section">
      <h3>Your Guesses</h3>
      {guesses.map((guess, index) => (
        <div key={index} className="guess-card">
          <div className="guess-header">
            <span className="guess-number">#{index + 1}</span>
            <span className="guess-word">{guess.word}</span>
          </div>
          {guess.feedback.length === 0 ? (
            <FeedbackInput 
              guessIndex={index} 
              word={guess.word} 
              onSubmit={onFeedbackSubmit}
            />
          ) : (
            <div className="letter-grid">
              {guess.word.split('').map((letter, i) => (
                <div key={i} className={`letter-box ${guess.feedback[i]} final`}>
                  {letter}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;
