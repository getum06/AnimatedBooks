'use strict';

/* ============================================================
   Scene data — update image paths to your final artwork.
   Each scene also carries an `emoji` and `gradient` pair used
   as an animated placeholder while the image is loading or if
   the PNG file hasn't been added yet.
   ============================================================ */
const scenes = [
  {
    title: "A Sunny Day",
    image: "images/scene-1.png",
    emoji: "🌞",
    gradient: ["#87CEEB", "#90EE90"],
    text: "One sunny day, Pikachu was running through a grassy field as fast as he could.",
    dialogue: "Pika-pika! I'm getting faster!",
  },
  {
    title: "Charizard Arrives",
    image: "images/scene-2.png",
    emoji: "🔥",
    gradient: ["#FF8C00", "#FF4500"],
    text: "Suddenly, a huge shadow flew over Pikachu. Charizard landed with a loud THUMP!",
    dialogue: "I'm definitely the fastest Pokémon around!",
  },
  {
    title: "The Argument",
    image: "images/scene-3.png",
    emoji: "⚡",
    gradient: ["#C3A0F0", "#8A2BE2"],
    text: "Pikachu crossed his arms. He did not agree at all.",
    dialogue: "No way! I'm super speedy too!",
  },
  {
    title: "The Race Begins",
    image: "images/scene-4.png",
    emoji: "🏁",
    gradient: ["#A8E063", "#56AB2F"],
    text: "The other Pokémon gathered around. Squirtle waved a leaf flag.",
    dialogue: "Ready… set… GO!",
  },
  {
    title: "The Big Race",
    image: "images/scene-5.png",
    emoji: "💨",
    gradient: ["#56CCF2", "#2F80ED"],
    text: "Charizard flew over the trees while Pikachu dashed across the path with sparks flying from his cheeks.",
    dialogue: "I can do this!",
  },
  {
    title: "Almost There",
    image: "images/scene-6.png",
    emoji: "💪",
    gradient: ["#F7971E", "#D44000"],
    text: "The wind pushed against Charizard's wings, and Pikachu's legs were tired. But neither one gave up.",
    dialogue: "Keep trying!",
  },
  {
    title: "The Real Lesson",
    image: "images/scene-7.png",
    emoji: "🏆",
    gradient: ["#FFD700", "#FFA500"],
    text: "They crossed the finish line at almost the same time. Then they realized something important.",
    dialogue: "It's not about who is fastest. It's about who gives their best effort.",
  },
];

/* ── State ── */
const TOTAL = scenes.length;
let currentScene = 0;
let isAnimating  = false;

/* ── DOM references ── */
const $ = id => document.getElementById(id);

const sceneInner     = $('scene-inner');
const sceneTitleEl   = $('scene-title');
const sceneImageEl   = $('scene-image');
const imageFrameEl   = $('image-frame');
const imgPlaceholder = $('img-placeholder');
const phEmojiEl      = $('ph-emoji');
const phTextEl       = $('ph-text');
const sceneTextEl    = $('scene-text');
const sceneDlgEl     = $('scene-dialogue');
const sceneCounterEl = $('scene-counter');
const btnBack        = $('btn-back');
const btnNext        = $('btn-next');
const progressDotsEl = $('progress-dots');

/* ── Build progress dot nodes ── */
function buildProgressDots() {
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    progressDotsEl.appendChild(dot);
  }
}

function refreshProgressDots() {
  const dots = progressDotsEl.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active',  i <= currentScene);
    dot.classList.toggle('current', i === currentScene);
  });
}

/* ── Render the current scene's content into the DOM ── */
function updateContent() {
  const scene = scenes[currentScene];

  /* Texts */
  sceneTitleEl.textContent = scene.title;
  sceneTextEl.textContent  = scene.text;
  sceneDlgEl.textContent   = scene.dialogue;
  sceneCounterEl.textContent = `Scene ${currentScene + 1} of ${TOTAL}`;

  /* Placeholder colours and emoji */
  phEmojiEl.textContent = scene.emoji;
  phTextEl.textContent  = scene.title;
  imageFrameEl.style.background =
    `linear-gradient(135deg, ${scene.gradient[0]}, ${scene.gradient[1]})`;

  /* Load image — show placeholder until ready, keep it if image fails */
  sceneImageEl.classList.add('hidden');
  imgPlaceholder.classList.remove('hidden');

  if (scene.image) {
    const img = new Image();
    img.onload = () => {
      sceneImageEl.src = scene.image;
      sceneImageEl.alt = scene.title;
      sceneImageEl.classList.remove('hidden');
      imgPlaceholder.classList.add('hidden');
    };
    img.onerror = () => {
      /* PNG not present yet — the animated placeholder stays visible */
      sceneImageEl.src = '';
      sceneImageEl.classList.add('hidden');
      imgPlaceholder.classList.remove('hidden');
    };
    img.src = scene.image;
  }

  /* Back button */
  btnBack.disabled = currentScene === 0;

  /* Next / Start Over button */
  if (currentScene === TOTAL - 1) {
    btnNext.textContent = '🔄 Start Over';
    btnNext.classList.add('btn-restart');
    btnNext.setAttribute('aria-label', 'Start the story from the beginning');
  } else {
    btnNext.textContent = 'Next ▶';
    btnNext.classList.remove('btn-restart');
    btnNext.setAttribute('aria-label', 'Go to next scene');
  }

  refreshProgressDots();
}

/* ── Animated scene transition ── */
function transitionTo(newIndex, direction) {
  if (isAnimating) return;
  isAnimating = true;

  const outClass = direction === 'next' ? 'slide-out-left'  : 'slide-out-right';
  const inClass  = direction === 'next' ? 'slide-in-right'  : 'slide-in-left';

  /* Step 1 – slide current content out (320ms) */
  sceneInner.classList.add(outClass);

  setTimeout(() => {
    /* Step 2 – swap content while off-screen */
    currentScene = newIndex;
    updateContent();
    sceneInner.classList.remove(outClass);

    /* Double rAF ensures the browser fully processes the class removal
       before the enter animation starts, so both fire correctly. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sceneInner.classList.add(inClass);

        /* Step 3 – clean up enter class after animation completes (380ms) */
        setTimeout(() => {
          sceneInner.classList.remove(inClass);
          isAnimating = false;
        }, 400);
      });
    });
  }, 330);
}

/* ── Navigation helpers ── */
function goNext() {
  if (isAnimating) return;
  if (currentScene === TOTAL - 1) {
    /* "Start Over" wraps back to scene 1, sliding in from the left */
    transitionTo(0, 'prev');
  } else {
    transitionTo(currentScene + 1, 'next');
  }
}

function goBack() {
  if (isAnimating || currentScene === 0) return;
  transitionTo(currentScene - 1, 'prev');
}

/* ── Event listeners ── */
btnNext.addEventListener('click', goNext);
btnBack.addEventListener('click', goBack);

/* Keyboard support: right arrow = next, left arrow = back */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); goBack(); }
});

/* ── Boot ── */
buildProgressDots();
updateContent();
