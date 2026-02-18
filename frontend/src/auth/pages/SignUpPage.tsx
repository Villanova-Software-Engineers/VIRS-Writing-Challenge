import React from 'react';
import SignUpForm from '../components/SignUpForm';
import ThemeToggle from '../components/ThemeToggle';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-12 text-text tracking-tight max-lg:p-6">
      <ThemeToggle />
      <div className="w-full max-w-[560px] rounded-[22px] border border-accent/20 bg-background p-7 shadow-xl backdrop-blur-xl">
        <div className="mb-4">
          <h2 className="mt-2.5 mb-1.5 text-[26px] font-bold">Create your account</h2>
          <p className="text-muted">
            One profile for challenges, feedback, and publishing tools.
          </p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
