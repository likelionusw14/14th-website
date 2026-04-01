import { useState, useRef, useCallback, useEffect } from 'react';

// 8비트 MIDI 감성 멜로디 - [주파수(Hz), 길이(초)]
// 0 = 쉼표
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23;
const G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25;

const MELODY: [number, number][] = [
  // 파트 1: 밝은 인트로
  [E4, 0.2], [E4, 0.2], [0, 0.2], [E4, 0.2],
  [0, 0.2], [C4, 0.2], [E4, 0.2], [0, 0.2],
  [G4, 0.4], [0, 0.4],

  // 파트 2: 전개
  [C5, 0.3], [0, 0.1], [G4, 0.3], [0, 0.1],
  [E4, 0.3], [0, 0.1],
  [A4, 0.2], [B4, 0.2], [A4, 0.2], [0, 0.1],
  [G4, 0.25], [E5, 0.25], [G4, 0.25], [0, 0.15],

  // 파트 3: 클라이맥스
  [A4, 0.2], [0, 0.1], [F4, 0.2], [G4, 0.2],
  [0, 0.1], [E4, 0.2], [0, 0.1],
  [C4, 0.2], [D4, 0.2], [B4, 0.3],
  [0, 0.3],

  // 파트 4: 마무리
  [C5, 0.2], [0, 0.1], [G4, 0.2], [E4, 0.2],
  [A4, 0.2], [B4, 0.2], [0, 0.1],
  [A4, 0.2], [G4, 0.2],
  [E5, 0.2], [D5, 0.2], [C5, 0.4],
  [0, 0.6],
];

// 베이스 라인
const BASS: [number, number][] = [
  [C4 / 2, 0.4], [0, 0.4], [G4 / 2, 0.4], [0, 0.4],
  [C4 / 2, 0.8], [0, 0.4],

  [C4 / 2, 0.4], [0, 0.2], [G4 / 2, 0.4], [0, 0.2],
  [E4 / 2, 0.4],
  [A4 / 2, 0.3], [0, 0.1], [A4 / 2, 0.3], [0, 0.1],
  [G4 / 2, 0.45], [E4 / 2, 0.45], [G4 / 2, 0.45], [0, 0.15],

  [F4 / 2, 0.3], [0, 0.1], [F4 / 2, 0.3], [G4 / 2, 0.3],
  [0, 0.1], [E4 / 2, 0.3], [0, 0.1],
  [C4 / 2, 0.3], [D4 / 2, 0.3], [G4 / 2, 0.3],
  [0, 0.3],

  [C4 / 2, 0.3], [0, 0.1], [G4 / 2, 0.3], [E4 / 2, 0.3],
  [A4 / 2, 0.3], [B4 / 2, 0.3], [0, 0.1],
  [A4 / 2, 0.3], [G4 / 2, 0.3],
  [C4 / 2, 0.3], [D4 / 2, 0.3], [C4 / 2, 0.5],
  [0, 0.6],
];

