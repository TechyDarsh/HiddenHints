import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineStop,
  HiOutlineSpeakerWave,
  HiOutlineLanguage
} from 'react-icons/hi2';
import {
  formatProductSpeech,
  speak,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
  getVoices
} from '../../utils/speech';

const VoiceControls = ({ product, autoPlay = true }) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lang, setLang] = useState('en');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load voices
  useEffect(() => {
    getVoices().then(v => {
      setVoices(v);
      // Default to first English voice
      const enVoice = v.find(voice => voice.lang.startsWith('en'));
      if (enVoice) setSelectedVoice(enVoice);
    });
  }, []);

  // Auto-play on product change
  useEffect(() => {
    if (product && autoPlay) {
      handlePlay();
    }
    return () => {
      stopSpeech();
      setPlaying(false);
      setPaused(false);
    };
  }, [product]);

  const handlePlay = useCallback(() => {
    if (!product) return;

    const text = formatProductSpeech(product, lang);
    if (!text) return;

    const voice = lang === 'ta'
      ? voices.find(v => v.lang.startsWith('ta')) || selectedVoice
      : selectedVoice;

    speak(text, {
      rate: speed,
      voice,
      lang,
      onStart: () => { setPlaying(true); setPaused(false); },
      onEnd: () => { setPlaying(false); setPaused(false); },
      onError: () => { setPlaying(false); setPaused(false); }
    });
  }, [product, speed, lang, voices, selectedVoice]);

  const handlePause = () => {
    if (paused) {
      resumeSpeech();
      setPaused(false);
    } else {
      pauseSpeech();
      setPaused(true);
    }
  };

  const handleStop = () => {
    stopSpeech();
    setPlaying(false);
    setPaused(false);
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ta' : 'en';
    setLang(newLang);
    handleStop();
  };

  return (
    <div className="voice-controls">
      {/* Play */}
      <button
        className={`voice-btn play`}
        onClick={handlePlay}
        title="Play"
        disabled={!product}
      >
        <HiOutlinePlay />
      </button>

      {/* Pause/Resume */}
      <button
        className={`voice-btn pause`}
        onClick={handlePause}
        title={paused ? 'Resume' : 'Pause'}
        disabled={!playing}
      >
        <HiOutlinePause />
      </button>

      {/* Stop */}
      <button
        className={`voice-btn stop`}
        onClick={handleStop}
        title="Stop"
        disabled={!playing}
      >
        <HiOutlineStop />
      </button>

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: playing ? 'var(--success-400)' : 'var(--text-muted)'
      }}>
        <HiOutlineSpeakerWave size={16} />
        {playing ? (paused ? 'Paused' : 'Speaking...') : 'Ready'}
      </div>

      {/* Speed Control */}
      <div className="speed-control">
        <span>{speed.toFixed(1)}x</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          title="Speech speed"
        />
      </div>

      {/* Language Toggle */}
      <button
        className="language-toggle btn btn-ghost btn-sm"
        onClick={toggleLang}
        title={`Switch to ${lang === 'en' ? 'Tamil' : 'English'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <HiOutlineLanguage size={14} />
        {lang === 'en' ? 'EN' : 'தமிழ்'}
      </button>

      {/* Voice selector */}
      {voices.length > 0 && (
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const v = voices.find(voice => voice.name === e.target.value);
            if (v) setSelectedVoice(v);
          }}
          className="form-select"
          style={{
            maxWidth: '140px',
            padding: '4px 8px',
            fontSize: '0.75rem'
          }}
        >
          {voices
            .filter(v => v.lang.startsWith(lang === 'ta' ? 'ta' : 'en'))
            .slice(0, 15)
            .map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))
          }
        </select>
      )}
    </div>
  );
};

export default VoiceControls;
