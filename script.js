/* ========================================================
   SCRIPT.JS - TRANG WEB TỎ TÌNH (PHIÊN BẢN TỐI ƯU MƯỢT 60FPS)
   ======================================================== */

// --- 1. ÂM THANH SYNTH CUTE (WEB AUDIO API) ---
let globalAudioCtx = null;
function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      globalAudioCtx = new AudioContext();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

class SoundEffects {
  playPop() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) { }
  }

  playCuteChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const baseTime = ctx.currentTime;
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = baseTime + index * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (e) { }
  }

  playDodge() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) { }
  }

  playVictory() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const baseTime = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = baseTime + idx * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch (e) { }
  }
}

const sfx = new SoundEffects();

// --- 2. HẠT RƠI CANVAS TỐI ƯU HIỆU NĂNG (OFFSCREEN SPRITES & THROTTLING) ---
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [];
let confettiList = [];
let mouseTrails = [];
let isTabActive = true;

// Pre-render sprite hình trái tim để tránh tính toán bezier curve mỗi frame
const heartCanvas = document.createElement('canvas');
heartCanvas.width = 32;
heartCanvas.height = 32;
const hctx = heartCanvas.getContext('2d');
hctx.fillStyle = '#ff758c';
hctx.beginPath();
hctx.moveTo(16, 8);
hctx.bezierCurveTo(16, 0, 0, 0, 0, 8);
hctx.bezierCurveTo(0, 16, 16, 24, 16, 28);
hctx.bezierCurveTo(16, 24, 32, 16, 32, 8);
hctx.bezierCurveTo(32, 0, 16, 0, 16, 8);
hctx.fill();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('visibilitychange', () => {
  isTabActive = !document.hidden;
});

class FloatingItem {
  constructor() {
    this.reset(true);
  }
  reset(initRandomY = false) {
    this.x = Math.random() * canvas.width;
    this.y = initRandomY ? Math.random() * canvas.height : -30;
    this.size = Math.random() * 10 + 12;
    this.speedY = Math.random() * 1.0 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.alpha = Math.random() * 0.4 + 0.4;
    this.type = Math.random() > 0.4 ? 'heart' : 'circle';
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y > canvas.height + 30) this.reset();
  }
  draw() {
    ctx.globalAlpha = this.alpha;
    if (this.type === 'heart') {
      ctx.drawImage(heartCanvas, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = '#ffd1dc';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Giới hạn 16 hạt để vừa đẹp vừa siêu mượt
const PARTICLE_COUNT = 16;
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new FloatingItem());
}

// Vệt sáng chuột (Throttled nhẹ nhàng)
class SparkleTrail {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 3;
    this.alpha = 0.8;
  }
  update() {
    this.alpha -= 0.04;
    this.size *= 0.94;
    this.y -= 0.6;
  }
  draw() {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = '#ff758c';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let lastPointerTime = 0;
function handlePointerMove(e) {
  const now = performance.now();
  if (now - lastPointerTime < 35) return; // Throttle ~30fps
  lastPointerTime = now;

  const x = e.clientX || (e.touches && e.touches[0].clientX);
  const y = e.clientY || (e.touches && e.touches[0].clientY);
  if (x && y && mouseTrails.length < 20) {
    mouseTrails.push(new SparkleTrail(x, y));
  }
}
window.addEventListener('mousemove', handlePointerMove, { passive: true });
window.addEventListener('touchmove', handlePointerMove, { passive: true });

// Confetti khi đồng ý (Tối ưu số lượng hạt)
class HeartConfetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 12 + 10;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 9 + 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 3;
    this.gravity = 0.25;
    this.alpha = 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= 0.018;
  }
  draw() {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.drawImage(heartCanvas, this.x, this.y, this.size, this.size);
  }
}

function triggerHeartFireworks() {
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.45;
  for (let i = 0; i < 45; i++) {
    confettiList.push(new HeartConfetti(cx, cy));
  }
}

