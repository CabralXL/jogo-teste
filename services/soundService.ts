let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'click' | 'win' | 'draw') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);
      osc.type = 'sine';
      
      // Frequency sweep for a nice "pop"
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      
      // Amplitude envelope
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } 
    
    else if (type === 'win') {
      // Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        
        const startTime = now + (i * 0.1);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        noteGain.gain.setValueAtTime(0.1, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } 
    
    else if (type === 'draw') {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.4);
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    }

  } catch (e) {
    console.warn("Audio play failed", e);
  }
};