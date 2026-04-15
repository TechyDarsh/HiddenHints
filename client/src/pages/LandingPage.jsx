import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';
import GooeyNav from '../components/GooeyNav';

// ── Configuration ──
const TOTAL_FRAMES = 192;
const FRAME_NAMES = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(i).padStart(3, '0');
  // Files were copied to /public/frames/
  return `/frames/frame_${num}_delay-0.041s.webp`;
});

const TEXT_OVERLAYS = [
  {
    heading: 'Every product has a story.',
    sub: 'What if you could read it before you buy?',
    position: 'left', start: 0.02, end: 0.16,
  },
  {
    heading: 'Just point. Scan. Know.',
    sub: 'Hidden Hints uses AI to decode every ingredient label in seconds.',
    position: 'right', start: 0.18, end: 0.32,
  },
  {
    heading: 'See what others miss.',
    sub: 'Our deep analysis reveals additives, allergens, and hidden chemicals — in plain language.',
    position: 'left', start: 0.34, end: 0.48,
  },
  {
    heading: 'Your health, decoded.',
    sub: 'Personalized risk scores based on your dietary needs and health profile.',
    position: 'right', start: 0.50, end: 0.65,
  },
  {
    heading: 'Clean alternatives, instantly.',
    sub: 'Found something harmful? We suggest safer, verified products in real time.',
    position: 'left', start: 0.68, end: 0.85,
  },
  {
    heading: 'Hidden Hints',
    sub: 'Access the Smart Product Intelligence System now.',
    position: 'bottom', isFinale: true, start: 0.88, end: 1.0,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(-1);
  const [textOpacity, setTextOpacity] = useState(0);
  const [textTranslateY, setTextTranslateY] = useState(30);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Login', href: '/login' },
  ];

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    const images = [];

    FRAME_NAMES.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      const done = () => {
        loaded++;
        setLoadingProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          setImagesLoaded(true);
          setTimeout(() => setLoadingDone(true), 800);
        }
      };
      img.onload = done;
      img.onerror = done;
      images[index] = img;
    });

    imagesRef.current = images;
  }, []);

  // Draw frame logic — COVER mode
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayW / displayH;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgRatio > canvasRatio) {
      sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / canvasRatio;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, displayW, displayH);
  }, []);

  // Scroll handler with RAF
  useEffect(() => {
    if (!imagesLoaded) return;
    drawFrame(0);

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollableH = container.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableH));

        setScrollProgress(progress);
        setNavScrolled(window.scrollY > 60);

        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
        if (frameIndex !== frameIndexRef.current) {
          frameIndexRef.current = frameIndex;
          drawFrame(frameIndex);
        }

        // Overlay Visibility Logic
        let currentTextIndex = -1, currentOpacity = 0, currentTranslateY = 30;

        for (let i = 0; i < TEXT_OVERLAYS.length; i++) {
          const { start, end } = TEXT_OVERLAYS[i];
          if (progress >= start && progress <= end) {
            currentTextIndex = i;
            const mid = (start + end) / 2;
            const fadeInRange = mid - start;
            const fadeOutRange = end - mid;

            if (progress < mid) {
              const fp = (progress - start) / fadeInRange;
              currentOpacity = Math.min(1, fp * 1.5);
              currentTranslateY = 40 * (1 - fp);
            } else {
              const fp = (progress - mid) / fadeOutRange;
              currentOpacity = Math.max(0, 1 - fp * 1.5);
              currentTranslateY = -20 * fp;
            }
            break;
          }
        }

        setActiveTextIndex(currentTextIndex);
        setTextOpacity(currentOpacity);
        setTextTranslateY(currentTranslateY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [imagesLoaded, drawFrame]);

  // Resize handler
  useEffect(() => {
    const onResize = () => drawFrame(frameIndexRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFrame]);

  return (
    <div className="landing-page-root">
      {/* ── Loading ── */}
      {!loadingDone && (
        <div className={`loading-screen ${imagesLoaded ? 'loading-exit' : ''}`}>
          <div className="loading-content">
            <div className="loading-icon-ring">
              <svg viewBox="0 0 100 100" className="loading-ring-svg">
                <circle cx="50" cy="50" r="42" className="loading-ring-track" />
                <circle
                  cx="50" cy="50" r="42"
                  className="loading-ring-progress"
                  style={{ strokeDashoffset: 264 - (264 * loadingProgress / 100) }}
                />
              </svg>
              <div className="loading-percent-inner">{loadingProgress}%</div>
            </div>
            <div className="loading-brand">Hidden Hints</div>
            <div className="loading-tagline">Preparing experience · {TOTAL_FRAMES} frames</div>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className={`navbar ${navScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <div className="nav-logo-mark"><span className="logo-diamond">◈</span></div>
            <span className="nav-logo-text">Hidden<span className="logo-bold">Hints</span></span>
          </Link>

          <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
            <GooeyNav items={navItems} />
            <button className="nav-cta" onClick={() => navigate('/login')}>Login / Admin</button>
          </div>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'menu-open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-line menu-line-1" />
            <span className="menu-line menu-line-2" />
            <span className="menu-line menu-line-3" />
          </button>
        </div>
      </nav>

      <section className="scroll-animation-section" ref={containerRef}>
        <div className="sticky-canvas-wrapper">
          <canvas ref={canvasRef} className="frame-canvas" />

          {/* Scroll hint */}
          <div className="scroll-start-hint" style={{ opacity: scrollProgress < 0.02 ? 1 : 0 }}>
            <div className="scroll-mouse"><div className="scroll-mouse-dot" /></div>
            <span className="scroll-hint-text">Scroll to explore</span>
          </div>

          {/* Text overlays */}
          <div className="text-overlay-container">
            {TEXT_OVERLAYS.map((overlay, index) => (
              <div
                key={index}
                className={`text-overlay text-overlay-center ${activeTextIndex === index ? 'active' : ''}`}
                style={{
                  opacity: activeTextIndex === index ? textOpacity : 0,
                  transform: `translate(-50%, calc(-50% + ${textTranslateY}px))`,
                  pointerEvents: activeTextIndex === index ? 'auto' : 'none',
                }}
              >
                <div className="elegant-text-display">
                  {!overlay.isFinale && (
                    <div className="text-overlay-step">
                      <span className="step-number">Step 0{index + 1}</span>
                    </div>
                  )}
                  <h2 className={overlay.isFinale ? "finale-heading" : "elegant-heading"}>
                    {overlay.heading}
                  </h2>
                  <p className={overlay.isFinale ? "finale-sub" : "elegant-sub"}>
                    {overlay.sub}
                  </p>
                  {overlay.isFinale && (
                    <button className="cta-button" onClick={() => navigate('/scanner')} style={{ marginTop: '2rem' }}>
                        Start Scanning Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="scroll-progress-bar">
            <div className="scroll-progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <div className="section-header">
            <span className="section-label">Capabilities</span>
            <h2 className="section-title">Why Hidden Hints?</h2>
            <p className="section-subtitle">Everything you need to make truly informed decisions about what you consume.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Instant Scan',       desc: 'Point your camera and get results in under 2 seconds. No typing required.' },
              { icon: '🧬', title: 'Deep Analysis',      desc: 'AI breaks down every single ingredient into plain, understandable language.' },
              { icon: '🛡️', title: 'Safety Alerts',     desc: 'Personalized warnings tailored to your allergies and health conditions.' },
              { icon: '📊', title: 'Smart Scores',       desc: 'Clean numerical ratings so you can compare products at a glance.' },
              { icon: '🌿', title: 'Clean Alternatives', desc: 'Found something harmful? We instantly suggest safer, verified options.' },
              { icon: '🔒', title: 'Private & Secure',   desc: 'Your scans and health data stay on your device. Always encrypted.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrap"><span className="feature-icon">{f.icon}</span></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="how-it-works">
        <div className="cta-content">
          <h2 className="cta-title">Ready to see the <span className="cta-title-accent">unseen?</span></h2>
          <p className="cta-description">Start using the Smart Product Intelligence System today.</p>
          <button className="cta-button" onClick={() => navigate('/scanner')}>
             Open Scanner
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand"><span className="footer-logo-icon">◈</span> Hidden Hints</div>
          <div className="footer-links">
             <Link to="/login" className="footer-link">Admin Login</Link>
             <Link to="/scanner" className="footer-link">Scanner</Link>
          </div>
          <p className="footer-copyright">© 2026 Hidden Hints. Integrated with SPIS.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
