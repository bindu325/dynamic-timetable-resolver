import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, Lock, Mail, User, ShieldCheck, ArrowRight, Shield, Zap } from 'lucide-react';

const LoginPage = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back! Logged in successfully.');
    } catch (err) {
      error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Aurora Ambient Mesh Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4 p-0.5 transform hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#030712]/40 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-heading">
            <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AutoResolve
            </span>
          </h1>
          <p className="text-xs font-semibold text-indigo-300/80 mt-1.5 uppercase tracking-widest">
            AI-Assisted Timetable Conflict Optimizer
          </p>
        </div>

        {/* Login Glass Panel */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800/80 shadow-2xl shadow-black/80 relative">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-white font-heading">Welcome Back</h2>
              <p className="text-xs text-slate-400">Sign in to manage academic schedules</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Demo Roles */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Login Presets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@college.edu')}
                className="px-2 py-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('priya.sharma@college.edu')}
                className="px-2 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 hover:bg-emerald-900/50 text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@college.edu')}
                className="px-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>

        {/* Switch to Signup */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 ml-1 cursor-pointer"
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
