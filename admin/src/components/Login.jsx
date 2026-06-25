import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate delay for cinematic feel
    setTimeout(async () => {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-dark relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-luxury-gold/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel w-full max-w-md p-10 relative z-10 mx-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center">
            <Shield className="text-luxury-gold" size={32} />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-white tracking-wide mb-2">AURA RESERVE</h1>
          <p className="text-luxury-gold/70 text-xs uppercase tracking-[0.3em] font-bold">Secure Admin Portal</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury-gold transition-colors font-light"
              placeholder="admin@aura.com"
              required
            />
          </div>
          <div>
            <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-luxury-gold transition-colors font-light"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-luxury-gold hover:bg-white text-black py-4 rounded-lg transition-colors duration-300 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-50 mt-8"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                Authenticating
              </span>
            ) : (
              <>Access Dashboard <ChevronRight size={16} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
