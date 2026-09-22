import { useEffect, useRef, useState } from 'react';

/* ============================================
   HabitFlow Landing Page
   ============================================ */

const WEB_APP_URL = 'http://localhost:8081';
const APK_URL = '/habitflow.apk';

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AppPreview />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}

/* ---------- Intersection Observer Hook ---------- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* =============================================
   NAVBAR
   ============================================= */
function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <a href="#" className="navbar-logo">
          <span className="navbar-logo-icon">📊</span>
          HabitFlow
        </a>

        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#preview">Preview</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>

        <div className="navbar-cta">
          <a href={WEB_APP_URL} className="btn btn-secondary">Log In</a>
          <a href={WEB_APP_URL} className="btn btn-primary">Get Started</a>
        </div>
      </div>
    </nav>
  );
}

/* =============================================
   HERO
   ============================================= */
function Hero() {
  const ref = useReveal();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner" ref={ref}>
          <div className="reveal visible">
            <div className="hero-badge">
              🚀 Now with Gamification & Streak Engine
            </div>
            <h1 className="hero-title">
              Build better habits.<br />
              <span className="highlight">One day at a time.</span>
            </h1>
            <p className="hero-subtitle">
              HabitFlow helps you create routines, track streaks, earn points, and
              visualize your progress — all in a beautiful, intuitive interface.
            </p>

            <div className="hero-buttons">
              <a href={APK_URL} download="HabitFlow.apk" className="btn btn-primary btn-lg">
                📲 Download App
              </a>
              <a href={WEB_APP_URL} className="btn btn-dark">
                🌐 Use Web Version
              </a>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#8c827a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>✓ Android APK (v1.0.0)</span>
              <span>•</span>
              <span>✓ Direct Install</span>
              <span>•</span>
              <span>✓ Free & Fast</span>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">10k+</div>
                <div className="hero-stat-label">Habits Tracked</div>
              </div>
              <div>
                <div className="hero-stat-value">🔥 4.9</div>
                <div className="hero-stat-label">User Rating</div>
              </div>
              <div>
                <div className="hero-stat-value">98%</div>
                <div className="hero-stat-label">Uptime</div>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal visible">
            <div className="phone-mockup">
              <div className="float-badge float-badge-streak">
                🔥 7 Day Streak!
              </div>
              <div className="float-badge float-badge-points">
                ⭐ +10 Points
              </div>
              <div className="phone-frame">
                <img
                  src="/screenshots/home.jpg"
                  alt="HabitFlow Home Screen showing daily habits with streak tracking"
                  loading="eager"
                />
              </div>
            </div>
            <div className="phone-secondary">
              <div className="phone-frame">
                <img
                  src="/screenshots/progress.jpg"
                  alt="HabitFlow Progress Screen with analytics and gamification"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================
   FEATURES
   ============================================= */
const FEATURES = [
  {
    icon: '🔥',
    iconClass: 'feature-icon-streak',
    title: 'Streak Tracking',
    desc: 'Never break the chain! HabitFlow calculates your current and best streaks automatically, keeping you motivated day after day.',
  },
  {
    icon: '🔔',
    iconClass: 'feature-icon-reminder',
    title: 'Smart Reminders',
    desc: 'Set personalized reminders for each habit. Get notified at the perfect time so you never miss your daily routines.',
  },
  {
    icon: '📊',
    iconClass: 'feature-icon-analytics',
    title: 'Progress Analytics',
    desc: 'Beautiful charts and statistics show your completion rates, weekly trends, and monthly breakdowns at a glance.',
  },
  {
    icon: '🏆',
    iconClass: 'feature-icon-gamification',
    title: 'Gamification',
    desc: 'Earn points for every completion, unlock badges for milestones, and level up as you build consistency.',
  },
  {
    icon: '📶',
    iconClass: 'feature-icon-offline',
    title: 'Offline-First',
    desc: 'Works without internet. Your habits sync automatically when you reconnect — no data loss, ever.',
  },
  {
    icon: '🔒',
    iconClass: 'feature-icon-security',
    title: 'Secure & Private',
    desc: 'JWT authentication, encrypted passwords, and user-isolated data. Your habits are yours alone.',
  },
];

function Features() {
  const ref = useReveal();

  return (
    <section className="section features" id="features">
      <div className="container">
        <div className="section-header reveal" ref={ref}>
          <div className="section-badge">✨ Features</div>
          <h2 className="section-title">Everything you need to build consistency</h2>
          <p className="section-subtitle">
            From streak tracking to gamification, HabitFlow gives you the tools to
            create lasting habits with a premium, intuitive experience.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  iconClass,
  title,
  desc,
  delay,
}: {
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div className="feature-card reveal" ref={ref}>
      <div className={`feature-icon ${iconClass}`}>{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

/* =============================================
   HOW IT WORKS
   ============================================= */
const STEPS = [
  {
    num: '1',
    title: 'Create Your Habits',
    desc: 'Add habits with custom icons, colors, frequency, goals, and optional reminders.',
  },
  {
    num: '2',
    title: 'Track Every Day',
    desc: 'Check off completed habits daily. Watch your streaks grow and earn points for consistency.',
  },
  {
    num: '3',
    title: 'See Your Progress',
    desc: 'Visualize completion rates, unlock badges, and level up with beautiful analytics dashboards.',
  },
];

function HowItWorks() {
  const ref = useReveal();

  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-header reveal" ref={ref}>
          <div className="section-badge">🎯 How It Works</div>
          <h2 className="section-title">Three steps to better habits</h2>
          <p className="section-subtitle">
            Getting started with HabitFlow takes less than a minute. Here's how
            you'll build lasting routines.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <StepCard key={i} {...s} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  num,
  title,
  desc,
  delay,
}: {
  num: string;
  title: string;
  desc: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div className="step-card reveal" ref={ref}>
      <div className="step-number">{num}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-desc">{desc}</p>
    </div>
  );
}

/* =============================================
   APP PREVIEW
   ============================================= */
function AppPreview() {
  const ref = useReveal();

  return (
    <section className="section preview" id="preview">
      <div className="container">
        <div className="section-header reveal" ref={ref}>
          <div className="section-badge">📱 App Preview</div>
          <h2 className="section-title">Designed to feel premium</h2>
          <p className="section-subtitle">
            A warm, intuitive interface inspired by the best mobile experiences.
            Every detail crafted for delight.
          </p>
        </div>

        <div className="preview-showcase">
          <div className="preview-phone reveal" ref={useReveal()}>
            <img
              src="/screenshots/home.jpg"
              alt="Home Screen — daily habits, streaks, reminders"
            />
            <div className="preview-phone-label">Home Screen</div>
          </div>
          <div className="preview-phone reveal" ref={useReveal()}>
            <img
              src="/screenshots/reference.png"
              alt="All Screens — Home, Add Habit, Progress"
            />
            <div className="preview-phone-label">All Screens</div>
          </div>
          <div className="preview-phone reveal" ref={useReveal()}>
            <img
              src="/screenshots/progress.jpg"
              alt="Progress Screen — analytics, points, charts"
            />
            <div className="preview-phone-label">Progress & Insights</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================
   TESTIMONIALS
   ============================================= */
const TESTIMONIALS = [
  {
    stars: '★★★★★',
    text: '"HabitFlow completely changed my morning routine. The streak tracking keeps me accountable and I love watching my progress grow!"',
    name: 'Priya Sharma',
    role: 'Product Designer',
    avatar: 'P',
  },
  {
    stars: '★★★★★',
    text: '"The gamification features are brilliant. Earning badges and leveling up makes habit building genuinely fun. Best tracker I have used."',
    name: 'Arjun Mehta',
    role: 'Software Engineer',
    avatar: 'A',
  },
  {
    stars: '★★★★★',
    text: '"Finally an app that works offline! I can track my habits during my commute and everything syncs when I am back online. Beautiful design too."',
    name: 'Neha Gupta',
    role: 'Fitness Coach',
    avatar: 'N',
  },
];

function Testimonials() {
  const ref = useReveal();

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-header reveal" ref={ref}>
          <div className="section-badge">💬 Testimonials</div>
          <h2 className="section-title">Loved by habit builders</h2>
          <p className="section-subtitle">
            Join thousands of people who've transformed their routines with HabitFlow.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} {...t} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  stars,
  text,
  name,
  role,
  avatar,
  delay,
}: {
  stars: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div className="testimonial-card reveal" ref={ref}>
      <div className="testimonial-stars">{stars}</div>
      <p className="testimonial-text">{text}</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   CTA BANNER
   ============================================= */
function CTABanner() {
  const ref = useReveal();

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card reveal" ref={ref}>
          <h2 className="cta-title">Start building better habits today</h2>
          <p className="cta-subtitle">
            Free to use. No credit card required. Available on web and Android.
          </p>
          <div className="cta-buttons">
            <a href={WEB_APP_URL} className="btn btn-white">
              🌐 Launch Web App
            </a>
            <a href={APK_URL} download="HabitFlow.apk" className="btn btn-outline-white">
              📲 Download APK
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================
   FOOTER
   ============================================= */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-name">
              <span className="navbar-logo-icon">📊</span>
              HabitFlow
            </div>
            <p className="footer-brand-desc">
              Build better habits with streak tracking, smart reminders,
              gamification, and beautiful progress analytics.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#preview">Preview</a></li>
                <li><a href={APK_URL} download="HabitFlow.apk">Download APK</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Resources</div>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} HabitFlow. Built with ☕ Spring Boot + ⚛️ React.
          </div>
          <div className="footer-social">
            <a href="#" aria-label="GitHub">🐙</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
