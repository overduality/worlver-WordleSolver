import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

const StrategyInfo = ({ darkMode, topCandidates }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('theory');
  const [entropyData, setEntropyData] = useState([]);

  // Calculate entropy data from actual top candidates
  useEffect(() => {
    if (topCandidates && topCandidates.length > 0) {
      // top 8 candidates and format for visualization
      const data = topCandidates.slice(0, 8).map(candidate => {
        const entropy = candidate.rawEntropy;
        let color;
        
        // Color based on entropy value
        if (entropy >= 5.5) color = '#22c55e'; 
        else if (entropy >= 4.5) color = '#3b82f6'; 
        else if (entropy >= 3) color = '#f59e0b'; 
        else color = '#ef4444'; 
        
        return {
          word: candidate.word.toUpperCase(),
          entropy: entropy,
          color: color,
          isSolution: candidate.isSolution
        };
      });
      
      setEntropyData(data);
    } else {
      // Fallback to hardcoded data if no candidates available
      setEntropyData([
        { word: 'TARSE', entropy: 6.35, color: '#22c55e' },
        { word: 'SALET', entropy: 6.30, color: '#22c55e' },
        { word: 'SLATE', entropy: 6.28, color: '#22c55e' },
        { word: 'CRANE', entropy: 6.15, color: '#3b82f6' },
        { word: 'STARE', entropy: 6.12, color: '#3b82f6' },
        { word: 'AUDIO', entropy: 4.82, color: '#f59e0b' },
        { word: 'BLIMP', entropy: 4.15, color: '#ef4444' },
        { word: 'FUZZY', entropy: 3.67, color: '#ef4444' },
      ]);
    }
  }, [topCandidates]);

  const maxEntropy = entropyData.length > 0 
    ? Math.max(...entropyData.map(d => d.entropy)) 
    : 6.35;

  if (!showModal) {
    return (
      <button 
        className="info-btn"
        onClick={() => setShowModal(true)}
        title="Learn about information theory"
      >
        <Info size={18} />
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Info size={24} /> Information Theory Explained</h2>
          <button onClick={() => setShowModal(false)} className="modal-close">×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            Theory
          </button>
          <button
            className={`tab-btn ${activeTab === 'visualization' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualization')}
          >
            Visualization
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'theory' ? (
            <div className="theory-content">
              <h3>What is Information Entropy?</h3>
              <p>
                Information entropy measures <strong>how much uncertainty a guess removes</strong>.
                Higher entropy = better guess because it eliminates more possibilities.
              </p>

              <div className="formula-box">
                <code>H(X) = -Σ p(x) × log₂(p(x))</code>
              </div>

              <h3>Why TARSE/SALET are optimal first guesses:</h3>
              <ul>
                <li><strong>High letter frequency:</strong> T, A, R, S, E appear in many words</li>
                <li><strong>Unique positions:</strong> Tests different letter positions</li>
                <li><strong>Maximum partitioning:</strong> Divides remaining solutions most evenly</li>
              </ul>

              <h3>Strategic vs Greedy Mode:</h3>
              <p>
                <strong>Strategic:</strong> Uses "burner words" (non-solutions) to gain maximum information.
                Example: If stuck between BATCH/MATCH/HATCH, Strategic might suggest CHAMP to test C, M, P positions.
              </p>
              <p>
                <strong>Greedy:</strong> Only guesses possible solutions. Faster when lucky, but may waste guesses
                on similar words (testing BATCH, then MATCH, then HATCH one by one).
              </p>
            </div>
          ) : (
            <div className="visualization-content">
              <h3>Entropy Comparison: Current Top Candidates</h3>
              <p className="viz-subtitle">
                {entropyData.length > 0 
                  ? 'Live data from current game state - higher bars = better guesses'
                  : 'Typical first guess entropy values'}
              </p>

              <div className="entropy-chart">
                {entropyData.map((item, idx) => (
                  <div key={idx} className="bar-container">
                    <div className="bar-label">
                      {item.word}
                      {item.isSolution !== undefined && !item.isSolution && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}> </span>
                      )}
                    </div>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(item.entropy / maxEntropy) * 100}%`,
                          backgroundColor: item.color
                        }}
                      >
                        <span className="bar-value">{item.entropy.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="viz-explanation">
                <div className="viz-note good">
                  <strong>Green (5.5+ bits):</strong> Excellent guesses - maximum information gain
                </div>
                <div className="viz-note medium">
                  <strong>Blue (4.5-5.5 bits):</strong> Good guesses - solid information gain
                </div>
                <div className="viz-note medium">
                  <strong>Yellow (3-4.5 bits):</strong> Mediocre - some wasted potential
                </div>
                <div className="viz-note bad">
                  <strong>Red (&lt;3.5 bits):</strong> Poor choices - very inefficient
                </div>
              </div>

              {entropyData.length >= 2 && (
                <p className="viz-insight">
                  <strong>Key Insight:</strong> {entropyData[0].word} gains {entropyData[0].entropy.toFixed(2)} bits vs {entropyData[entropyData.length - 1].word}'s {entropyData[entropyData.length - 1].entropy.toFixed(2)} bits.
                  That's <strong>{(((entropyData[0].entropy - entropyData[entropyData.length - 1].entropy) / entropyData[entropyData.length - 1].entropy) * 100).toFixed(0)}% more information</strong> in a single guess!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyInfo;