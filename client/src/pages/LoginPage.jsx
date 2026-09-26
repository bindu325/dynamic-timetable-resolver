import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Lock, Mail, ArrowRight, Zap, Layers, Network, ShieldCheck } from "lucide-react";

const LoginPage = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("admin@college.edu");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  // Parallax Tilt Effect State
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const centerX = card.left + card.width / 2;
    const centerY = card.top + card.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation limits (max 10 degrees)
    const rotateY = (mouseX / (card.width / 2)) * 10;
    const rotateX = -(mouseY / (card.height / 2)) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success("Authentication Successful");
    } catch (err) {
      error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#fcfbf9]">
      
      {/* Static "Scent" Background (No heavy animations, just strong constant aesthetic) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Core theme gradients matching the animation colors but perfectly static */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.15] blur-[120px]" style={{ background: '#ec4899' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.15] blur-[100px]" style={{ background: '#f97316' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-[0.12] blur-[100px]" style={{ background: '#8b5cf6' }} />
        
        {/* Subtle grid pattern to reinforce the 'timetable' structure */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full h-full max-w-7xl mx-auto">
        
        {/* Left Side: Strong Typography & Matter */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 lg:pr-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm mb-6">
              <Zap className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Enterprise Edition</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Autonomous <br/>
              <span style={{ background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Scheduling Engine
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-md font-medium">
              Eliminate collisions and optimize institutional resources instantly. Powered by advanced Constraint Satisfaction algorithms to build 100% flawless timetables.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <Network className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Multi-Constraint Resolution</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Automatically balances faculty workloads, classroom capacities, and department schedules simultaneously.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Guaranteed Integrity</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Systematic validation ensures zero overlaps and flawless operational continuity across your entire campus.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Parallax Tilting Login Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative perspective-[1000px]">
          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-md p-10 flex flex-col justify-center transition-transform duration-200 ease-out"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(30px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Parallax Inner Content */}
            <div style={{ transform: 'translateZ(30px)' }}>
              <div className="flex flex-col items-center text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden mb-5 shadow-lg bg-white border border-slate-100"
                >
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)", opacity: 0.1 }} />
                  <Layers className="w-7 h-7 text-pink-500 relative z-10" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">
                  Secure Access
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Authenticate to access the resolver engine
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                      placeholder="name@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Security Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                    style={{
                      background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
                    }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Authenticate</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Fast Access Portals</p>
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleQuickLogin("admin@college.edu")} type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Admin
                  </button>
                  <button onClick={() => handleQuickLogin("hod_cse@college.edu")} type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    HOD
                  </button>
                  <button onClick={() => handleQuickLogin("prof.smith@college.edu")} type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Faculty
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