export default function RetroMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const stopMusic = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      gainRef.current = null;
    }
  }, []);

  const playNote = useCallback((
    ctx: AudioContext, gain: GainNode,
    freq: number, startTime: number, duration: number,
    type: OscillatorType, vol: number,
  ) => {
    if (freq === 0) return;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(vol, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

    osc.connect(noteGain);
    noteGain.connect(gain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, []);

  const playMelody = useCallback(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainRef.current = gain;
    isPlayingRef.current = true;
    setIsPlaying(true);

    const scheduleLoop = () => {
      if (!isPlayingRef.current) return;

      const t0 = ctx.currentTime + 0.05;

      // 메인 멜로디 (square wave - 8비트 감성)
      let time = t0;
      for (const [freq, dur] of MELODY) {
        playNote(ctx, gain, freq, time, dur, 'square', 0.35);
        // 옥타브 위 하모닉
        if (freq > 0) playNote(ctx, gain, freq * 2, time, dur, 'triangle', 0.08);
        time += dur;
      }

      // 베이스 라인 (triangle wave - 뭉툭한 저음)
      let bassTime = t0;
      for (const [freq, dur] of BASS) {
        playNote(ctx, gain, freq, bassTime, dur, 'triangle', 0.25);
        bassTime += dur;
      }

      // 간단한 드럼 느낌 (노이즈 버스트)
      const melodyLen = MELODY.reduce((s, [, d]) => s + d, 0);
      const beatInterval = 0.4;
      for (let i = 0; i < melodyLen / beatInterval; i++) {
        const beatTime = t0 + i * beatInterval;
        // 킥 느낌
        const kickOsc = ctx.createOscillator();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, beatTime);
        kickOsc.frequency.exponentialRampToValueAtTime(30, beatTime + 0.1);
        const kickGain = ctx.createGain();
        kickGain.gain.setValueAtTime(i % 2 === 0 ? 0.3 : 0.1, beatTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.12);
        kickOsc.connect(kickGain);
        kickGain.connect(gain);
        kickOsc.start(beatTime);
        kickOsc.stop(beatTime + 0.15);

        // 하이햇 느낌 (짝수 비트)
        if (i % 2 === 1) {
          const hihatOsc = ctx.createOscillator();
          hihatOsc.type = 'square';
          hihatOsc.frequency.setValueAtTime(800 + Math.random() * 400, beatTime);
          const hihatGain = ctx.createGain();
          hihatGain.gain.setValueAtTime(0.03, beatTime);
          hihatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.05);
          hihatOsc.connect(hihatGain);
          hihatGain.connect(gain);
          hihatOsc.start(beatTime);
          hihatOsc.stop(beatTime + 0.06);
        }
      }

      schedulerRef.current = window.setTimeout(() => {
        if (isPlayingRef.current) scheduleLoop();
      }, melodyLen * 1000);
    };

    scheduleLoop();
  }, [volume, playNote]);

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (schedulerRef.current) clearTimeout(schedulerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // 재생 전: 큼지막한 MUSIC PLAY 버튼
  if (!isPlaying) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, #000080 0%, #0000aa 50%, #000080 100%)',
        border: '3px outset #4040c0',
        padding: '16px 10px',
        textAlign: 'center',
      }}>
        <button
          onClick={playMelody}
          style={{
            background: 'linear-gradient(180deg, #ff0000, #cc0000)',
            border: '3px outset #ff6666',
            padding: '12px 40px',
            fontFamily: "'Gulim', '굴림', sans-serif",
            fontSize: 22,
            fontWeight: 'bold',
            color: '#ffff00',
            cursor: 'pointer',
            textShadow: '2px 2px 0 #800000',
            letterSpacing: 3,
            animation: 'retro-blink 1.2s step-end infinite',
          }}
        >
          MUSIC PLAY
        </button>
        <div style={{
          color: '#00ffff',
          fontSize: 11,
          marginTop: 6,
          fontFamily: "'Gulim', '굴림', sans-serif",
        }}>
          * 클릭하면 8비트 배경음악이 재생됩니다 *
        </div>
      </div>
    );
  }

  // 재생 중: 컨트롤 바
  return (
    <div style={{
      background: 'linear-gradient(180deg, #000080 0%, #0000aa 50%, #000080 100%)',
      border: '3px outset #4040c0',
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'center',
      flexWrap: 'wrap',
      fontFamily: "'Gulim', '굴림', sans-serif",
      fontSize: 12,
      color: '#fff',
    }}>
      <span style={{
        color: '#00ff00',
        fontWeight: 'bold',
        animation: 'retro-blink 1s step-end infinite',
      }}>
        Now Playing~
      </span>

      <span style={{ color: '#ffff00', fontSize: 11 }}>
        BGM_homepage_1999.mid
      </span>

      <button
        onClick={stopMusic}
        style={{
          background: '#c0c0c0',
          border: '2px outset #dfdfdf',
          padding: '3px 12px',
          fontFamily: "'Gulim', '굴림', sans-serif",
          fontSize: 11,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        STOP
      </button>

      <span style={{ fontSize: 11, color: '#c0c0c0' }}>Vol:</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={e => setVolume(parseFloat(e.target.value))}
        style={{ width: 60, cursor: 'pointer' }}
      />
    </div>
  );
}
