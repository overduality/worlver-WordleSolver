// Wordle Solver Web Worker - Pattern Matrix Engine
let solutions = [];
let dictionary = [];
let matrix = null;

const getFeedbackBase3 = (guess, target) => {
  let res = 0;
  const tArr = [target[0], target[1], target[2], target[3], target[4]];
  const gArr = [guess[0], guess[1], guess[2], guess[3], guess[4]];

  for (let i = 0; i < 5; i++) {
    if (gArr[i] === tArr[i]) {
      res += 2 * Math.pow(3, i);
      tArr[i] = null;
      gArr[i] = null;
    }
  }
  
  for (let i = 0; i < 5; i++) {
    if (gArr[i]) {
      for (let j = 0; j < 5; j++) {
        if (tArr[j] && gArr[i] === tArr[j]) {
          res += 1 * Math.pow(3, i);
          tArr[j] = null;
          break;
        }
      }
    }
  }
  return res;
};

self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'init') {
    solutions = data.solutions;
    dictionary = data.dictionary;
    const sLen = solutions.length;
    const dLen = dictionary.length;
    
    matrix = new Uint8Array(dLen * sLen);
    self.postMessage({ type: 'status', message: 'Building pattern matrix...' });

    for (let i = 0; i < dLen; i++) {
      for (let j = 0; j < sLen; j++) {
        matrix[i * sLen + j] = getFeedbackBase3(dictionary[i], solutions[j]);
      }
      
      if (i % 100 === 0 || i === dLen - 1) {
        self.postMessage({ 
          type: 'progress', 
          percent: ((i + 1) / dLen * 100).toFixed(1),
          current: i + 1,
          total: dLen
        });
      }
    }
    
    self.postMessage({ type: 'ready' });
  }

  if (type === 'filter') {
    const { guess, pattern, currentIndices } = data;
    const guessIdx = dictionary.indexOf(guess);
    
    if (guessIdx === -1) {
      self.postMessage({ type: 'filtered', indices: currentIndices });
      return;
    }
    
    const targetPattern = pattern.reduce((acc, val, i) => acc + val * Math.pow(3, i), 0);
    const filtered = currentIndices.filter(sIdx => {
      return matrix[guessIdx * solutions.length + sIdx] === targetPattern;
    });
    
    self.postMessage({ type: 'filtered', indices: filtered });
  }

  if (type === 'findBest') {
    const { possibleIndices: currentIndices, searchMode } = data;
    const sLen = solutions.length;
    const dLen = dictionary.length;
    
    if (currentIndices.length === 0) {
      self.postMessage({ type: 'bestCandidates', candidates: [] });
      return;
    }
    
    if (currentIndices.length === 1) {
      self.postMessage({ 
        type: 'bestCandidates', 
        candidates: [{ 
          word: solutions[currentIndices[0]], 
          entropy: 0, 
          winProbability: 100,
          isSolution: true 
        }]
      });
      return;
    }
    
    // CRITICAL: Allocate ONCE outside the loop
    const results = [];
    const counts = new Int32Array(243);
    const isSolutionSet = new Uint8Array(dLen);
    
    // Build solution lookup bitset
    for (const idx of currentIndices) {
      const dictIdx = dictionary.indexOf(solutions[idx]);
      if (dictIdx !== -1) isSolutionSet[dictIdx] = 1;
    }
    
    // STRATEGIC vs GREEDY MODE: Determine search space
    let candidatesToSearch;
    if (searchMode === 'greedy') {
      // GREEDY: Only search possible solutions
      candidatesToSearch = currentIndices
        .map(idx => dictionary.indexOf(solutions[idx]))
        .filter(idx => idx !== -1);
    } else {
      // STRATEGIC: Always search full dictionary (or adaptive sample)
      const searchLimit = currentIndices.length > 500 ? 3000 : dLen;
      candidatesToSearch = Array.from({ length: searchLimit }, (_, i) => i);
    }
    
    for (const i of candidatesToSearch) {
      counts.fill(0);
      
      for (const sIdx of currentIndices) {
        counts[matrix[i * sLen + sIdx]]++;
      }
      
      let entropy = 0;
      const total = currentIndices.length;
      for (let j = 0; j < 243; j++) {
        if (counts[j] > 0) {
          const p = counts[j] / total;
          entropy -= p * Math.log2(p);
        }
      }
      
      // WIN PROBABILITY CALCULATION
      const isSol = isSolutionSet[i] === 1;
      const winProb = isSol ? (1 / total) : 0;
      
      // CRITICAL FIX: Mode-dependent win bonus
      let winBonus = 0;
      if (searchMode === 'greedy') {
        // GREEDY: Massive bonus for solutions (gambling mode)
        winBonus = isSol ? Math.log2(total) : 0;
      } else {
        // STRATEGIC: Tiny tie-breaker only (0.01 bits)
        // This means a burner word with 2.3 bits will always beat a solution with 1.5 bits
        winBonus = isSol ? 0.01 : 0;
      }
      
      results.push({ 
        word: dictionary[i], 
        entropy: entropy + winBonus,
        rawEntropy: entropy,
        winProbability: (winProb * 100).toFixed(1),
        isSolution: isSol
      });
      
      if (candidatesToSearch.length > 1000 && i % 2000 === 0 && i > 0) {
        self.postMessage({ 
          type: 'computeProgress', 
          percent: ((i / candidatesToSearch.length) * 100).toFixed(0) 
        });
      }
    }
    
    results.sort((a, b) => b.entropy - a.entropy);
      self.postMessage({ 
      type: 'bestCandidates', 
      candidates: results.slice(0, 50),  
      searchedCount: candidatesToSearch.length,
      searchMode: searchMode
  });
  }
};