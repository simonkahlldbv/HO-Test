const mainModel = document.getElementById("mainModel");
const compare = document.getElementById("compare");
const mvA = document.getElementById("mvA");
const mvB = document.getElementById("mvB");
const slider = document.getElementById("slider");

const START = "0deg 75deg 2.8m";

/* =========================
   WICHTIG: GLOBAL machen
   ========================= */
window.setMain = (src) => {
  mainModel.src = src;
};

/* =========================
   VERGLEICHSMODUS
   ========================= */
document.getElementById("compare-btn").onclick = () => {
  compare.style.display = "block";

  mvA.src = mainModel.src;
  mvB.src = "1936.glb";

  mvA.addEventListener("load", () => {
    mvA.cameraOrbit = START;
  }, { once: true });

  mvB.addEventListener("load", () => {
    mvB.cameraOrbit = START;
  }, { once: true });
};

document.getElementById("back").onclick = () => {
  compare.style.display = "none";
};

/* =========================
   STABILE EIN-KAMERA-SYNC
   ========================= */
mvA.addEventListener("camera-change", () => {
  mvB.cameraOrbit  = mvA.cameraOrbit;
  mvB.cameraTarget = mvA.cameraTarget;
  mvB.fieldOfView  = mvA.fieldOfView;
});

/* =========================
   SLIDER
   ========================= */
let drag = false;
slider.onmousedown = () => drag = true;
window.onmouseup = () => drag = false;

window.onmousemove = e => {
  if (!drag) return;

  const x = Math.max(50, Math.min(window.innerWidth - 50, e.clientX));
  slider.style.left = x + "px";

  const p = x / window.innerWidth * 100;
  mvA.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
  mvB.style.clipPath = `inset(0 0 0 ${p}%)`;
};
