import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle, TrendingUp, Users, Building2 } from 'lucide-react';
import { loginUser } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import { ROLES } from '../../constants/roles';
import ImaraLogo from '../../components/common/ImaraLogo';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const AnimatedLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  // Cycle through sections
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % 4); // 4 sections: hero, stats, features, trust
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data) => {
    try {
      const user = await dispatch(loginUser(data));
      const firstName = user.firstName || user.name?.split(' ')[0] || 'User';
      toast.success(`Welcome back, ${firstName}!`);
      const dest = user.role === ROLES.MEMBER ? '/portal' : (location.state?.from?.pathname || '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  const stats = [
    { value: '150K+', label: 'Members', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: '300+', label: 'SACCOs', icon: Building2, color: 'from-purple-500 to-pink-500' },
    { value: 'KES 10B+', label: 'Managed', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: '99.9%', label: 'Uptime', icon: CheckCircle, color: 'from-teal-500 to-blue-500' },
  ];

  const features = [
    { title: 'Member Management', desc: 'Secure member data and records', icon: Users },
    { title: 'Loan Management', desc: 'Streamlined credit services', icon: TrendingUp },
    { title: 'Financial Reporting', desc: 'Real-time analytics', icon: Building2 },
    { title: 'Mobile Banking', desc: 'Access anywhere', icon: Shield },
  ];

  const trustBadges = [
    { label: 'Bank Grade Security', icon: Shield },
    { label: 'CBK Compliant', icon: CheckCircle },
    { label: 'Data Encrypted', icon: Lock },
    { label: 'Two Factor Auth', icon: Shield },
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const slideLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* Left Side - Animated Content */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-12">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ImaraLogo size={24} />
            </motion.div>
            <div>
              <h2 className="text-white font-bold text-base">Imara SACCO</h2>
              <p className="text-slate-400 text-xs">Empowering Community Finance</p>
            </div>
          </motion.div>

          {/* Animated Sections */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* Section 1: Hero Text */}
              {currentSection === 0 && (
                <motion.div
                  key="hero"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -50 }}
                  variants={fadeIn}
                  className="text-center max-w-2xl"
                >
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold text-white mb-4"
                    variants={slideUp}
                    style={{
                      background: 'linear-gradient(to right, #10b981, #3b82f6, #10b981)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Elevate Your SACCO Operations
                  </motion.h1>
                  <motion.p 
                    className="text-lg text-slate-300"
                    variants={slideUp}
                  >
                    Join Kenya's leading co-operatives in streamlining operations
                  </motion.p>
                </motion.div>
              )}

              {/* Section 2: Statistics */}
              {currentSection === 1 && (
                <motion.div
                  key="stats"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="grid grid-cols-2 gap-6 max-w-3xl"
                >
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      variants={scaleIn}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                      >
                        <stat.icon size={24} className="text-white" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-white mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-slate-300 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Section 3: Features */}
              {currentSection === 2 && (
                <motion.div
                  key="features"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -50 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl"
                >
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      variants={slideLeft}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 group-hover:translate-x-full transition-transform duration-1000" />
                      <feature.icon size={32} className="text-teal-400 mb-3" />
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-slate-300 text-sm">{feature.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Section 4: Trust Badges */}
              {currentSection === 3 && (
                <motion.div
                  key="trust"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 50 }}
                  className="grid grid-cols-2 gap-6 max-w-2xl"
                >
                  {trustBadges.map((badge, idx) => (
                    <motion.div
                      key={idx}
                      variants={fadeIn}
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                      >
                        <badge.icon size={32} className="text-green-400 mx-auto mb-2" />
                      </motion.div>
                      <div className="text-white font-medium text-sm">{badge.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div 
            className="text-center text-xs text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>© 2026 Imara SACCO. All rights reserved.</p>
            <p className="mt-1">Designed by <span className="text-teal-400 font-semibold">Kevin Achae</span></p>
          </motion.div>
        </div>

        {/* Right Side - Login Card */}
        <motion.div 
          className="w-full lg:w-[420px] flex items-center justify-center p-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo */}
            <motion.div 
              className="flex items-center justify-center mb-5"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <ImaraLogo size={32} />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div 
              className="text-center mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back to Imara</h2>
              <p className="text-slate-600 text-xs">Sign in to access your SACCO dashboard</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <motion.input
                    {...register('email')}
                    type="email"
                    placeholder="admin@greenvalley.edu"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <motion.input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </motion.div>

              {/* Show Password Checkbox */}
              <div className="flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  Show password
                </label>
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative">{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
                </motion.button>
              </motion.div>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text-xs text-orange-600 hover:text-orange-700 font-medium transition">
                Forgot your password?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500">New to Imara?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="space-y-2">
              <Link 
                to="/register" 
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 text-xs rounded-lg transition"
              >
                Register your SACCO
              </Link>
              <Link 
                to="/join-member" 
                className="block w-full text-center text-slate-600 hover:text-slate-900 text-xs font-medium transition"
              >
                Apply for Membership
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedLogin;
