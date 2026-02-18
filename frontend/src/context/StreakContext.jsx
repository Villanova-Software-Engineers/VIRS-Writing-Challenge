import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchStreak, incrementStreak } from '../services/streakService';

// ---------------------------------------------------------------------------
// Context + hook
// ---------------------------------------------------------------------------

const StreakContext = createContext(null);

/**
 * useStreak()
 * -----------
 * Call this inside any component that needs to read or update the streak.
 *
 * Returns:
 *   streak       {number}   - Current streak count (0 while loading)
 *   lastUpdated  {Date|null}- UTC Date of last increment, or null
 *   isLoading    {boolean}  - True while the initial fetch is in-flight
 *   triggerIncrement        - Call this when the timer starts (see Timer.jsx)
 */
export function useStreak() {
    const ctx = useContext(StreakContext);
    if (!ctx) {
        throw new Error('useStreak must be used inside <StreakProvider>');
    }
    return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * <StreakProvider idToken={...}>
 *
 * Wrap your app (or the authenticated subtree) in this provider.
 * Pass the user's Firebase ID token so the service can authenticate API calls.
 *
 * When auth is not yet wired up, pass `idToken={null}` — the provider will
 * fall back to a localStorage-only mode so the UI still works locally.
 */
export function StreakProvider({ children, idToken }) {
    const [streak, setStreak] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ------------------------------------------------------------------
    // On mount (or when the token changes), load the streak.
    // Falls back to localStorage when there is no token yet.
    // ------------------------------------------------------------------
    useEffect(() => {
        let cancelled = false;

        async function loadStreak() {
            if (!idToken) {
                // Offline / pre-auth fallback: read from localStorage
                const stored = JSON.parse(localStorage.getItem('streak') || 'null');
                if (stored) {
                    setStreak(stored.count ?? 0);
                    setLastUpdated(stored.last_updated ? new Date(stored.last_updated) : null);
                }
                return;
            }

            setIsLoading(true);
            try {
                const data = await fetchStreak(idToken);
                if (!cancelled) {
                    setStreak(data.count ?? 0);
                    setLastUpdated(data.last_updated ? new Date(data.last_updated) : null);
                }
            } catch (err) {
                console.error('[StreakContext] Failed to load streak:', err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadStreak();
        return () => { cancelled = true; };
    }, [idToken]);

    // ------------------------------------------------------------------
    // triggerIncrement
    // Called by Timer.jsx the moment the timer starts.
    // Enforces a client-side 24-hour guard *before* hitting the network so
    // that multiple start/stop cycles in one day never cause a double-call.
    // The backend enforces the same rule as a second layer of protection.
    // ------------------------------------------------------------------
    const triggerIncrement = useCallback(async () => {
        const now = new Date();

        // Client-side 24-hour guard
        if (lastUpdated) {
            const diffMs = now - lastUpdated;
            if (diffMs < 24 * 60 * 60 * 1000) {
                // Already incremented today — nothing to do
                return;
            }
        }

        if (!idToken) {
            // Offline / pre-auth fallback: increment in localStorage
            const newCount = streak + 1;
            const newLastUpdated = now.toISOString();
            setStreak(newCount);
            setLastUpdated(now);
            localStorage.setItem(
                'streak',
                JSON.stringify({ count: newCount, last_updated: newLastUpdated })
            );
            return;
        }

        // Optimistic UI update
        const optimisticCount = streak + 1;
        setStreak(optimisticCount);
        setLastUpdated(now);

        try {
            const data = await incrementStreak(idToken);
            // Reconcile with the server's authoritative count
            setStreak(data.count);
            setLastUpdated(data.last_updated ? new Date(data.last_updated) : now);
        } catch (err) {
            console.error('[StreakContext] Failed to increment streak:', err);
            // Roll back the optimistic update
            setStreak(streak);
            setLastUpdated(lastUpdated);
        }
    }, [idToken, streak, lastUpdated]);

    const value = { streak, lastUpdated, isLoading, triggerIncrement };

    return (
        <StreakContext.Provider value={value}>
            {children}
        </StreakContext.Provider>
    );
}

export default StreakContext;
