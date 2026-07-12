import { useState, useRef, useCallback, useEffect } from 'react';

// States: idle | listening | processing | error
export function useVoiceSearch({ onResult, onError }) {
  const [voiceState, setVoiceState] = useState('idle'); // 'idle'|'listening'|'processing'|'error'
  const [errorMsg,   setErrorMsg]   = useState('');
  const recogRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recogRef.current?.abort();
      recogRef.current = null;
    };
  }, []);

  const isSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const start = useCallback(() => {
    if (!isSupported) {
      setErrorMsg('Voice search is not supported in this browser.');
      setVoiceState('error');
      return;
    }

    // Stop any existing session first
    recogRef.current?.abort();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();

    // Primary language: Indian English; interim results give live feedback
    r.lang            = 'en-IN';
    r.continuous      = false;
    r.interimResults  = true;
    r.maxAlternatives = 5;

    r.onstart = () => {
      setVoiceState('listening');
      setErrorMsg('');
    };

    // Show interim (live) transcript in the input while the user speaks
    r.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(res => res[0].transcript)
        .join(' ')
        .trim();

      if (e.results[e.results.length - 1].isFinal) {
        setVoiceState('processing');
        onResult(transcript);
      } else {
        // Live interim — let the component show it
        onResult(transcript, true /* isInterim */);
      }
    };

    r.onerror = (e) => {
      let msg = 'Sorry, I couldn\'t understand. Please try again.';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = 'Microphone access denied. Please allow microphone permission.';
      } else if (e.error === 'network') {
        msg = 'Network error. Please check your connection.';
      } else if (e.error === 'no-speech') {
        msg = 'No speech detected. Please speak clearly and try again.';
      }
      setErrorMsg(msg);
      setVoiceState('error');
    };

    r.onend = () => {
      // If still listening when recognition ends naturally (timeout etc.)
      setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
    };

    recogRef.current = r;
    r.start();
  }, [isSupported, onResult]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    recogRef.current = null;
    setVoiceState('idle');
  }, []);

  const clearError = useCallback(() => {
    setErrorMsg('');
    setVoiceState('idle');
  }, []);

  return { voiceState, errorMsg, isSupported, start, stop, clearError };
}
