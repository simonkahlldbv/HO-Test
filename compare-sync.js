const mvA = document.getElementById("mvA");
const mvB = document.getElementById("mvB");
const slider = document.getElementById("slider");

const START_ORBIT = "0deg 75deg 2.8m";

let readyA = false;
let readyB = false;

mvA.addEventListener("load", () => {
  readyA = true;
  mvA.cameraOrbit = START_ORBIT;
});

mvB.addEventListener("load", () => {
  readyB = true;
  mvB.cameraOrbit = START_ORBIT;
});

/* ===============================
   STABILE EIN-KAMERA-SYNCHRONISATION
   =============================== */

mvA.addEventListener("camera-change", () => {
  if (!readyA || !readyB) return;

  mvB.cameraOrbit  = mvA.cameraOrbit;
  mvB.cameraTarget = mvA.cameraTarget;
  mvB.fieldOfView  = mvA.fieldOfView;
});

/* ===============================
   MODEL-WECHSEL
   =============================== */

window.setLeft = (src) => {
  mvA.src = src;
};

window.setRight = (src) => {
  mvB.src = src;
};

/* ===============================
   SLIDER
   =============================== */

let dragging = false;

slider.onmousedown = () => dragging = true;
window.onmouseup = () => dragging = false;

window.onmousemove = (e) => {
  if (!dragging) return;

  const x = Math.max(50, Math.min(window.innerWidth - 50, e.clientX));
  slider.style.left = x + "px";

  const pct = x / window.innerWidth * 100;
  mvA.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  mvB.style.clipPath = `inset(0 0 0 ${pct}%)`;
};
