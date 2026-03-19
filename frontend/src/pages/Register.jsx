import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-neutral-100 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create your SMAART account</h2>
        <p className="text-neutral-600 mb-8">Registration is part of our comprehensive onboarding process.</p>
        
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-200 transition-colors mb-6"
        >
          Start onboarding
        </button>

        <div className="text-sm text-neutral-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
