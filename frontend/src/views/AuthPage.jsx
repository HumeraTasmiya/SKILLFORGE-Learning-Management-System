import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  Medal,
  Phone,
  Rocket,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { dashboardPathForRole } from '../lib/useAuthUser.js';
import { STORAGE } from '../lib/storageKeys.js';

/* ─────────────────────────────────────────────
   Validation schema
───────────────────────────────────────────── */
const schema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(8),
  role: z.enum(['student', 'instructor', 'admin']).default('student'),
  terms: z.coerce.boolean().optional(),
});

const roleOptions = [
  { value: 'student',    label: 'Student',    icon: Users },
  { value: 'instructor', label: 'Instructor', icon: Award },
  { value: 'admin',      label: 'Admin',      icon: ShieldCheck },
];

function authDestinationForRole(role, from) {
  const dashboard = dashboardPathForRole(role);
  if (!from || from === '/login' || from === '/signup') return dashboard;
  if (from.startsWith('/dashboard') && from !== dashboard) return dashboard;
  return from;
}

const signupStats = [
  ['10,000+', 'Students Enrolled',  Users],
  ['500+',    'Expert Instructors', Medal],
  ['95%',     'Success Rate',       CheckCircle2],
];

const signupBenefits = [
  'Access to 1000+ courses',
  'Learn from industry experts',
  'Get certified upon completion',
  'Lifetime access to materials',
];

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const fadeLeft  = { hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0 } };
const fadeRight = { hidden: { opacity: 0, x:  36 }, show: { opacity: 1, x: 0 } };
const fadeUp    = { hidden: { opacity: 0, y:  28 }, show: { opacity: 1, y: 0 } };

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut', delay } },
});

/* ─────────────────────────────────────────────
   Keyframes — injected once
───────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes gradientShift {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}
@keyframes btnGlow {
  0%,100% { background-position: 0%   50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes floatOrb {
  0%,100% { transform: translateY(0)    scale(1);    }
  50%     { transform: translateY(-22px) scale(1.05); }
}
@keyframes authAurora {
  0%   { transform: translate3d(-8%, -4%, 0) scale(1); opacity: .7; }
  50%  { transform: translate3d(8%, 5%, 0) scale(1.08); opacity: 1; }
  100% { transform: translate3d(-8%, -4%, 0) scale(1); opacity: .7; }
}
@keyframes authGrid {
  0%   { background-position: 0 0, 0 0; }
  100% { background-position: 56px 56px, -56px 56px; }
}
`;

/* ─────────────────────────────────────────────
   Shared style factories
───────────────────────────────────────────── */
const pageBg = (dark) => ({
  minHeight: 'calc(100vh - 69px)',
  background: dark
    ? 'linear-gradient(135deg,#020617,#111827,#1e1b4b,#020617)'
    : '#f8fafc',
  backgroundSize: dark ? '300% 300%' : undefined,
  animation: dark ? 'gradientShift 12s ease infinite' : undefined,
  position: 'relative',
  overflow: 'hidden',
});

const leftPanel = (dark) => ({
  background: dark
    ? '#111827'
    : '#f1f5f9',
  padding: 'clamp(2rem,5vw,5rem)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2rem',
});

const rightPanel = (dark) => ({
  background: dark
    ? '#0f172a'
    : '#ffffff',
  padding: 'clamp(2rem,5vw,4.5rem)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflowY: 'auto',
});

const inputStyle = (dark) => ({
  height: '3rem',
  width: '100%',
  borderRadius: '0.75rem',
  border: `1.5px solid ${dark ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}`,
  background: dark
    ? '#1e293b'
    : '#f1f5f9',
  paddingLeft: '2.4rem',
  fontSize: '0.875rem',
  color: dark ? '#f1f5f9' : '#0f172a',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
  boxSizing: 'border-box',
});

const btnStyle = (dark) => ({
  marginTop: '1.5rem',
  height: '3rem',
  width: '100%',
  borderRadius: '0.75rem',
  border: 'none',
  background: dark
    ? 'linear-gradient(135deg,#818cf8,#6366f1,#a78bfa,#818cf8)'
    : 'linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed,#6366f1)',
  backgroundSize: '300% 300%',
  animation: 'btnGlow 5s ease infinite',
  color: '#fff',
  fontWeight: 900,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'transform .15s, box-shadow .15s',
  boxShadow: `0 4px 22px rgba(99,102,241,${dark ? '0.45' : '0.35'})`,
});

