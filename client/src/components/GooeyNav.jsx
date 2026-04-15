import { useRef, useEffect, useState } from 'react';

/**
 * GooeyNav Component
 * Integrated with Hidden Hints theme for SPIS
 */
const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('gooey-particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--green-${p.color}00, #34a853)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('gooey-point');
        particle.appendChild(point);
        element.appendChild(particle);
        
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch (e) {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleClick = (e, index) => {
    const liEl = e.currentTarget;
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(liEl);
    
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.gooey-particle');
      particles.forEach(p => filterRef.current.removeChild(p));
    }
    
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
    
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const liElements = navRef.current.querySelectorAll('li');
    const activeLi = liElements[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }
    
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <style>
        {`
          :root {
            --gooey-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
          }
          .gooey-nav-container {
            position: relative;
            display: inline-block;
          }
          .gooey-nav {
            display: flex;
            position: relative;
            z-index: 3;
          }
          .gooey-nav-list {
            display: flex;
            gap: 1.5rem;
            list-style: none;
            padding: 0;
            margin: 0;
            color: var(--text-secondary);
          }
          .gooey-nav-item {
            position: relative;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .gooey-nav-item a {
            outline: none;
            padding: 0.6rem 1.2rem;
            display: inline-block;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            color: inherit;
          }
          .gooey-effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          .gooey-effect.text {
            color: var(--text-secondary);
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            transition: color 0.3s ease;
            white-space: nowrap;
          }
          .gooey-effect.text.active {
            color: white !important;
          }
          .gooey-effect.filter {
            filter: blur(6px) contrast(80);
            mix-blend-mode: multiply;
          }
          .navbar-scrolled .gooey-effect.filter {
            mix-blend-mode: normal;
          }
          .gooey-effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: var(--green-500);
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
            transition: transform 0.4s var(--gooey-ease);
          }
          .gooey-effect.active::after {
            transform: scale(1);
            opacity: 1;
          }
          .gooey-particle,
          .gooey-point {
            display: block;
            opacity: 0;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            transform-origin: center;
          }
          .gooey-particle {
            --time: 600ms;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: gooeyParticle var(--time) ease 1 forwards;
          }
          .gooey-point {
            background: var(--color);
            opacity: 1;
            animation: gooeyPoint var(--time) ease 1 forwards;
          }
          @keyframes gooeyParticle {
            0% {
              transform: rotate(0deg) translate(var(--start-x), var(--start-y));
              opacity: 1;
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
            }
            100% {
              transform: rotate(var(--rotate)) translate(var(--end-x), var(--end-y));
              opacity: 1;
            }
          }
          @keyframes gooeyPoint {
            0% { transform: scale(0); opacity: 0; }
            40% { opacity: 1; }
            65% { transform: scale(var(--scale)); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
        `}
      </style>
      <nav className="gooey-nav">
        <ul ref={navRef} className="gooey-nav-list">
          {items.map((item, index) => (
            <li
              key={index}
              className={`gooey-nav-item ${activeIndex === index ? 'active' : ''}`}
            >
              <a
                href={item.href}
                onClick={e => handleClick(e, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="gooey-effect filter" ref={filterRef} />
      <span className="gooey-effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
