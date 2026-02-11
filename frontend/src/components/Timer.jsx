import { useState, useEffect, useRef } from 'react';
import WarningPopup from './WarningPopup';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [description, setDescription] = useState('');
  const [sessionSavedToday, setSessionSavedToday] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);
  const [error, setError] = useState('');

  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Get current EST date string for daily tracking
  const getESTDateString = () => {
    const now = new Date();
    const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    return estDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Check if already saved today
  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('writingSessions') || '[]');
    setSavedSessions(sessions);

    const todayDate = getESTDateString();
    const savedToday = sessions.some(session => session.date === todayDate);
    setSessionSavedToday(savedToday);
  }, []);

  // Load saved state on mount
  useEffect(() => {
    const savedStartTime = localStorage.getItem('timerStartTime');
    const savedPausedTime = localStorage.getItem('timerPausedTime');
    const savedIsRunning = localStorage.getItem('timerIsRunning');
    const savedDescription = localStorage.getItem('timerDescription');

    if (savedDescription) {
      setDescription(savedDescription);
    }

    if (savedStartTime) {
      startTimeRef.current = parseInt(savedStartTime, 10);
      pausedTimeRef.current = savedPausedTime ? parseInt(savedPausedTime, 10) : 0;

      if (savedIsRunning === 'true') {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
        setSeconds(elapsed);
        setIsRunning(true);
      } else {
        const elapsed = Math.floor((parseInt(savedPausedTime, 10)) / 1000);
        setSeconds(elapsed);
        setIsRunning(false);
      }
    }
  }, []);

  // Auto-stop at 11:59 PM EST and auto-reset at midnight
  useEffect(() => {
    const checkTimeLimits = () => {
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();

      // Hard cutoff at 11:59 PM EST
      if (hours === 23 && minutes === 59 && isRunning) {
        handleStop();
        setError('Timer automatically stopped at 11:59 PM EST cutoff');
      }

      // Auto-reset at midnight (12:00 AM EST)
      if (hours === 0 && minutes === 0) {
        handleReset();
        setSessionSavedToday(false);
      }
    };

    const interval = setInterval(checkTimeLimits, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isRunning]);

  // Timer interval
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
        setSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleDescriptionChange = (e) => {
    const newText = e.target.value;
    const wordCount = countWords(newText);

    if (wordCount <= 10) {
      setDescription(newText);
      localStorage.setItem('timerDescription', newText);
      setError('');
    } else {
      setError('Description must be 10 words or less');
    }
  };

  const handleReset = () => {
    setSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setIsRunning(false);
    setDescription('');
    setError('');

    // Clear localStorage
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('timerPausedTime');
    localStorage.removeItem('timerIsRunning');
    localStorage.removeItem('timerDescription');
  };

  const handleStop = () => {
    if (!isRunning) return;

    // Stopping - save the elapsed time
    pausedTimeRef.current = Date.now() - startTimeRef.current - pausedTimeRef.current;
    localStorage.setItem('timerPausedTime', pausedTimeRef.current.toString());
    localStorage.setItem('timerIsRunning', 'false');
    setIsRunning(false);
  };

  const handleToggle = () => {
    if (isRunning) {
      handleStop();
    } else {
      // Starting - initialize or adjust start time
      if (startTimeRef.current === null) {
        // First start - initialize
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
      } else {
        // Resuming - adjust start time to account for paused duration
        startTimeRef.current = Date.now() - pausedTimeRef.current;
      }
      localStorage.setItem('timerStartTime', startTimeRef.current.toString());
      localStorage.setItem('timerIsRunning', 'true');
      setIsRunning(true);
      setError('');
    }
  };

  const handleSaveSession = () => {
    // Validation
    if (sessionSavedToday) {
      setError('You have already saved a session today. Only one session per day is allowed.');
      return;
    }

    if (seconds === 0) {
      setError('Cannot save a session with 0 time');
      return;
    }

    if (!description.trim()) {
      setError('Description is required to save session');
      return;
    }

    const wordCount = countWords(description);
    if (wordCount > 10) {
      setError('Description must be 10 words or less');
      return;
    }

    // Stop timer if running
    if (isRunning) {
      handleStop();
    }

    // Save session
    const session = {
      date: getESTDateString(),
      duration: seconds,
      description: description.trim(),
      timestamp: new Date().toISOString()
    };

    const sessions = JSON.parse(localStorage.getItem('writingSessions') || '[]');
    sessions.push(session);
    localStorage.setItem('writingSessions', JSON.stringify(sessions));

    setSavedSessions(sessions);
    setSessionSavedToday(true);

    // Reset timer after saving
    handleReset();

    setError('');
    alert('Session saved successfully!');
  };

  const wordCount = countWords(description);

  return (
    <>
      <WarningPopup />
      <div style={{ textAlign: 'center', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
          {formatTime(seconds)}
        </div>

        {sessionSavedToday && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            You have already saved a session today
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleToggle}
            style={{
              margin: '0 10px',
              padding: '10px 20px',
              backgroundColor: isRunning ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            style={{
              margin: '0 10px',
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reset (Test)
          </button>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Session Description (Required - Max 10 words):
          </label>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe your writing session..."
            disabled={sessionSavedToday}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: wordCount > 10 ? '#dc3545' : '#6c757d',
            marginTop: '5px'
          }}>
            {wordCount}/10 words
          </div>
        </div>

        <button
          onClick={handleSaveSession}
          disabled={sessionSavedToday}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            backgroundColor: sessionSavedToday ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: sessionSavedToday ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Save Session
        </button>

        {savedSessions.length > 0 && (
          <div style={{ marginTop: '40px', textAlign: 'left' }}>
            <h3>Saved Sessions</h3>
            {savedSessions.slice().reverse().map((session, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{session.date}</div>
                <div>Duration: {formatTime(session.duration)}</div>
                <div style={{ fontStyle: 'italic', color: '#6c757d' }}>"{session.description}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Timer;
