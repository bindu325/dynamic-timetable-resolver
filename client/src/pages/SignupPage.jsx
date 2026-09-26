import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Lock, Mail, User, ArrowRight, UserPlus, Fingerprint, ShieldCheck } from "lucide-react";

const SignupPage = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FACULTY",
  });
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      success("Registration successful! Please login.");
      onSwitchToLogin();
    } catch (err) {
      error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#fcfbf9]">
      
      {/* Static "Scent" Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Core theme gradients matching the animation colors but perfectly static */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.15] blur-[120px]" style={{ background: '#f97316' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.15] blur-[100px]" style={{ background: '#ec4899' }} />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full opacity-[0.12] blur-[100px]" style={{ background: '#8b5cf6' }} />
        
        {/* Subtle grid pattern to reinforce the 'timetable' structure */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row-reverse relative z-10 w-full h-full max-w-7xl mx-auto">
        
        {/* Right Side: Strong Typography & Matter */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 lg:pl-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm mb-6">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Enterprise Access</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Join The <br/>
              <span style={{ background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Resolution Hub
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-md font-medium">
              Create your institutional account to gain access to the multi-constraint resolution engine and intelligent dashboard.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5 text-fuchsia-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Identity Verification</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Secure role-based access control guarantees your data is protected against unauthorized modifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side: Parallax Tilting Signup Card */}
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
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", opacity: 0.1 }} />
                  <UserPlus className="w-7 h-7 text-orange-500 relative z-10" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">
                  Create Account
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Register for autonomous scheduling access
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                      placeholder="name@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 shadow-sm"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="FACULTY">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                    }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
