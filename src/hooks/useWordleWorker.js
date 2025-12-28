import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage the Wordle solver web worker
 * Handles worker initialization, message passing, state management, and cleanup
 */
export const useWordleWorker = (searchMode) => {
  const [solutions, setSolutions] = useState([]);
  const [dictionary, setDictionary] = useState([]);
  const [possibleIndices, setPossibleIndices] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matrixReady, setMatrixReady] = useState(false);
  const [matrixProgress, setMatrixProgress] = useState(0);
  const [computing, setComputing] = useState(false);
  const [computeProgress, setComputeProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  
  const workerRef = useRef(null);

  useEffect(() => {
    // Create worker from blob
    fetch(new URL('../workers/wordleWorker.js', import.meta.url))
      .then(res => res.text())
      .then(code => {
        const blob = new Blob([code], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl);
        
        // Set up message handler
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
            setComputing(false);
            setComputeProgress(0);
          } else if (type === 'computeProgress') {
            setComputeProgress(parseFloat(e.data.percent));
          }
        };

        // Load word lists
        loadWords();
      })
      .catch(err => {
        console.error('Worker creation failed:', err);
        setError('Failed to initialize worker');
        setLoading(false);
      });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      setStatusMessage('Loading word lists...');
      
      const solutionsResponse = await fetch('/wordle-answers.txt');
      if (!solutionsResponse.ok) throw new Error('Solutions file not found');
      const solutionsText = await solutionsResponse.text();
      const solutionsList = solutionsText
        .split(/\r?\n/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === 5);
      
      const dictionaryResponse = await fetch('/words.txt');
      if (!dictionaryResponse.ok) throw new Error('Dictionary file not found');
      const dictionaryText = await dictionaryResponse.text();
      const dictionaryList = dictionaryText
        .split(/\r?\n/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === 5);
      
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

  const filterByFeedback = (guess, pattern, currentIndices) => {
    setComputing(true);
    workerRef.current.postMessage({
      type: 'filter',
      data: {
        guess,
        pattern,
        currentIndices
      }
    });
  };

  const findBestCandidates = (currentIndices) => {
    if (!matrixReady || currentIndices.length === 0) return;
    
    setComputing(true);
    setComputeProgress(0);
    workerRef.current.postMessage({
      type: 'findBest',
      data: { 
        possibleIndices: currentIndices,
        searchMode
      }
    });
  };

  return {
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
  };
};