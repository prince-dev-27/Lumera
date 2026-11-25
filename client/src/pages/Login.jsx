import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role] = useState('customer');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        const user = await register(name, email, password, role);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTab = (mode) => {
    setIsLogin(mode);
    setFormError('');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-16 px-6 py-10 bg-[#FDFBF7] border border-luxury-border shadow-sm space-y-6">
      
      {/* Switcher Tab */}
      <div className="flex border-b border-luxury-border text-xs uppercase tracking-widest font-bold">
        <button
          type="button"
          onClick={() => toggleTab(true)}
          className={`flex-1 pb-4 text-center transition ${
            isLogin ? 'border-b-2 border-luxury-gold text-luxury-charcoal' : 'text-luxury-gray hover:text-luxury-charcoal'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => toggleTab(false)}
          className={`flex-1 pb-4 text-center transition ${
            !isLogin ? 'border-b-2 border-luxury-gold text-luxury-charcoal' : 'text-luxury-gray hover:text-luxury-charcoal'
          }`}
        >
          Register
        </button>
      </div>

      <h2 className="text-xl font-serif text-center text-luxury-charcoal">
        {isLogin ? 'Welcome Back to Lumera' : 'Create Account'}
      </h2>

      {/* Error Alert */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
          {formError}
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anjali Sharma"
                required
                className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
              />
            </div>

          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
          />
        </div>

        {isLogin && (
          <div className="text-right">
            <a href="#" className="text-[10px] text-luxury-gray hover:text-luxury-gold hover:underline">
              Forgot your password?
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-luxury-charcoal text-[#FDFBF7] hover:bg-luxury-gold hover:text-luxury-charcoal py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300 disabled:opacity-50"
        >
          {submitting
            ? 'Processing...'
            : isLogin
            ? 'Sign In'
            : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
