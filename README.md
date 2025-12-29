# Worvler

Wordle solver powered by information theory and entropy maximization.

![Wordle Solver](https://img.shields.io/badge/React-18.x-blue) ![Web Workers](https://img.shields.io/badge/Web_Workers-Enabled-green)

## Overview

Worvler uses **information theory** to find the optimal guess at each step. It precomputes a pattern matrix of all possible guess-answer combinations and calculates **Shannon entropy** to identify guesses that eliminate the most possibilities.

```
H(X) = -Σ p(x) × log₂(p(x))
```

Higher entropy = better guess = more information gained.

## Key Features

### Two Solving Strategies

**Strategic Mode** (Default)
- Searches entire dictionary for maximum entropy
- Utilizes non-solution words to maximize information gain
- Optimizes for minimum expected guesses
- Example: Suggests CHAMP to differentiate BATCH/MATCH/HATCH

**Greedy Mode**
- Restricts search space to remaining possible solutions
- Maximizes immediate win probability
- Higher variance in guess count distribution

### Performance Optimization

- **Pattern Matrix**: Precomputed 12,972 × 2,315 = 30M+ patterns
- **Web Worker**: Non-blocking UI during computation
- **Entropy Calculation**: Real-time analysis of remaining solutions

## Implementation

1. **Pattern Matrix Generation**: Encodes all guess-target feedback patterns in base-3 representation (gray=0, yellow=1, green=2)

2. **Entropy Calculation**: For each candidate guess, computes partition uniformity across remaining solution space

3. **Optimal Selection**: Selects guess maximizing expected information gain

## Theoretical Foundation

### Information Gain
Optimal first guesses such as TARSE or SALET achieve approximately 6.3 bits of entropy through:
- High-frequency letter coverage (T, A, R, S, E)
- Positional diversity testing
- Maximal partition of solution space

### Strategic vs Greedy Comparison
| Strategy | Search Space | Win Bonus | Optimization Target |
|----------|-------------|-----------|---------------------|
| Strategic | Full dictionary | 0.01 bits | Expected guess count |
| Greedy | Solutions only | log₂(n) bits | Immediate win probability |

## Installation

```bash
# Clone repository
git clone https://github.com/overdensity/worlver-WordleSolver.git
cd worlver-WordleSolver

# Install dependenciesr
npm install

# Add word lists to /public folder
# - wordle-answers.txt (2,315 official solutions)
# - words.txt (12,972 valid guesses)

# Run development server
npm run dev
```

## Usage

1. **Input guess** - Enter any valid 5-letter word
2. **Provide feedback** - Click letters to cycle through feedback states: gray → yellow → green
3. **Receive optimal suggestion** - System computes best next guess using selected strategy
4. **Iterate** until solution converges

## Tech Stack

- **React 18** - UI framework
- **Web Workers** - Background computation
- **Lucide React** - Icons
- **Vanilla CSS** - Styling with CSS variables

## Algorithm Complexity

- **Preprocessing**: O(D × S) = O(30M) one-time
  - D = dictionary size (12,972)
  - S = solutions size (2,315)
  
- **Per-guess Analysis**: O(D × S × 243)
  - 243 possible feedback patterns (3^5)
  - Strategic mode searches full dictionary
  - Greedy mode searches only remaining solutions


## References


Shannon, C. E. (1948). "A Mathematical Theory of Communication". Bell System Technical Journal, 27(3), 379–423. doi:10.1002/j.1538-7305.1948.tb01338.x

3Blue1Brown. (2022). [Solving Wordle using information theory](https://youtu.be/v68zYyaEmEA?si=yiGRhyZN4xhq3_YG)

3Blue1Brown. (2022). [Oh, wait, actually the best Wordle opener is not “crane”…](https://youtu.be/fRed0Xmc2Wg?si=yG9mRJY8OuH8YzZQ)


---

**Note**: Requires `wordle-answers.txt` and `words.txt` in `/public` directory to run.
