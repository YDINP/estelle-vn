// 오디오 — BGM(CC0, public/bgm/CREDITS.md 참조) + WebAudio 합성 SFX(라이선스 무결).
// 브라우저 자동재생 정책: 첫 포인터 제스처에서 잠금 해제 후 재생.

const MUTE_KEY = "estelle.mute";
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { /* private mode */ }

let unlocked = false;
let bgmEl: HTMLAudioElement | null = null;
let currentTrack = "";
let ac: AudioContext | null = null;

const BGM: Record<string, string> = {
  title: `${import.meta.env.BASE_URL}bgm/title.mp3`, // A New Town — 하프, 타이틀/메인
  story: `${import.meta.env.BASE_URL}bgm/story.mp3`, // Contemplation — 앰비언트, 루트/VN
};

export function isMuted(): boolean { return muted; }
export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch { /* ignore */ }
  if (bgmEl) {
    bgmEl.muted = m;
    if (!m && unlocked && bgmEl.paused) bgmEl.play().catch(() => {});
  }
}
export function toggleMuted(): boolean { setMuted(!muted); return muted; }

function ctx(): AudioContext | null {
  try {
    return (ac ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)());
  } catch { return null; }
}

/** 첫 사용자 제스처에서 오디오 잠금 해제 (mountGame에서 1회 호출) */
export function initAudio(): void {
  const unlock = () => {
    unlocked = true;
    ctx()?.resume();
    if (bgmEl && bgmEl.paused && !muted) bgmEl.play().catch(() => {});
    window.removeEventListener("pointerdown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
}

export function playBgm(name: keyof typeof BGM): void {
  if (currentTrack === name) return;
  currentTrack = name;
  if (!bgmEl) {
    bgmEl = new Audio();
    bgmEl.loop = true;
    bgmEl.volume = 0.3;
  }
  bgmEl.src = BGM[name];
  bgmEl.muted = muted;
  if (unlocked && !muted) bgmEl.play().catch(() => {});
}

// ── SFX 합성 (짧은 신스 톤 — 파일/라이선스 불요) ──
function tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine",
  when = 0, glideTo = 0) {
  const c = ctx();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/** 대사 넘기기 — 아주 짧은 소프트 블립 */
export function sfxTap(): void { tone(920, 0.05, 0.045, "triangle"); }
/** 선택지 등장 — 2음 차임 */
export function sfxChoiceOpen(): void { tone(659, 0.14, 0.06); tone(988, 0.18, 0.05, "sine", 0.09); }
/** 선택 확정 */
export function sfxSelect(): void { tone(523, 0.09, 0.07, "triangle"); tone(784, 0.16, 0.06, "triangle", 0.07); }
/** 코인/선물 */
export function sfxCoin(): void { tone(1319, 0.08, 0.06, "square"); tone(1760, 0.14, 0.045, "square", 0.06); }
/** 에피소드 완료 보상 — 상승 아르페지오 */
export function sfxReward(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 0.06, "triangle", i * 0.09));
}
/** CG 연출 — 반짝이는 글리산도 */
export function sfxCg(): void { tone(620, 0.5, 0.05, "sine", 0, 1240); tone(930, 0.5, 0.035, "sine", 0.06, 1860); }

/** 캐릭터 보이스 재생 (대사 도감 읊기 등).
 *  에셋 규약: public/voice/{charId}/{lineId의 ':'→'-'}.mp3 — 파일만 추가하면 재생됨.
 *  에셋 미도입(로드 실패) 동안은 짧은 대체음으로 재생 피드백만 준다. */
let voiceEl: HTMLAudioElement | null = null;
export function playVoice(charId: string, lineId: string): void {
  if (muted) return;
  voiceEl?.pause();
  const src = `${import.meta.env.BASE_URL}voice/${charId}/${lineId.replace(/:/g, "-")}.mp3`;
  voiceEl = new Audio(src);
  voiceEl.volume = 0.9;
  voiceEl.onerror = () => { tone(740, 0.12, 0.05, "sine"); tone(988, 0.18, 0.04, "sine", 0.08); };
  voiceEl.play().catch(() => { /* 미도입/자동재생 차단 — 무시 */ });
}
