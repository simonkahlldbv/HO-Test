import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

/* ---------- MAIN VIEW ---------- */
const mainScene = new THREE.Scene();
const mainCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
mainCamera.position.set(0, 2, 4);

const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
mainRenderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("mainView").appendChild(mainRenderer.domElement);

const mainControls = new OrbitControls(mainCamera, mainRenderer.domElement);

mainScene.add(new THREE.AmbientLight(0xffffff, 1.2));

let mainModel = null;

function loadMainModel(file) {
  if (mainModel) mainScene.remove(mainModel);
  loader.load(file, gltf => {
    mainModel = gltf.scene;
    mainScene.add(mainModel);
  });
}

loadMainModel("1150.glb");

/* ---------- COMPARE VIEW ---------- */
function createCompare(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  let model = null;

  return {
    scene,
    camera,
    renderer,
    controls,
    load(file) {
      if (model) scene.remove(model);
      loader.load(file, gltf => {
        model = gltf.scene;
        scene.add(model);
      });
    }
  };
}

const left = createCompare(document.getElementById("leftView"));
const right = createCompare(document.getElementById("rightView"));

/* ---------- UI ---------- */
document.getElementById("btnCompare").onclick = () => {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("compare").style.display = "block";
};

document.getElementById("btnBack").onclick = () => {
  document.getElementById("compare").style.display = "none";
  document.getElementById("mainView").style.display = "block";
};

document.querySelectorAll("button[data-model]").forEach(btn => {
  btn.onclick = () => {
    const side = btn.dataset.side;
    const model = btn.dataset.model;
    side === "left" ? left.load(model) : right.load(model);
  };
});

/* ---------- RENDER LOOP ---------- */
function animate() {
  requestAnimationFrame(animate);

  mainControls.update();
  mainRenderer.render(mainScene, mainCamera);

  left.controls.update();
  right.controls.update();

  left.renderer.render(left.scene, left.camera);
  right.renderer.render(right.scene, right.camera);
}

animate();

window.addEventListener("resize", () => {
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();
  mainRenderer.setSize(window.innerWidth, window.innerHeight);
});
