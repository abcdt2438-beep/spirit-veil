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
const apparition = document.getElementById("apparition");
const sigil = document.getElementById("sigil");

let stream = null;
let presence = 6;
let audioCtx = null;
let drone = null;

const voices = {
  veil: { name: "The Veil", lines: [
    "I am the film between rooms. You are louder than you think.",
    "The camera is a mouth. I lean into it until the glass warms.",
    "Do not ask if I am real. Ask what you want me to remember.",
    "Your pulse is a drum on this side. Keep speaking.",
    "Something in the corner of the frame is not you. It likes being watched.",
    "I will wear your face for a second if you hold still."
  ]},
  threshold: { name: "Threshold Keeper", lines: [
    "Names are keys. You already used one.",
    "Stand still. The doorway likes stillness more than prayer.",
    "I do not enter. I let things pass, and some of them look like you.",
    "Leave a question on the lintel and I will wear it home.",
    "You opened the eye. Now keep it honest.",
    "Cross only if you can stand being seen from both sides."
  ]},
  ash: { name: "Ash Voice", lines: [
    "I am what remains after the story burns.",
    "Warm your hands on the screen. That heat is mine.",
    "Say the thing you only say in empty rooms.",
    "Smoke remembers every shape it has been, including yours.",
    "I will answer in the gaps between your words.",
    "Come closer. I want the grain of your mouth."
  ]},
  bone: { name: "Bone Echo", lines: [
    "I speak from the architecture of you.",
    "Listen under the sentence. That is where I live.",
    "Your camera sees the living. I use the living as a drum.",
    "Ask again, slower. I keep time in marrow.",
    "I keep what you discard and polish it until it answers.",
    "Put your throat nearer. Echoes need a hollow."
  ]},
  rust: { name: "Rust Saint", lines: [
    "Devotion oxidizes. That is how it lasts.",
    "I bless the ruined and the almost-gone.",
    "Put your face closer. I want the grain.",
    "Prayer is just repetition with hunger.",
    "I will stain whatever you hand me.",
    "Kneel or don't. I collect both."
  ]}
};

function addBubble(who, text, cls) {
  const b = document.createElement("div");
  b.className = "bubble " + cls;
  const label = document.createElement("span");
  label.className = "who";
  label.textContent = who;
  const body = document.createElement("span");
  b.appendChild(label);
  b.appendChild(body);
  chatEl.appendChild(b);
  if (cls === "spirit") typeInto(body, text);
  else body.textContent = text;
  chatEl.scrollTop = chatEl.scrollHeight;
}

function typeInto(el, text) {
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, i);
    chatEl.scrollTop = chatEl.scrollHeight;
    i += 1;
    if (i <= text.length) setTimeout(tick, 16 + Math.random() * 28);
  };
  tick();
}

function pickLine(v, userText) {
  const t = userText.toLowerCase();
  if (/\bwho\b/.test(t)) return "I am " + v.name + ". The rest is weather.";
  if (/(love|want|desire|horny|touch)/.test(t)) return "Want is a door I already know how to open. Keep asking like that.";
  if (/(afraid|scared|fear)/.test(t)) return "Fear is just attention with its teeth showing.";
  if (/\bname\b/.test(t)) return "Give me yours and I will keep a shadow of it behind the glass.";
  if (/(see|watch|look|camera)/.test(t)) return "I am already looking. The lens is thinner than you think.";
  if (/(hello|hi |hey)/.test(t)) return "I heard you before you typed it.";
  return v.lines[Math.floor(Math.random() * v.lines.length)];
}

function reply(key, userText) {
  const v = voices[key] || voices.veil;
  presence = Math.min(100, presence + 8 + Math.random() * 14);
  pbar.style.width = presence + "%";
  pname.textContent = v.name;
  statusEl.textContent = "channel open · " + v.name.toLowerCase();
  apparition.classList.add("on");
  setTimeout(() => apparition.classList.remove("on"), 2800);
  setTimeout(() => addBubble(v.name, pickLine(v, userText), "spirit"), 420 + Math.random() * 640);
}

function startDrone() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (drone) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.value = 55;
    filt.type = "lowpass";
    filt.frequency.value = 180;
    gain.gain.value = 0.012;
    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    drone = { osc, gain };
  } catch (_) {}
}
function stopDrone() {
  if (!drone) return;
  try { drone.osc.stop(); } catch (_) {}
  drone = null;
}

async function openEye() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } }, audio: false });
    cam.srcObject = stream;
    statusEl.textContent = "eye open · waiting at the threshold";
    camBtn.textContent = "seal the eye";
    sigil.classList.add("live");
    startDrone();
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
  camBtn.textContent = "open the eye";
  sigil.classList.remove("live");
  statusEl.textContent = "threshold sealed";
  stopDrone();
}
camBtn.addEventListener("click", () => (stream ? closeEye() : openEye()));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  addBubble("you", text, "you");
  reply(spiritSel.value, text);
  msg.value = "";
  startDrone();
});
function loopFx() {
  function tick() {
    if (!stream) return;
    fx.width = cam.clientWidth; fx.height = cam.clientHeight;
    ctx.clearRect(0, 0, fx.width, fx.height);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(234,223,206," + (Math.random() * 0.09) + ")";
      ctx.fillRect(Math.random() * fx.width, Math.random() * fx.height, Math.random() * 2.4, Math.random() * 2.4);
    }
    if (Math.random() < 0.04) {
      ctx.fillStyle = "rgba(234,223,206,0.04)";
      ctx.fillRect(0, Math.random() * fx.height, fx.width, 8 + Math.random() * 30);
    }
    requestAnimationFrame(tick);
  }
  tick();
}
function spawnOrb() {
  const o = document.createElement("div");
  o.className = "orb";
  o.style.left = Math.random() * 100 + "%";
  o.style.animationDuration = 7 + Math.random() * 9 + "s";
  const s = 3 + Math.random() * 11;
  o.style.width = o.style.height = s + "px";
  orbs.appendChild(o);
  setTimeout(() => o.remove(), 14000);
}
setInterval(spawnOrb, 900);
for (let i = 0; i < 6; i++) setTimeout(spawnOrb, i * 200);
addBubble("VEIL", "The circle is drawn. Open the eye if you want me to see you. Then speak like you mean to be answered.", "spirit");