// Vòng lặp Render Canvas mượt mà
function animateCanvas() {
  if (isTabActive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hạt nền
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Vệt chuột
    for (let i = mouseTrails.length - 1; i >= 0; i--) {
      mouseTrails[i].update();
      mouseTrails[i].draw();
      if (mouseTrails[i].alpha <= 0) mouseTrails.splice(i, 1);
    }

    // Confetti
    for (let i = confettiList.length - 1; i >= 0; i--) {
      confettiList[i].update();
      confettiList[i].draw();
      if (confettiList[i].alpha <= 0) confettiList.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- 3. BỘ PHÁT NHẠC TÌNH CẢM LÃNG MẠN (ROMANTIC AUDIO ENGINE) ---
const musicPlayer = document.getElementById('music-player');
const discIcon = document.getElementById('disc-icon');
const songTitle = document.getElementById('song-title');
const musicStatus = document.getElementById('music-status');
const btnNextSong = document.getElementById('btn-next-song');
const bgAudio = document.getElementById('bg-audio');

// Danh sách bài hát (Bao gồm file offline cục bộ và Web Audio Synth)
const playlist = [
  {
    title: "Canon in Love (Romantic Piano) 💖",
    src: "music.wav",
    type: "audio"
  },
  {
    title: "Sweet Love Ballad ✨",
    src: "music.mp3",
    type: "audio"
  },
  {
    title: "Romantic Music Box (Live Synth) 🌸",
    src: null,
    type: "synth"
  }
];

let currentTrackIdx = 0;
let isMusicActive = false;

// Web Audio live synthesizer (Dự phòng thông minh)
class LiveMusicBox {
  constructor() {
    this.isPlaying = false;
    this.timer = null;
    this.noteIndex = 0;
    this.melody = [
      { note: 'E', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 1 }, { note: 'C', oct: 5, dur: 2 },
      { note: 'G', oct: 4, dur: 1 }, { note: 'A', oct: 4, dur: 1 }, { note: 'C', oct: 5, dur: 2 },
      { note: 'D', oct: 5, dur: 1 }, { note: 'E', oct: 5, dur: 1 }, { note: 'F', oct: 5, dur: 1 }, { note: 'E', oct: 5, dur: 1 },
      { note: 'D', oct: 5, dur: 2 }, { note: 'G', oct: 4, dur: 2 },
      { note: 'E', oct: 5, dur: 1 }, { note: 'G', oct: 5, dur: 1 }, { note: 'C', oct: 6, dur: 2 },
      { note: 'B', oct: 5, dur: 1 }, { note: 'A', oct: 5, dur: 1 }, { note: 'G', oct: 5, dur: 2 },
      { note: 'F', oct: 5, dur: 1 }, { note: 'E', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 1 }, { note: 'F', oct: 5, dur: 1 },
      { note: 'E', oct: 5, dur: 2 }, { note: 'C', oct: 5, dur: 2 },
      { note: 'A', oct: 4, dur: 1 }, { note: 'C', oct: 5, dur: 1 }, { note: 'E', oct: 5, dur: 2 },
      { note: 'D', oct: 5, dur: 1 }, { note: 'C', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 2 },
      { note: 'C', oct: 5, dur: 3 }, { note: 'G', oct: 4, dur: 1 }
    ];
    this.bassChords = [
      ['C3', 'G3', 'E4'], ['G2', 'D3', 'B3'], ['A2', 'E3', 'C4'], ['E2', 'B2', 'G3'],
      ['F2', 'C3', 'A3'], ['C3', 'G3', 'E4'], ['F2', 'C3', 'A3'], ['G2', 'D3', 'B3']
    ];
    this.bassIndex = 0;
  }

  getFreq(noteStr) {
    const noteMap = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    let name = noteStr.slice(0, -1);
    let oct = parseInt(noteStr.slice(-1));
    const semitones = noteMap[name] + (oct - 4) * 12 - 9;
    return 440 * Math.pow(2, semitones / 12);
  }

  playNote(freq, dur = 1.2, vol = 0.2) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2.002, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  step() {
    if (!this.isPlaying) return;
    const current = this.melody[this.noteIndex];
    const freq = this.getFreq(current.note + current.oct);
    this.playNote(freq, current.dur * 0.9, 0.22);

    if (this.noteIndex % 2 === 0) {
      const chord = this.bassChords[this.bassIndex % this.bassChords.length];
      chord.forEach(n => {
        this.playNote(this.getFreq(n), 2.2, 0.08);
      });
      this.bassIndex++;
    }

    const nextDelay = current.dur * 480;
    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    this.timer = setTimeout(() => this.step(), nextDelay);
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    getAudioContext();
    this.step();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
  }
}

const liveSynth = new LiveMusicBox();

function playTrack(index) {
  currentTrackIdx = (index + playlist.length) % playlist.length;
  const track = playlist[currentTrackIdx];

  // Dừng mọi âm thanh trước đó
  liveSynth.stop();
  if (bgAudio) {
    bgAudio.pause();
  }

  songTitle.textContent = track.title;
  discIcon.classList.add('playing');
  musicStatus.textContent = 'Đang phát du dương... 🎶';
  isMusicActive = true;

  if (track.type === 'audio' && bgAudio) {
    bgAudio.src = track.src;
    bgAudio.volume = 0.65;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Audio file play fallback to synth:', err);
        // Nếu file audio không load được, tự động chuyển sang synth sống động
        liveSynth.start();
      });
    }
  } else {
    liveSynth.start();
  }
}

