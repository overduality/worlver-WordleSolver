import React, { useState } from 'react';

/**
 * Component for inputting Wordle feedback pattern
 * Allows user to click through gray -> yellow -> green for each letter
 */
const FeedbackInput = ({ guessIndex, word, onSubmit }) => {
  const [pattern, setPattern] = useState(Array(5).fill('gray'));

  const toggleColor = (index) => {
    const colors = ['gray', 'yellow', 'green'];
    const newPattern = [...pattern];
    const currentIdx = colors.indexOf(pattern[index]);
    newPattern[index] = colors[(currentIdx + 1) % 3];
    setPattern(newPattern);
  };

  const handleSubmit = () => {
    onSubmit(guessIndex, pattern);
  };

  return (
    <div className="feedback-input">
      <div className="letter-grid">
        {word.split('').map((letter, i) => (
          <button
            key={i}
            onClick={() => toggleColor(i)}
            className={`letter-box ${pattern[i]}`}
            aria-label={`Toggle color for letter ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="submit-btn"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default FeedbackInput;
