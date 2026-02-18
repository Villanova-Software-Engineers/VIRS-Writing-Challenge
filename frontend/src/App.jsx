import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './auth/pages/SignUpPage';
import EmailVerificationPage from './auth/components/EmailVerificationPage';
import SignInPage from './auth/pages/SignInPage';
import ProfessorCodePage from './auth/pages/ProfessorCodePage';
import Home from './components/Home';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage/>} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/professor-code" element={<ProfessorCodePage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