function enableMusic() {
  getAudioContext();
  playTrack(currentTrackIdx);
}

function disableMusic() {
  liveSynth.stop();
  if (bgAudio) {
    bgAudio.pause();
  }
  discIcon.classList.remove('playing');
  musicStatus.textContent = 'Đã tạm dừng';
  isMusicActive = false;
}

function toggleMusic(e) {
  if (e && e.target === btnNextSong) return;
  if (isMusicActive) {
    disableMusic();
  } else {
    enableMusic();
  }
}
musicPlayer.addEventListener('click', toggleMusic);

if (btnNextSong) {
  btnNextSong.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.playCuteChime();
    playTrack(currentTrackIdx + 1);
  });
}

function startMusicAuto() {
  if (!isMusicActive) {
    enableMusic();
  }
}

// --- 4. CHUYỂN ĐỔI MÀN HÌNH ---
const screens = {
  envelope: document.getElementById('screen-envelope'),
  letter: document.getElementById('screen-letter'),
  question: document.getElementById('screen-question'),
  success: document.getElementById('screen-success')
};

function switchScreen(fromId, toId) {
  sfx.playPop();
  screens[fromId].classList.remove('active');
  setTimeout(() => {
    screens[toId].classList.add('active');
  }, 250);
}

// --- 5. MÀN HÌNH 1: MỞ BÌ THƯ ---
const envelope = document.getElementById('envelope');
const heartSeal = document.getElementById('heart-seal');
let isEnvelopeOpened = false;

function openEnvelope() {
  if (isEnvelopeOpened) return;
  isEnvelopeOpened = true;
  sfx.playCuteChime();
  startMusicAuto();

  envelope.classList.add('open');

  setTimeout(() => {
    switchScreen('envelope', 'letter');
    startTypewriter();
  }, 900);
}

envelope.addEventListener('click', openEnvelope);
heartSeal.addEventListener('click', (e) => {
  e.stopPropagation();
  openEnvelope();
});

// --- 6. MÀN HÌNH 2: TÂM THƯ GÕ CHỮ ---
const letterContent = `Chào em! ✨

Thật ra anh đã ấp ủ những lời này từ rất lâu rồi...
Mỗi ngày được nhìn thấy nụ cười của em, nghe giọng nói hay chỉ đơn giản là một tin nhắn vu vơ cũng đủ làm một ngày của anh trở nên rực rỡ hơn bao giờ hết. 🌸

Anh nhận ra rằng trong tim anh, em chính là người đặc biệt nhất mà anh luôn muốn che chở và đồng hành mỗi ngày! 💕`;

