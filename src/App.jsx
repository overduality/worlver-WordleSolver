import React, { useState, useEffect, useRef } from 'react';
import { Brain, Play, RotateCcw, Info, Moon, Sun, List, Target, Zap } from 'lucide-react';
import ModeToggle from './components/ModeToggle';
import StatCard from './components/StatCard';
import CandidatesList from './components/CandidatesList';
import EndgameSection from './components/EndgameSection';
import GuessHistory from './components/GuessHistory';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { loadWordLists, feedbackToNumeric, calculateConfidence } from './utils/wordUtils';
import './styles/App.css';

// Import worker code
import workerCode from './workers/wordleWorker.js?raw';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchMode, setSearchMode] = useState('strategic');
  const [solutions, setSolutions] = useState([]);
  const [dictionary, setDictionary] = useState([]);
  const [possibleIndices, setPossibleIndices] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [topCandidates, setTopCandidates] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [filterSolutions, setFilterSolutions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matrixReady, setMatrixReady] = useState(false);
  const [matrixProgress, setMatrixProgress] = useState(0);
  const [computing, setComputing] = useState(false);
  const [computeProgress, setComputeProgress] = useState(0);
  const [searchedCount, setSearchedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  
  const workerRef = useRef(null);

  // Derived state
  const remainingSolutions = possibleIndices.map(idx => solutions[idx]);
  const isSolved = possibleIndices.length === 1;
  
  // Filtered candidates
  const displayedCandidates = filterSolutions 
    ? topCandidates.filter(c => c.isSolution)
    : topCandidates;

  // Initialize worker
  useEffect(() => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (e) => {
      const { type } = e.data;
      
      if (type === 'status') {
        setStatusMessage(e.data.message);
      } else if (type === 'progress') {
        setMatrixProgress(parseFloat(e.data.percent));
      } else if (type === 'ready') {
        setMatrixReady(true);
        setStatusMessage('System ready');
        setTimeout(() => setStatusMessage(''), 2000);
      } else if (type === 'filtered') {
        setPossibleIndices(e.data.indices);
        setComputing(false);
      } else if (type === 'bestCandidates') {
        setTopCandidates(e.data.candidates);
        setSearchedCount(e.data.searchedCount || dictionary.length);
        setComputing(false);
        setComputeProgress(0);
      } else if (type === 'computeProgress') {
        setComputeProgress(parseFloat(e.data.percent));
      }
    };

    // Load word lists
    const initialize = async () => {
      try {
        setLoading(true);
        setStatusMessage('Loading word lists...');
        
        const { solutions: solutionsList, dictionary: dictionaryList } = await loadWordLists();
        
        setSolutions(solutionsList);
        setDictionary(dictionaryList);
        
        const initialIndices = Array.from({ length: solutionsList.length }, (_, i) => i);
        setPossibleIndices(initialIndices);
        
        setStatusMessage(`Loaded ${solutionsList.length} solutions, ${dictionaryList.length} words`);
        
        workerRef.current.postMessage({
          type: 'init',
          data: {
            solutions: solutionsList,
            dictionary: dictionaryList
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load word lists. Make sure both .txt files are in the /public folder.');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, []);

  // Compute best candidates when indices or mode changes
  useEffect(() => {
    if (matrixReady && possibleIndices.length > 0 && !computing) {
      if (possibleIndices.length === 1) {
        setTopCandidates([{ 
          word: solutions[possibleIndices[0]], 
          entropy: 0, 
          rawEntropy: 0,
          winProbability: 100,
          isSolution: true 
        }]);
        return;
      }
      
      setComputing(true);
      setComputeProgress(0);
      workerRef.current.postMessage({
        type: 'findBest',
        data: { 
          possibleIndices,
          searchMode
        }
      });
    }
  }, [possibleIndices, matrixReady, solutions, searchMode]);

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

  const handleFeedbackSubmit = (guessIndex, feedbackPattern) => {
    const updatedGuesses = [...guesses];
    updatedGuesses[guessIndex].feedback = feedbackPattern;
    setGuesses(updatedGuesses);

    const numericPattern = feedbackToNumeric(feedbackPattern);

    setComputing(true);
    workerRef.current.postMessage({
      type: 'filter',
      data: {
        guess: updatedGuesses[guessIndex].word,
        pattern: numericPattern,
        currentIndices: possibleIndices
      }
    });
  };

  const autoSolve = () => {
    if (displayedCandidates.length > 0) {
      setCurrentGuess(displayedCandidates[0].word);
    }
  };

  const reset = () => {
    const initialIndices = Array.from({ length: solutions.length }, (_, i) => i);
    setPossibleIndices(initialIndices);
    setGuesses([]);
    setCurrentGuess('');
    setTopCandidates([]);
    setComputeProgress(0);
    setFilterSolutions(false);
    setSearchMode('strategic');
  };

  // Show loading or error screens
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

  if (error) {
    return <ErrorScreen darkMode={darkMode} error={error} />;
  }

  const confidenceLevel = calculateConfidence(possibleIndices.length, searchMode);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <div className="main-card">
          {/* Header */}
          <div className="header">
            <div>
              <h1>
                <Brain className="icon" />
                Wordle Solver
              </h1>
              <p className="subtitle">
                Mode: {searchMode === 'strategic' ? 'Strategic (Max Info)' : 'Greedy (Lucky Guess)'} • 
                {searchMode === 'strategic' 
                  ? ` Can identify answer with confidence in next turn`
                  : ` ${confidenceLevel}% chance to guess correctly`}
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
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="icon-btn"
                aria-label="Show info"
              >
                <Info size={20} />
              </button>
            </div>
          </div>

          {/* Status banner */}
          {statusMessage && (
            <div className="status-banner">
              {statusMessage}
            </div>
          )}

          {/* Info box */}
          {showInfo && (
            <div className="info-box">
              <p className="info-title">Search Modes Explained</p>
              <p>
                <strong>Strategic Mode:</strong> Searches entire dictionary for maximum information gain. 
                May suggest "burner words" that eliminate multiple possibilities at once. 
                Example: Suggesting HEMPS to distinguish between BATCH/MATCH/HATCH/LATCH/WATCH.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <strong>Greedy Mode:</strong> Only considers possible solutions. Faster but may require 
                multiple guesses to narrow down similar words. Higher variance, gambling on luck.
              </p>
            </div>
          )}

          {/* Mode toggle */}
          <ModeToggle 
            searchMode={searchMode}
            onModeChange={setSearchMode}
          />

          {/* Main content */}
          {!isSolved && (
            <>
              {/* Stats grid */}
              <div className="stats-grid">
                <StatCard
                  icon={searchMode === 'strategic' ? Target : Zap}
                  title={searchMode === 'strategic' ? 'Strategic Move' : 'Best Solution'}
                  value={displayedCandidates.length > 0 ? displayedCandidates[0].word : null}
                  meta={displayedCandidates.length > 0 ? (
                    displayedCandidates[0].isSolution 
                      ? `${displayedCandidates[0].winProbability}% direct win`
                      : 'Maximum information gain'
                  ) : null}
                  isComputing={computing}
                  computeProgress={computeProgress}
                  isPrimary
                />

                <StatCard
                  icon={List}
                  title="Remaining"
                  value={possibleIndices.length}
                  meta={
                    possibleIndices.length === solutions.length ? 'Full dictionary' : 
                    possibleIndices.length <= 20 ? 'Narrowing down' : 'Filtering...'
                  }
                />
              </div>

              {/* Endgame section */}
              <EndgameSection
                remainingSolutions={remainingSolutions}
                searchMode={searchMode}
                topCandidates={topCandidates}
                onWordSelect={setCurrentGuess}
              />

              {/* Candidates list */}
              {topCandidates.length > 0 && possibleIndices.length > 5 && (
                <CandidatesList
                  candidates={topCandidates}
                  searchMode={searchMode}
                  filterSolutions={filterSolutions}
                  onFilterChange={setFilterSolutions}
                  onWordSelect={setCurrentGuess}
                />
              )}
            </>
          )}

          {/* Guess history */}
          <GuessHistory
            guesses={guesses}
            onFeedbackSubmit={handleFeedbackSubmit}
          />

          {/* Result or input section */}
          {isSolved ? (
            <div className="result-section">
              <div className="result-card">
                <div className="result-icon">🎯</div>
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
                <div className="result-icon">❌</div>
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
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleGuessSubmit()}
                placeholder="Enter your guess..."
                maxLength={5}
                className="guess-input"
              />
              <button
                onClick={handleGuessSubmit}
                disabled={currentGuess.length !== 5}
                className="btn-secondary"
              >
                Add
              </button>
              <button 
                onClick={autoSolve} 
                className="btn-primary" 
                disabled={!displayedCandidates.length}
              >
                <Play size={18} />
                Use Best
              </button>
              <button onClick={reset} className="btn-neutral">
                <RotateCcw size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
