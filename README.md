# Wordle Solver Pro

A strategic Wordle solver that uses entropy-based analysis to suggest optimal guesses. Choose between strategic mode (maximum information gain) or greedy mode (direct solution attempts).

## Features

- **Strategic Mode**: Analyzes entire dictionary for maximum entropy reduction, may suggest "burner words"
- **Greedy Mode**: Only considers possible solutions for faster gameplay
- **Real-time Analysis**: Pre-computed pattern matrix for instant recommendations
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Core Algorithm
- Pre-computes feedback pattern matrix (14k×2.3k) on startup
- Uses base-3 encoding for efficient pattern matching
- Implements Shannon entropy for information-theoretic optimal play
- Zero-allocation worker architecture for GC-free computation

### Strategic vs Greedy
- **Strategic**: Searches full dictionary, prioritizes entropy (information gain)
- **Greedy**: Searches only possible solutions, prioritizes win probability

## Project Structure

```
wordle-solver-pro/
├── src/
│   ├── components/          # React components
│   │   ├── CandidatesList.jsx
│   │   ├── EndgameSection.jsx
│   │   ├── ErrorScreen.jsx
│   │   ├── FeedbackInput.jsx
│   │   ├── GuessHistory.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ModeToggle.jsx
│   │   └── StatCard.jsx
│   ├── hooks/               # Custom React hooks
│   │   └── useWordleWorker.js
│   ├── styles/              # CSS stylesheets
│   │   └── App.css
│   ├── utils/               # Utility functions
│   │   └── wordUtils.js
│   ├── workers/             # Web Workers
│   │   └── wordleWorker.js
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point
├── public/                  # Static assets
│   ├── wordle-answers.txt  # Official Wordle solutions
│   └── words.txt           # Full dictionary
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wordle-solver-pro
```

2. Install dependencies:
```bash
npm install
```

3. Add word lists to `/public`:
- `wordle-answers.txt` - Official Wordle solution words (one per line)
- `words.txt` - Full dictionary of valid 5-letter words (one per line)

4. Start development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Output will be in `/dist` directory.

## Usage

1. **Choose Search Mode**: Toggle between Strategic (entropy maximization) or Greedy (solution gambling)
2. **Enter Guess**: Type your guess word
3. **Input Feedback**: Click letters to cycle through gray → yellow → green
4. **Submit**: Get next optimal guess based on remaining possibilities
5. **Repeat**: Until solution is found

## Algorithm Details

### Pattern Matrix
- Feedback encoded as base-3 number: gray=0, yellow=1, green=2
- Pre-computed matrix avoids runtime pattern calculation
- Uint8Array for memory efficiency (243 possible patterns)

### Entropy Calculation
```
H(X) = -Σ p(x) log₂(p(x))
```
Where p(x) is the probability of each feedback pattern.

### Mode-Specific Bonuses
- **Strategic**: `winBonus = 0.01` (minimal tie-breaker for solutions)
- **Greedy**: `winBonus = log₂(n)` (aggressive solution preference)

## Performance

- Matrix build: ~2-3 seconds
- Per-guess analysis: <100ms for strategic, <50ms for greedy
- Memory: ~35MB for pattern matrix
- Zero GC during computation (pre-allocated TypedArrays)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Information theory approach inspired by 3Blue1Brown's Wordle analysis
- Original Wordle by Josh Wardle
- Pattern matrix optimization technique from various solver implementations
