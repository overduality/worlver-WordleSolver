import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage the Wordle solver web worker
 * Handles worker initialization, message passing, and cleanup
 */
export const useWordleWorker = (onMessage) => {
  const workerRef = useRef(null);

  useEffect(() => {
    // Import worker code and create worker instance
    import('../workers/wordleWorker.js?worker&url').then((module) => {
      workerRef.current = new Worker(new URL('../workers/wordleWorker.js', import.meta.url), {
        type: 'module'
      });
      
      workerRef.current.onmessage = onMessage;
    }).catch(() => {
      // Fallback: create worker from inline code if module import fails
      fetch(new URL('../workers/wordleWorker.js', import.meta.url))
        .then(res => res.text())
        .then(code => {
          const blob = new Blob([code], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(blob);
          workerRef.current = new Worker(workerUrl);
          workerRef.current.onmessage = onMessage;
        });
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onMessage]);

  const postMessage = (message) => {
    if (workerRef.current) {
      workerRef.current.postMessage(message);
    }
  };

  return { postMessage };
};
