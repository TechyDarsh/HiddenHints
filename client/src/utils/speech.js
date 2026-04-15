/**
 * Text-to-Speech utility using Web Speech API
 */

// Format product data into human-friendly speech text
export const formatProductSpeech = (product, lang = 'en') => {
  if (!product) return '';

  const isExpired = new Date() > new Date(product.expiry_date);
  const mfgDate = new Date(product.mfg_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const expDate = new Date(product.expiry_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (lang === 'ta') {
    // Tamil version
    let text = `இது ${product.name}. ${product.brand} நிறுவனம் தயாரித்தது.`;
    if (product.ingredients) text += ` இதில் ${product.ingredients} உள்ளது.`;
    text += ` தயாரிக்கப்பட்ட தேதி ${mfgDate}. காலாவதி தேதி ${expDate}.`;
    if (isExpired) text += ' எச்சரிக்கை! இந்த பொருள் காலாவதியானது. பயன்படுத்த வேண்டாம்.';
    if (product.allergens && product.allergens !== 'None') {
      text += ` ஒவ்வாமை எச்சரிக்கை: ${product.allergens}.`;
    }
    if (product.warnings) text += ` பாதுகாப்பு எச்சரிக்கை: ${product.warnings}`;
    return text;
  }

  // English version
  let text = `This product is ${product.name}, manufactured by ${product.brand}.`;

  if (isExpired) {
    text += ' WARNING: This product is EXPIRED. Do not use this product.';
  }

  if (product.ingredients) {
    text += ` It contains ${product.ingredients}.`;
  }

  text += ` Manufactured on ${mfgDate}. Expires on ${expDate}.`;

  if (product.allergens && product.allergens.toLowerCase() !== 'none') {
    text += ` Allergen Warning: Contains ${product.allergens}.`;
  }

  if (product.nutrition && product.nutrition.toLowerCase() !== 'not applicable') {
    text += ` Nutritional information: ${product.nutrition}.`;
  }

  if (product.usage) {
    text += ` Usage instructions: ${product.usage}`;
  }

  if (product.warnings) {
    text += ` Safety warning: ${product.warnings}`;
  }

  return text;
};

// Get available voices
export const getVoices = () => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};

// Create and speak an utterance
export const speak = (text, options = {}) => {
  if (!window.speechSynthesis) {
    console.warn('Speech Synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  if (options.voice) {
    utterance.voice = options.voice;
  }

  if (options.lang) {
    utterance.lang = options.lang === 'ta' ? 'ta-IN' : 'en-US';
  }

  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onPause) utterance.onpause = options.onPause;
  if (options.onResume) utterance.onresume = options.onResume;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const pauseSpeech = () => window.speechSynthesis?.pause();
export const resumeSpeech = () => window.speechSynthesis?.resume();
export const stopSpeech = () => window.speechSynthesis?.cancel();
export const isSpeaking = () => window.speechSynthesis?.speaking || false;
export const isPaused = () => window.speechSynthesis?.paused || false;