const statCard = (dark) => ({
  borderRadius: '1rem',
  border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
  background: dark
    ? '#1e293b'
    : '#ffffff',
  backdropFilter: 'blur(10px)',
  padding: '1rem 0.75rem',
  textAlign: 'center',
  boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(99,102,241,0.07)',
});

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = mode === 'signup';

  const { theme } = useSelector((state) => state.ui);
  const dark = theme === 'dark';
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  /* Responsive listener */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { register, handleSubmit, formState, setError, clearErrors, watch, setValue } = useForm({
    defaultValues: { role: 'student', terms: false },
  });
  const { isSubmitting } = formState;
  const selectedRole = watch('role');

  const onSubmit = async (formData) => {
    clearErrors('root');
    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      setError('root', { message: parsed.error.issues[0]?.message || 'Please check your details.' });
      return;
    }
    if (isSignup && !parsed.data.name)  { setError('root', { message: 'Please enter your full name.' });      return; }
    if (isSignup && !parsed.data.phone) { setError('root', { message: 'Please enter your phone number.' });  return; }
    if (isSignup && !parsed.data.terms) { setError('root', { message: 'Please agree to the Terms of Service.' }); return; }

    try {
      const endpoint = isSignup ? '/auth/register' : '/auth/login';
      const emailNorm = String(parsed.data.email || '').trim().toLowerCase();
      const payload = isSignup
        ? {
            name: parsed.data.name?.trim(),
            email: emailNorm,
            phone: parsed.data.phone?.trim(),
            password: parsed.data.password,
            role: parsed.data.role,
          }
        : { email: emailNorm, password: parsed.data.password };
      const { data } = await api.post(endpoint, payload);
      if (data.token) localStorage.setItem(STORAGE.token, data.token);
      if (data.user) localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
      window.dispatchEvent(new Event('skillforge-auth'));
      const role = data.user?.role || parsed.data.role || 'student';
      navigate(authDestinationForRole(role, location.state?.from), { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request
          ? 'Could not reach the auth server. Check that the backend is running and this page is opened from localhost or 127.0.0.1.'
          : 'Authentication failed.');
      setError('root', { message });
    }
  };

  /* Input focus/blur handlers */
  const focusIn  = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; };
  const focusOut = (e) => { e.target.style.borderColor = dark ? 'rgba(99,102,241,0.25)' : '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  /* ══════════════════════════════════════════
     LOGIN page
  ══════════════════════════════════════════ */
  if (!isSignup) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <main style={pageBg(dark)}>
          {dark && <DarkAnimatedBackground />}

          {/* Decorative orbs */}
          {[
            { top: '8%',  left: '4%',  size: 320, delay: 0,   color: dark ? 'rgba(99,102,241,0.1)'   : 'rgba(99,102,241,0.07)'  },
            { top: '55%', right: '5%', size: 240, delay: 1.5, color: dark ? 'rgba(167,139,250,0.09)' : 'rgba(167,139,250,0.06)' },
            { bottom: '8%', left: '30%', size: 180, delay: 3, color: dark ? 'rgba(6,182,212,0.07)'   : 'rgba(6,182,212,0.05)'  },
          ].map((orb, i) => (
            <div key={i} aria-hidden style={{
              position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
              width: orb.size, height: orb.size,
              top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              animationDelay: `${orb.delay}s`,
              animation: `floatOrb ${8 + i * 3}s ease-in-out infinite`,
            }} />
          ))}

          {/* Two-column grid — mirrors signup layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            minHeight: 'calc(100vh - 69px)',
            maxWidth: 1400,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}>

            {/* ════ LEFT PANEL ════ */}
            <motion.section
              variants={fadeLeft} initial="hidden" animate="show"
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={leftPanel(dark)}
            >
              {/* Badge */}
              <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  borderRadius: '2rem', padding: '0.4rem 1rem',
                  border: `1px solid ${dark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                  background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.85)',
                  fontSize: '0.8rem', fontWeight: 600,
                  color: dark ? '#a5b4fc' : '#4f46e5',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 10px rgba(99,102,241,0.1)',
                }}>
                  <Rocket style={{ width: 14, height: 14 }} /> Welcome Back
                </span>
              </motion.div>

              {/* Heading */}
              <motion.div variants={stagger(0.18)} initial="hidden" animate="show">
                <h1 style={{
                  fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
                  fontWeight: 900, lineHeight: 1.15,
                  color: dark ? '#f1f5f9' : '#0f172a',
                  marginBottom: '0.875rem',
                }}>
                  Continue Your{' '}
                  <span style={{
                    backgroundImage: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    Learning
                  </span>{' '}
                  Journey
                </h1>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: dark ? '#94a3b8' : '#64748b', maxWidth: '28rem' }}>
                  Sign back in to access your courses, track your progress, and keep building the skills that matter.
                </p>
              </motion.div>

              {/* Stat cards */}
              <motion.div
                variants={stagger(0.28)} initial="hidden" animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}
              >
                {signupStats.map(([value, label, Icon]) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -6, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 280 }}
                    style={statCard(dark)}
                  >
                    <div style={{
                      width: '2.4rem', height: '2.4rem', borderRadius: '50%', margin: '0 auto',
                      background: dark
                        ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.2))'
                        : 'linear-gradient(135deg,#e0e7ff,#ddd6fe)',
                      display: 'grid', placeItems: 'center',
                      color: dark ? '#a5b4fc' : '#6366f1',
                    }}>
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                    <p style={{ marginTop: '0.65rem', fontSize: '1.1rem', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a' }}>{value}</p>
                    <p style={{ marginTop: '0.15rem', fontSize: '0.68rem', color: dark ? '#94a3b8' : '#64748b' }}>{label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Benefits */}
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {signupBenefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.08, duration: 0.38 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.875rem', fontWeight: 500, color: dark ? '#cbd5e1' : '#475569' }}
                  >
                    <span style={{
                      width: '1.4rem', height: '1.4rem', flexShrink: 0, borderRadius: '50%',
                      display: 'grid', placeItems: 'center',
                      background: dark
                        ? 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.15))'
                        : 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                      color: dark ? '#34d399' : '#059669',
                    }}>
                      <Check style={{ width: 10, height: 10 }} />
                    </span>
                    {benefit}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* ════ RIGHT PANEL — FORM ════ */}
            <motion.form
              variants={fadeRight} initial="hidden" animate="show"
              transition={{ duration: 0.65, ease: 'easeOut' }}
              onSubmit={handleSubmit(onSubmit)}
              style={rightPanel(dark)}
            >
              <motion.div variants={stagger(0.15)} initial="hidden" animate="show">
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a' }}>Welcome Back</h2>
                <p style={{ marginTop: '0.3rem', fontSize: '0.85rem', color: dark ? '#94a3b8' : '#64748b' }}>
                  Sign in to continue your learning journey.
                </p>
              </motion.div>

              {/* Email & Password inputs */}
              <div style={{ marginTop: '1.6rem', display: 'grid', gap: '1rem' }}>
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.38 }}
                  style={{ position: 'relative' }}
                >
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: dark ? '#cbd5e1' : '#374151' }}>
                    Email Address
                  </label>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '2.2rem', width: 14, height: 14, color: dark ? '#6366f1' : '#94a3b8' }} />
                  <input {...register('email')} type="email" placeholder="Enter your email" autoComplete="email"
                    style={inputStyle(dark)} onFocus={focusIn} onBlur={focusOut} />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.38 }}
                  style={{ position: 'relative' }}
                >
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: dark ? '#cbd5e1' : '#374151' }}>
                    Password
                  </label>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '2.2rem', width: 14, height: 14, color: dark ? '#6366f1' : '#94a3b8' }} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ ...inputStyle(dark), paddingRight: '2.5rem' }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <button type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '2.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: dark ? '#6366f1' : '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                  </button>
                </motion.div>
              </div>

              {/* Remember me + Forgot password */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.38 }}
                style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: dark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#6366f1', width: 13, height: 13 }} />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Role selector */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.38 }}
                style={{ marginTop: '1.2rem' }}
              >
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: dark ? '#cbd5e1' : '#374151' }}>Sign in as</p>
                <div style={{ marginTop: '0.55rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.7rem' }}>
                  {roleOptions.map(({ value, label, icon: Icon }) => {
                    const sel = selectedRole === value;
                    return (
                      <motion.button
                        key={value} type="button"
                        whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
                        onClick={() => setValue('role', value, { shouldDirty: true })}
                        style={{
                          height: '4.75rem',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          borderRadius: '0.875rem',
                          border: `2px solid ${sel ? '#6366f1' : dark ? 'rgba(99,102,241,0.2)' : '#e2e8f0'}`,
                          background: sel
                            ? dark
                              ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.18))'
                              : 'linear-gradient(135deg,#eef2ff,#ede9fe)'
                            : dark ? '#1e293b' : '#fff',
                          color: sel ? (dark ? '#a5b4fc' : '#4f46e5') : (dark ? '#94a3b8' : '#475569'),
                          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: sel ? `0 4px 18px rgba(99,102,241,${dark ? '0.32' : '0.18'})` : 'none',
                        }}
                      >
                        <Icon style={{ width: 17, height: 17 }} />
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
                <input type="hidden" {...register('role')} />
              </motion.div>

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 }}
                disabled={isSubmitting}
                style={btnStyle(dark)}
                onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(99,102,241,0.52)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 22px rgba(99,102,241,${dark ? '0.45' : '0.35'})`; }}
              >
                {isSubmitting ? 'Please wait…' : 'Sign In'}
              </motion.button>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ flex: 1, height: 1, background: dark ? 'rgba(99,102,241,0.15)' : '#e2e8f0' }} />
                <span style={{ fontSize: '0.72rem', color: dark ? '#64748b' : '#94a3b8', fontWeight: 500 }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: dark ? 'rgba(99,102,241,0.15)' : '#e2e8f0' }} />
              </motion.div>

              {/* Social buttons */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}
              >
                {[{ label: 'Google', Icon: Mail }, { label: 'GitHub', Icon: Github }].map(({ label, Icon }) => (
                  <button key={label} type="button" style={{
                    height: '2.75rem', borderRadius: '0.75rem',
                    border: `1.5px solid ${dark ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}`,
                    background: dark ? '#1e293b' : '#fff',
                    color: dark ? '#a5b4fc' : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                    transition: 'border-color .2s',
                  }}>
                    <Icon style={{ width: 14, height: 14 }} /> {label}
                  </button>
                ))}
              </motion.div>

              <AnimatePresence>
                {formState.errors.root && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#ef4444' }}
                  >
                    {formState.errors.root.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
                style={{ marginTop: '1.1rem', textAlign: 'center', fontSize: '0.8rem', color: dark ? '#94a3b8' : '#64748b' }}
              >
                Don't have an account?{' '}
                <Link to="/signup" style={{ fontWeight: 900, color: '#6366f1' }}>Register</Link>
              </motion.p>
            </motion.form>

          </div>
        </main>
      </>
    );
  }

  /* ══════════════════════════════════════════
     SIGNUP page
  ══════════════════════════════════════════ */
  return (
    <>
      <style>{KEYFRAMES}</style>

      <main style={pageBg(dark)}>
        {dark && <DarkAnimatedBackground />}
        {/* Decorative orbs */}
        {[
          { top: '8%',  left: '4%',  size: 320, delay: 0,  color: dark ? 'rgba(99,102,241,0.1)'  : 'rgba(99,102,241,0.07)'  },
          { top: '55%', right: '5%', size: 240, delay: 1.5, color: dark ? 'rgba(167,139,250,0.09)' : 'rgba(167,139,250,0.06)' },
          { bottom: '8%', left: '30%', size: 180, delay: 3, color: dark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)' },
        ].map((orb, i) => (
          <div key={i} aria-hidden style={{
            position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
            width: orb.size, height: orb.size,
            top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            animationDelay: `${orb.delay}s`,
            animation: `floatOrb ${8 + i * 3}s ease-in-out infinite`,
          }} />
        ))}

        {/* CSS Grid wrapper — 2 cols on desktop, 1 col on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          minHeight: 'calc(100vh - 69px)',
          maxWidth: 1400,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* ════ LEFT PANEL ════ */}
          <motion.section
            variants={fadeLeft} initial="hidden" animate="show"
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={leftPanel(dark)}
          >
            {/* Badge */}
            <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                borderRadius: '2rem', padding: '0.4rem 1rem',
                border: `1px solid ${dark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.85)',
                fontSize: '0.8rem', fontWeight: 600,
                color: dark ? '#a5b4fc' : '#4f46e5',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 10px rgba(99,102,241,0.1)',
              }}>
                <Rocket style={{ width: 14, height: 14 }} /> Start Your Journey
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div variants={stagger(0.18)} initial="hidden" animate="show">
              <h1 style={{
                fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
                fontWeight: 900, lineHeight: 1.15,
                color: dark ? '#f1f5f9' : '#0f172a',
                marginBottom: '0.875rem',
              }}>
                Join{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  SkillForge
                </span>{' '}
                Today
              </h1>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: dark ? '#94a3b8' : '#64748b', maxWidth: '28rem' }}>
                Create your free account and unlock access to world-class courses, expert instructors, and a thriving learning community.
              </p>
            </motion.div>

            {/* Stat cards — 3-col CSS Grid */}
            <motion.div
              variants={stagger(0.28)} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}
            >
              {signupStats.map(([value, label, Icon], i) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 280 }}
                  style={statCard(dark)}
                >
                  <div style={{
                    width: '2.4rem', height: '2.4rem', borderRadius: '50%', margin: '0 auto',
                    background: dark
                      ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.2))'
                      : 'linear-gradient(135deg,#e0e7ff,#ddd6fe)',
                    display: 'grid', placeItems: 'center',
                    color: dark ? '#a5b4fc' : '#6366f1',
                  }}>
                    <Icon style={{ width: 16, height: 16 }} />
                  </div>
                  <p style={{ marginTop: '0.65rem', fontSize: '1.1rem', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a' }}>{value}</p>
                  <p style={{ marginTop: '0.15rem', fontSize: '0.68rem', color: dark ? '#94a3b8' : '#64748b' }}>{label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits */}
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {signupBenefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.42 + i * 0.08, duration: 0.38 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.875rem', fontWeight: 500, color: dark ? '#cbd5e1' : '#475569' }}
                >
                  <span style={{
                    width: '1.4rem', height: '1.4rem', flexShrink: 0, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: dark
                      ? 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.15))'
                      : 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                    color: dark ? '#34d399' : '#059669',
                  }}>
                    <Check style={{ width: 10, height: 10 }} />
                  </span>
                  {benefit}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ════ RIGHT PANEL — FORM ════ */}
          <motion.form
            variants={fadeRight} initial="hidden" animate="show"
            transition={{ duration: 0.65, ease: 'easeOut' }}
            onSubmit={handleSubmit(onSubmit)}
            style={rightPanel(dark)}
          >
            <motion.div variants={stagger(0.15)} initial="hidden" animate="show">
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a' }}>Create Your Account</h2>
              <p style={{ marginTop: '0.3rem', fontSize: '0.85rem', color: dark ? '#94a3b8' : '#64748b' }}>
                Join SkillForge and start learning smarter today.
              </p>
            </motion.div>

            {/* Input fields */}
            <div style={{ marginTop: '1.6rem', display: 'grid', gap: '1rem' }}>
              {[
                { reg: register('name'),  label: 'Full Name',     Icon: User,  type: 'text',  ph: 'Enter your full name',    ac: 'name'  },
                { reg: register('email'), label: 'Email Address', Icon: Mail,  type: 'email', ph: 'Enter your email',        ac: 'email' },
                { reg: register('phone'), label: 'Phone Number',  Icon: Phone, type: 'tel',   ph: 'Enter your phone number', ac: 'tel'   },
              ].map(({ reg, label, Icon, type, ph, ac }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.07, duration: 0.38 }}
                  style={{ position: 'relative' }}
                >
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: dark ? '#cbd5e1' : '#374151' }}>
                    {label}
                  </label>
                  <Icon style={{ position: 'absolute', left: '0.75rem', top: '2.2rem', width: 14, height: 14, color: dark ? '#6366f1' : '#94a3b8' }} />
                  <input {...reg} type={type} placeholder={ph} autoComplete={ac}
                    style={inputStyle(dark)} onFocus={focusIn} onBlur={focusOut} />
                </motion.div>
              ))}

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.43, duration: 0.38 }}
                style={{ position: 'relative' }}
              >
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: dark ? '#cbd5e1' : '#374151' }}>
                  Password
                </label>
                <Lock style={{ position: 'absolute', left: '0.75rem', top: '2.2rem', width: 14, height: 14, color: dark ? '#6366f1' : '#94a3b8' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  style={{ ...inputStyle(dark), paddingRight: '2.5rem' }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <button type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '2.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: dark ? '#6366f1' : '#94a3b8' }}
                >
                  {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </motion.div>
            </div>

            {/* Role selector — 2-col CSS Grid */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.38 }}
              style={{ marginTop: '1.2rem' }}
            >
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: dark ? '#cbd5e1' : '#374151' }}>I want to register as</p>
              <div style={{ marginTop: '0.55rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.7rem' }}>
                {roleOptions.map(({ value, label, icon: Icon }) => {
                  const sel = selectedRole === value;
                  return (
                    <motion.button
                      key={value} type="button"
                      whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
                      onClick={() => setValue('role', value, { shouldDirty: true })}
                      style={{
                        height: '4.75rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        borderRadius: '0.875rem',
                        border: `2px solid ${sel ? '#6366f1' : dark ? 'rgba(99,102,241,0.2)' : '#e2e8f0'}`,
                        background: sel
                          ? dark
                            ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.18))'
                            : 'linear-gradient(135deg,#eef2ff,#ede9fe)'
                          : dark ? '#1e293b' : '#fff',
                        color: sel ? (dark ? '#a5b4fc' : '#4f46e5') : (dark ? '#94a3b8' : '#475569'),
                        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: sel ? `0 4px 18px rgba(99,102,241,${dark ? '0.32' : '0.18'})` : 'none',
                      }}
                    >
                      <Icon style={{ width: 17, height: 17 }} />
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              <input type="hidden" {...register('role')} />
            </motion.div>

            {/* Terms */}
            <motion.label
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }}
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.78rem', color: dark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
            >
              <input {...register('terms')} type="checkbox"
                style={{ marginTop: '0.1rem', accentColor: '#6366f1', width: 13, height: 13 }} />
              <span>
                I agree to the{' '}
                <Link to="/terms"    style={{ fontWeight: 700, color: '#6366f1' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy"  style={{ fontWeight: 700, color: '#6366f1' }}>Privacy Policy</Link>
              </span>
            </motion.label>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}
              disabled={isSubmitting}
              style={btnStyle(dark)}
              onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(99,102,241,0.52)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 22px rgba(99,102,241,${dark ? '0.45' : '0.35'})`; }}
            >
              {isSubmitting ? 'Please wait…' : 'Register'}
            </motion.button>

            <AnimatePresence>
              {formState.errors.root && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#ef4444' }}
                >
                  {formState.errors.root.message}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
              style={{ marginTop: '1.1rem', textAlign: 'center', fontSize: '0.8rem', color: dark ? '#94a3b8' : '#64748b' }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 900, color: '#6366f1' }}>Sign in</Link>
            </motion.p>
          </motion.form>
        </div>
      </main>
    </>
  );
}

function DarkAnimatedBackground() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.42,
        backgroundImage:
          'linear-gradient(rgba(99,102,241,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.14) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        animation: 'authGrid 18s linear infinite',
        maskImage: 'radial-gradient(circle at 50% 35%, black, transparent 72%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 35%, black, transparent 72%)',
      }} />
      <div style={{
        position: 'absolute',
        width: '42rem',
        height: '42rem',
        left: '-10rem',
        top: '-12rem',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,.42), rgba(6,182,212,.16), transparent 68%)',
        filter: 'blur(12px)',
        animation: 'authAurora 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '36rem',
        height: '36rem',
        right: '-9rem',
        bottom: '-10rem',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,.36), rgba(14,165,233,.14), transparent 70%)',
        filter: 'blur(14px)',
        animation: 'authAurora 13s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,.08), transparent 34%)',
      }} />
    </div>
  );
}
