import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

/* ========= BASIC SETUP ========= */
const loader = new GLTFLoader();

/* ---------- MAIN VIEW ---------- */
const mainContainer = document.getElementById("viewer");
const mainScene = new THREE.Scene();
mainScene.background = new THREE.Color(0xf0f0f0);

const mainCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
mainCamera.position.set(0, 2, 6);

const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
mainContainer.appendChild(mainRenderer.domElement);

const mainControls = new OrbitControls(mainCamera, mainRenderer.domElement);
mainControls.enableDamping = true;

mainScene.add(new THREE.AmbientLight(0xffffff, 0.8));
const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
mainLight.position.set(5, 10, 5);
mainScene.add(mainLight);

let mainModel;
window.loadMain = (src) => {
  if (mainModel) mainScene.remove(mainModel);
  loader.load(src, gltf => {
    mainModel = gltf.scene;
    mainScene.add(mainModel);
  });
};

loadMain("1150.glb");

/* ---------- COMPARE VIEW ---------- */
const compare = document.getElementById("compare");
const compareContainer = document.getElementById("compareView");

const compareScene = new THREE.Scene();
compareScene.background = new THREE.Color(0xf0f0f0);

const compareCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
compareCamera.position.set(0, 2, 6);

const compareRenderer = new THREE.WebGLRenderer({ antialias: true });
compareRenderer.localClippingEnabled = true;
compareContainer.appendChild(compareRenderer.domElement);

const compareControls = new OrbitControls(compareCamera, compareRenderer.domElement);
compareControls.enableDamping = true;

compareScene.add(new THREE.AmbientLight(0xffffff, 0.8));
const cLight = new THREE.DirectionalLight(0xffffff, 0.6);
cLight.position.set(5, 10, 5);
compareScene.add(cLight);

const leftGroup = new THREE.Group();
const rightGroup = new THREE.Group();
compareScene.add(leftGroup, rightGroup);

const planeL = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const planeR = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

function loadToGroup(group, src, plane) {
  while (group.children.length) group.remove(group.children[0]);
  loader.load(src, gltf => {
    gltf.scene.traverse(m => {
      if (m.isMesh) {
        m.material = m.material.clone();
        m.material.clippingPlanes = [plane];
      }
    });
    group.add(gltf.scene);
  });
}

window.loadLeft = src => loadToGroup(leftGroup, src, planeL);
window.loadRight = src => loadToGroup(rightGroup, src, planeR);

/* ---------- UI ---------- */
document.getElementById("compareBtn").onclick = () => {
  compare.style.display = "block";
  loadLeft("1150.glb");
  loadRight("1936.glb");
};

window.closeCompare = () => {
  compare.style.display = "none";
};

/* ---------- SLIDER ---------- */
const slider = document.getElementById("slider");
let drag = false;

slider.onmousedown = () => drag = true;
window.onmouseup = () => drag = false;

window.onmousemove = e => {
  if (!drag) return;
  const x = Math.max(240, Math.min(window.innerWidth - 20, e.clientX));
  slider.style.left = x + "px";
  const ratio = (x - 220) / (window.innerWidth - 220);
  planeL.constant = -ratio * 5;
  planeR.constant = ratio * 5;
};

/* ---------- RESIZE ---------- */
function resize(renderer, camera, container) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", () => {
  resize(mainRenderer, mainCamera, mainContainer);
  resize(compareRenderer, compareCamera, compareContainer);
});

/* ---------- LOOP ---------- */
function animate() {
  requestAnimationFrame(animate);
  mainControls.update();
  compareControls.update();
  resize(mainRenderer, mainCamera, mainContainer);
  resize(compareRenderer, compareCamera, compareContainer);
  mainRenderer.render(mainScene, mainCamera);
  compareRenderer.render(compareScene, compareCamera);
}
animate();
