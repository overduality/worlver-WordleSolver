import React, { useState, useEffect } from 'react';
import { Brain, Moon, Sun, RotateCcw, Target, Zap, List } from 'lucide-react';

// Import components
import LetterInput from './components/LetterInput';
import StrategyInfo from './components/StrategyInfo';
import CandidatesList from './components/CandidatesList';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import GuessHistory from './components/GuessHistory';
import EndgameSection from './components/EndgameSection';
import StatCard from './components/StatCard';
import ModeToggle from './components/ModeToggle';

// Import hook
import { useWordleWorker } from './hooks/useWordleWorker';

function App() {
  // Theme and UI state
  const [darkMode, setDarkMode] = useState(true);
  const [searchMode, setSearchMode] = useState('strategic');
  const [filterSolutions, setFilterSolutions] = useState(false);
  
  // Game state
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  
  // Use the custom hook for worker management
  const {
    solutions,
    dictionary,
    possibleIndices,
    topCandidates,
    loading,
    matrixReady,
    matrixProgress,
    computing,
    computeProgress,
    statusMessage,
    error,
    setPossibleIndices,
    filterByFeedback,
    findBestCandidates,
  } = useWordleWorker(searchMode);

  // Derived state
  const remainingSolutions = possibleIndices.map(idx => solutions[idx]);
  const isEndGame = false; 
  const isSolved = possibleIndices.length === 1;

  // Auto-compute best candidates when possibleIndices changes
  useEffect(() => {
    if (matrixReady && possibleIndices.length > 0 && !isSolved) {
      findBestCandidates(possibleIndices);
    }
  }, [possibleIndices, matrixReady, searchMode, isSolved]);

  // Handle guess submission
  const handleGuessSubmit = () => {
    if (currentGuess.length !== 5) return;
    
    const normalized = currentGuess.toLowerCase();
    if (!dictionary.includes(normalized)) {
      alert('Word not in dictionary!');
      return;
    }

    setGuesses([...guesses, { word: normalized, feedback: [] }]);
    setCurrentGuess('');
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (guessIndex, feedbackPattern) => {
    const updatedGuesses = [...guesses];
    updatedGuesses[guessIndex].feedback = feedbackPattern;
    setGuesses(updatedGuesses);

    const numericPattern = feedbackPattern.map(c => 
      c === 'green' ? 2 : c === 'yellow' ? 1 : 0
    );

    filterByFeedback(
      updatedGuesses[guessIndex].word,
      numericPattern,
      possibleIndices
    );
  };

  // Auto-fill best move
  const useBestMove = () => {
    if (topCandidates.length > 0) {
      setCurrentGuess(topCandidates[0].word);
    }
  };

  // Reset game
  const reset = () => {
    const initialIndices = Array.from({ length: solutions.length }, (_, i) => i);
    setPossibleIndices(initialIndices);
    setGuesses([]);
    setCurrentGuess('');
    setFilterSolutions(false);
    setSearchMode('strategic');
  };

  // Loading screen
  if (loading || !matrixReady) {
    return (
      <LoadingScreen
        darkMode={darkMode}
        loading={loading}
        matrixProgress={matrixProgress}
        statusMessage={statusMessage}
      />
    );
  }

  // Error screen
  if (error) {
    return <ErrorScreen darkMode={darkMode} error={error} />;
  }

  // Calculate confidence level
  const confidenceLevel = possibleIndices.length === 1 ? 100 : 
    searchMode === 'strategic' ? 100 : 
    Math.round((1 / possibleIndices.length) * 100);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="app-container">
        {/* Main Content */}
        <div className="main-content">
          <div className="main-card">
            {/* Header */}
            <div className="header">
              <div>
                <h1>
                  <Brain className="icon" />
                  Worvler
                </h1>
                <p className="subtitle">
                  Mode: {searchMode === 'strategic' ? 'Strategic (Max Info)' : 'Greedy (Lucky Guess)'} • 
                  {searchMode === 'strategic' 
                    ? 'Can identify answer with confidence in next turn'
                    : `${confidenceLevel}% chance to guess correctly`}
                </p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={() => setDarkMode(!darkMode)} 
                  className="icon-btn"
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* Status Banner */}
            {statusMessage && (
              <div className="status-banner">
                {statusMessage}
              </div>
            )}

            {/* Mode Toggle */}
            <ModeToggle
              searchMode={searchMode}
              setSearchMode={setSearchMode}
            />


            {/* Guess History*/}
            {guesses.length > 0 && (
              <GuessHistory
                guesses={guesses}
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            )}

            {/* Result or Input Section */}
            {isSolved ? (
              <div className="result-section">
                <div className="result-card">
                  <h2>Solution Found</h2>
                  <div className="result-word">{solutions[possibleIndices[0]]}</div>
                  <p className="result-meta">
                    Solved in {guesses.length} guess{guesses.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <button onClick={reset} className="btn-primary full-width">
                  <RotateCcw size={20} />
                  New Game
                </button>
              </div>
            ) : possibleIndices.length === 0 ? (
              <div className="result-section">
                <div className="result-card error">
                  <h2>No Solutions Match</h2>
                  <p className="result-meta">Check your feedback patterns</p>
                </div>
                <button onClick={reset} className="btn-primary full-width">
                  <RotateCcw size={20} />
                  Start Over
                </button>
              </div>
            ) : (
              <div className="input-section">
                <LetterInput
                  currentGuess={currentGuess}
                  setCurrentGuess={setCurrentGuess}
                  onSubmit={handleGuessSubmit}
                  onUseBestMove={useBestMove}
                  onReset={reset}
                  disabled={false}
                  topCandidatesAvailable={topCandidates.length > 0}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="candidates-sidebar">
            {!isSolved && possibleIndices.length > 0 && (
              <div className="sidebar-stats">
                <StatCard
                  icon={searchMode === 'strategic' ? Target : Zap}
                  title={searchMode === 'strategic' ? 'Best Strategic Move' : 'Best Solution'}
                  value={topCandidates.length > 0 ? topCandidates[0].word : '—'}
                  meta={topCandidates.length > 0 
                    ? (topCandidates[0].isSolution 
                      ? `${topCandidates[0].winProbability}% direct win`
                      : 'Maximum information gain')
                    : null
                  }
                  isComputing={computing}
                  computeProgress={computeProgress}
                  isPrimary={true}
                  darkMode={darkMode}
                  topCandidates={topCandidates}
                  isCompact={true}
                />

                <StatCard
                  icon={List}
                  title="Remaining"
                  value={possibleIndices.length}
                  meta={
                    possibleIndices.length === solutions.length ? 'Full dictionary' : 
                    possibleIndices.length <= 20 ? 'Narrowing down' : 'Filtering...'
                  }
                  isComputing={false}
                  isPrimary={false}
                  isCompact={true}
                />
              </div>
            )}

            <CandidatesList
              candidates={topCandidates}
              searchMode={searchMode}
              filterSolutions={filterSolutions}
              onFilterChange={setFilterSolutions}
              onWordSelect={(word) => setCurrentGuess(word)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;