const typewriterEl = document.getElementById('typewriter-text');
const letterFooter = document.getElementById('letter-footer');
const btnToQuestion = document.getElementById('btn-to-question');

let typeIndex = 0;
function startTypewriter() {
  typewriterEl.textContent = '';
  typeIndex = 0;
  function typeChar() {
    if (typeIndex < letterContent.length) {
      typewriterEl.textContent += letterContent.charAt(typeIndex);
      typeIndex++;
      const delay = letterContent.charAt(typeIndex - 1) === '\n' ? 220 : 25;
      setTimeout(typeChar, delay);
    } else {
      letterFooter.classList.add('visible');
      sfx.playCuteChime();
    }
  }
  setTimeout(typeChar, 400);
}

btnToQuestion.addEventListener('click', () => {
  switchScreen('letter', 'question');
});

// --- 7. MÀN HÌNH 3: MINI GAME NÚT TRỐN "EM CÓ THÍCH ANH HÔNG?" ---
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const noText = document.getElementById('no-text');
const noHint = document.getElementById('no-hint');

const teasePhrases = [
  "Hông bé ơi 😜",
  "Bắt được anh đi! 🏃‍♂️",
  "Nút xanh cơ mà! 🥰",
  "Hông được từ chối đâu nha! 🥺",
  "Chịu thua chưa nè? 😝",
  "Đồng ý đi mừ! 💖"
];

let noAttemptCount = 0;
let yesScale = 1;

function dodgeButton() {
  sfx.playDodge();
  noAttemptCount++;

  const phrase = teasePhrases[noAttemptCount % teasePhrases.length];
  noText.textContent = phrase;

  if (noAttemptCount === 1) {
    noHint.textContent = "Ơ kìa, nút này có chân biết chạy đó! 🤭";
  } else if (noAttemptCount === 3) {
    noHint.textContent = "Định mệnh bảo em phải chọn nút Xanh rùi! ✨";
  } else if (noAttemptCount >= 5) {
    noHint.textContent = "Chịu thua đi nào, đồng ý với anh nhaaa! 🥰";
  }

  // Tăng nút Đồng Ý nhẹ nhàng
  yesScale += 0.08;
  btnYes.style.transform = `scale(${yesScale})`;

  const card = document.querySelector('.question-card');
  const cardWidth = card ? card.clientWidth : 350;
  const maxOffset = Math.min(100, (cardWidth - 160) / 2);

  const randomX = (Math.random() - 0.5) * 2 * maxOffset;
  const randomY = (Math.random() - 0.5) * 60;

  btnNo.style.position = 'relative';
  btnNo.style.left = `${randomX}px`;
  btnNo.style.top = `${randomY}px`;
}

btnNo.addEventListener('mouseenter', dodgeButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodgeButton();
}, { passive: false });
btnNo.addEventListener('click', dodgeButton);

btnYes.addEventListener('click', () => {
  sfx.playVictory();
  triggerHeartFireworks();
  switchScreen('question', 'success');
});

// --- 8. MÀN HÌNH 4: VOUCHER TÌNH YÊU 3D FLIP ---
const voucherCards = document.querySelectorAll('.voucher-card');
voucherCards.forEach(card => {
  card.addEventListener('click', () => {
    sfx.playPop();
    card.classList.toggle('flipped');
  });
});

// Nút Xem lại từ đầu
const btnReplay = document.getElementById('btn-replay');
btnReplay.addEventListener('click', () => {
  sfx.playPop();
  envelope.classList.remove('open');
  isEnvelopeOpened = false;
  letterFooter.classList.remove('visible');
  btnYes.style.transform = 'scale(1)';
  yesScale = 1;
  btnNo.style.left = '0px';
  btnNo.style.top = '0px';
  noText.textContent = "Hông bé ơi 😜";
  noHint.textContent = "";
  noAttemptCount = 0;

  voucherCards.forEach(c => c.classList.remove('flipped'));

  screens.success.classList.remove('active');
  setTimeout(() => {
    screens.envelope.classList.add('active');
  }, 250);
});
