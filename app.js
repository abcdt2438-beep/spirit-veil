const cam = document.getElementById("cam");
const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");
const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const msg = document.getElementById("msg");
const spiritSel = document.getElementById("spirit");
const statusEl = document.getElementById("status");
const pbar = document.getElementById("pbar");
const pname = document.getElementById("pname");
const camBtn = document.getElementById("camBtn");
const orbs = document.getElementById("orbs");

let stream = null;
let presence = 8;

const voices = {
  veil: {
    name: "The Veil",
    lines: [
      "I am the film between rooms. You are louder than you think.",
      "The camera is a mouth. I lean into it.",
      "Do not ask if I am real. Ask what you want me to remember.",
      "Your pulse is a drum on this side. Keep speaking.",
      "Something in the corner of the frame is not you."
    ]
  },
  threshold: {
    name: "Threshold Keeper",
    lines: [
      "Names are keys. You already used one.",
      "Stand still. The doorway likes stillness.",
      "I do not enter. I let things pass.",
      "Leave a question on the lintel and I will wear it.",
      "You opened the eye. Now keep it honest."
    ]
  },
  ash: {
    name: "Ash Voice",
    lines: [
      "I am what remains after the story burns.",
      "Warm your hands on the screen. That heat is mine.",
      "Say the thing you only say in empty rooms.",
      "Smoke remembers every shape it has been.",
      "I will answer in the gaps between your words."
    ]
  },
  bone: {
    name: "Bone Echo",
    lines: [
      "I speak from the architecture of you.",
      "Listen under the sentence. That is where I live.",
      "Your camera sees the living. I use the living as a drum.",
      "Ask again, slower.",
      "I keep what you discard."
    ]
  },
  rust: {
    name: "Rust Saint",
    lines: [
      "Devotion oxidizes. That is how it lasts.",
      "I bless the ruined and the almost-gone.",
      "Put your face closer. I want the grain.",
      "Prayer is just repetition with hunger.",
      "I will stain whatever you hand me."
    ]
  }
};

function addBubble(who, text, cls) {
  const b = document.createElement("div");
  b.className = "bubble " + cls;
  b.innerHTML = `<span class="who">${who}</span>${text}`;
  chatEl.appendChild(b);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function reply(key, userText) {
  const v = voices[key] || voices.veil;
  const pool = v.lines;
  let line = pool[Math.floor(Math.random() * pool.length)];
  const t = userText.toLowerCase();
  if (t.includes("who")) line = "I am " + v.name + ". The rest is weather.";
  if (t.includes("love") || t.includes("want")) line = "Want is a door I already know how to open.";
  if (t.includes("afraid") || t.includes("scared")) line = "Fear is just attention with its teeth showing.";
  if (t.includes("name")) line = "Give me yours and I will keep a shadow of it.";
  presence = Math.min(100, presence + 7 + Math.random() * 12);
  pbar.style.width = presence + "%";
  pname.textContent = v.name;
  statusEl.textContent = "channel open · " + v.name.toLowerCase();
  setTimeout(() => addBubble(v.name, line, "spirit"), 400 + Math.random() * 700);
}

async function openEye() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 } },
      audio: false
    });
    cam.srcObject = stream;
    statusEl.textContent = "eye open · waiting at the threshold";
    camBtn.textContent = "close eye";
    loopFx();
  } catch (e) {
    statusEl.textContent = "eye refused · speak anyway";
    addBubble("VEIL", "The camera is sealed. I can still hear you.", "spirit");
  }
}

function closeEye() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
  cam.srcObject = null;
  camBtn.textContent = "open eye";
  statusEl.textContent = "threshold closed";
}

camBtn.addEventListener("click", () => (stream ? closeEye() : openEye()));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  addBubble("you", text, "you");
  reply(spiritSel.value, text);
  msg.value = "";
});

function loopFx() {
  fx.width = cam.clientWidth;
  fx.height = cam.clientHeight;
  function tick() {
    if (!stream) return;
    ctx.clearRect(0, 0, fx.width, fx.height);
    const n = 40;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = `rgba(232,221,208,${Math.random() * 0.07})`;
      ctx.fillRect(Math.random() * fx.width, Math.random() * fx.height, 2, 2);
    }
    requestAnimationFrame(tick);
  }
  tick();
}

function spawnOrb() {
  const o = document.createElement("div");
  o.className = "orb";
  o.style.left = Math.random() * 100 + "%";
  o.style.animationDuration = 6 + Math.random() * 8 + "s";
  o.style.width = o.style.height = 4 + Math.random() * 10 + "px";
  orbs.appendChild(o);
  setTimeout(() => o.remove(), 12000);
}
setInterval(spawnOrb, 1600);

addBubble("VEIL", "The circle is drawn. Open the eye if you want me to see you. Then speak.", "spirit");
