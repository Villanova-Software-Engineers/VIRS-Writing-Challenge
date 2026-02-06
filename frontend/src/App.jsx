import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './auth/pages/SignUpPage';
import EmailVerificationPage from './auth/components/EmailVerificationPage';
import SignInPage from './auth/pages/SignInPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/sign-up" replace />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="*" element={<Navigate to="/auth/sign-up" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
