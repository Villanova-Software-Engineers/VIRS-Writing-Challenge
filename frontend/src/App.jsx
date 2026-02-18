import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import MessageBoard from "./components/MessageBoard";
import Leaderboard from "./components/Leaderboard";
import { StreakProvider } from "./context/StreakContext";

// TODO: Replace `null` with the authenticated user's Firebase ID token once
// auth is wired up, e.g.:
//   const { idToken } = useAuthContext();
// For now, the StreakProvider gracefully falls back to localStorage.
const TEMP_ID_TOKEN = null;

function App() {
  return (
    <BrowserRouter>
      <StreakProvider idToken={TEMP_ID_TOKEN}>
        <div className="flex min-h-screen">
          <NavBar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<MessageBoard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
        </div>
      </StreakProvider>
    </BrowserRouter>
  );
}

export default App;
