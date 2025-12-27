/**
 * Utility functions for loading and processing word lists
 */

/**
 * Load and parse a word list from a text file
 * @param {string} filename - Path to the word list file
 * @returns {Promise<string[]>} Array of 5-letter words
 */
export const loadWordList = async (filename) => {
  const response = await fetch(filename);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }
  
  const text = await response.text();
  return text
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5);
};

/**
 * Load both solutions and dictionary word lists
 * @returns {Promise<{solutions: string[], dictionary: string[]}>}
 */
export const loadWordLists = async () => {
  const [solutions, dictionary] = await Promise.all([
    loadWordList('/wordle-answers.txt'),
    loadWordList('/words.txt')
  ]);
  
  return { solutions, dictionary };
};

/**
 * Convert feedback pattern to numeric representation
 * @param {string[]} pattern - Array of 'green', 'yellow', or 'gray'
 * @returns {number[]} Numeric pattern (2=green, 1=yellow, 0=gray)
 */
export const feedbackToNumeric = (pattern) => {
  return pattern.map(color => {
    if (color === 'green') return 2;
    if (color === 'yellow') return 1;
    return 0;
  });
};

/**
 * Calculate confidence level based on game state
 * @param {number} remainingCount - Number of remaining possible solutions
 * @param {string} searchMode - Current search mode ('strategic' or 'greedy')
 * @returns {number} Confidence percentage
 */
export const calculateConfidence = (remainingCount, searchMode) => {
  if (remainingCount === 1) return 100;
  if (searchMode === 'strategic') return 100;
  return Math.round((1 / remainingCount) * 100);
};
