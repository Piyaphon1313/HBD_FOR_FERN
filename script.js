const cakeBtn = document.getElementById('cake-btn');
const tapHint = document.getElementById('tap-hint');
const fxContainer = document.getElementById('fx-container');
const hbdSong = document.getElementById('hbd-song');
const allPolaroids = document.querySelectorAll('.photo-frame, .bg-photo-frame');

const pastelColors = [
  '#FFB3BA', // ชมพูพาสเทล
  '#FFDFBA', // ส้มพีชพาสเทล
  '#FFFFBA', // เหลืองพาสเทล
  '#BAFFC9', // เขียวมิ้นต์พาสเทล
  '#BAE1FF', // ฟ้าพาสเทล
  '#E0BBE4', // ม่วงลาเวนเดอร์
  '#FFC8DD'  // ชมพูอ่อนหวาน
];

let isCelebrating = false;
let dotInterval = null;
let balloonInterval = null;
let celebrationTimeout = null;

// =========================================
// 1. กดที่รูปโพลารอยด์โดยตรง -> Jiggle 1 วิ แล้วกลับจุดเดิมอย่าง Smooth
// =========================================
allPolaroids.forEach((frame) => {
  let singleTimer = null;

  frame.addEventListener('click', () => {
    if (isCelebrating) return;

    clearTimeout(singleTimer);
    frame.classList.remove('is-single-jiggle');
    void frame.offsetWidth;
    frame.classList.add('is-single-jiggle');

    singleTimer = setTimeout(() => {
      frame.classList.remove('is-single-jiggle');
    }, 1000);
  });
});

// =========================================
// 2. ฟังก์ชันหยุดเพลงและหยุดสร้างของตกแต่งใหม่
// =========================================
function stopCelebration() {
  clearInterval(dotInterval);
  clearInterval(balloonInterval);
  clearTimeout(celebrationTimeout);

  if (hbdSong) {
    hbdSong.pause();
    hbdSong.currentTime = 0;
  }

  cakeBtn.classList.remove('is-playing');
  tapHint.textContent = 'try hit that cake';
  allPolaroids.forEach((frame) => frame.classList.remove('is-jiggling'));

  isCelebrating = false;
}

// =========================================
// 3. กดที่เค้ก -> สลับระหว่าง เริ่มเล่น (10 วิ) กับ กดหยุด
// =========================================
cakeBtn.addEventListener('click', () => {
  if (isCelebrating) {
    stopCelebration();
    return;
  }

  isCelebrating = true;
  cakeBtn.classList.add('is-playing');
  tapHint.textContent = 'Happy Birthday to you! 🎉 (tap cake to stop)';

  allPolaroids.forEach((frame) => {
    frame.classList.remove('is-single-jiggle');
    frame.classList.add('is-jiggling');
  });

  if (hbdSong) {
    hbdSong.currentTime = 0;
    hbdSong.play().catch((err) => {
      console.log('ยังไม่ได้ใส่ไฟล์เพลง หรือเบราว์เซอร์บล็อกเสียง:', err);
    });
  }

  dotInterval = setInterval(() => {
    createPastelDot();
  }, 240);

  balloonInterval = setInterval(() => {
    createBalloon();
  }, 700);

  for (let i = 0; i < 6; i++) createPastelDot();
  for (let i = 0; i < 3; i++) createBalloon();

  celebrationTimeout = setTimeout(() => {
    stopCelebration();
  }, 132000);
});

// =========================================
// 4. สร้างเม็ดกลมสีพาสเทลตกจากบนลงล่าง
// =========================================
function createPastelDot() {
  const dot = document.createElement('div');
  dot.classList.add('pastel-dot');

  const size = Math.random() * 14 + 10;
  const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  const leftPos = Math.random() * 100;
  const duration = Math.random() * 3 + 4.5;

  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  dot.style.backgroundColor = color;
  dot.style.left = `${leftPos}vw`;
  dot.style.animationDuration = `${duration}s`;

  fxContainer.appendChild(dot);

  setTimeout(() => {
    if (dot.parentNode) dot.remove();
  }, duration * 1000);
}

// =========================================
// 5. สร้างลูกโป่ง + กดจิ้มแล้วแตกได้ (Balloon Pop)
// =========================================
function createBalloon() {
  const balloon = document.createElement('div');
  balloon.classList.add('balloon');

  const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  const leftPos = Math.random() * 85 + 5;
  const duration = Math.random() * 3 + 6.5;
  const scale = Math.random() * 0.3 + 0.85;

  balloon.style.backgroundColor = color;
  balloon.style.borderBottomColor = color;
  balloon.style.left = `${leftPos}vw`;
  balloon.style.animationDuration = `${duration}s`;
  balloon.style.transform = `scale(${scale})`;

  // ใช้ pointerdown เพื่อตอบสนองทันทีที่นิ้วแตะหรือคลิก (ไวกว่า click บน iPhone/iPad)
  balloon.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (balloon.classList.contains('is-popping')) return;

    // หาตำแหน่งกึ่งกลางลูกโป่งตอนที่โดนจิ้ม
    const rect = balloon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // เล่นเสียง Pop เบาๆ
    playPopSound();

    // สร้างเอฟเฟกต์เศษลูกโป่งกระจายรอบจุดที่จิ้ม
    spawnPopParticles(centerX, centerY, color);

    // สั่งให้ลูกโป่งขยายแวบหนึ่งแล้วหายไป
    balloon.classList.add('is-popping');
    setTimeout(() => {
      if (balloon.parentNode) balloon.remove();
    }, 220);
  });

  fxContainer.appendChild(balloon);

  setTimeout(() => {
    if (balloon.parentNode) balloon.remove();
  }, duration * 1000);
}

// สร้างเศษสีกระจาย 8 ทิศทางรอบจุดที่ลูกโป่งแตก
function spawnPopParticles(x, y, color) {
  const particleCount = 8;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('pop-particle');
    particle.style.backgroundColor = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    // คำนวณมุมกระจายรอบวงกลม 360 องศา + สุ่มระยะพุ่ง
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.4 - 0.2);
    const distance = Math.random() * 35 + 30; // กระจายออก 30px - 65px
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 450);
  }
}

// สร้างเสียง "ป๊อป!" สั้นๆ ด้วย Web Audio API (ไม่ต้องใช้ไฟล์เสียงเพิ่ม)
function playPopSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // ไล่ความถี่เสียงขึ้นเร็วๆ ให้คล้ายเสียงฟอง/ลูกโป่งแตก
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // ข้ามไปถ้าเบราว์เซอร์ไม่รองรับ
  }
}