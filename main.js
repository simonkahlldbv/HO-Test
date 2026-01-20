import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("container");

/* Renderer */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

/* Scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

/* Camera */
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 2, 5);

/* Controls (EINE Kamera für ALLES) */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* Licht */
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 5);
scene.add(dir);

/* Gruppen */
const leftGroup = new THREE.Group();
const rightGroup = new THREE.Group();
scene.add(leftGroup);
scene.add(rightGroup);

/* Loader */
const loader = new GLTFLoader();

/* Clipping (Split View) */
renderer.localClippingEnabled = true;
const planeLeft = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const planeRight = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

/* Loaders */
window.loadLeft = (src) => {
  clearGroup(leftGroup);
  loader.load(src, gltf => {
    applyClipping(gltf.scene, [planeLeft]);
    leftGroup.add(gltf.scene);
  });
};

window.loadRight = (src) => {
  clearGroup(rightGroup);
  loader.load(src, gltf => {
    applyClipping(gltf.scene, [planeRight]);
    rightGroup.add(gltf.scene);
  });
};

/* Helpers */
function clearGroup(group) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }
}

function applyClipping(obj, planes) {
  obj.traverse(c => {
    if (c.isMesh) {
      c.material = c.material.clone();
      c.material.clippingPlanes = planes;
      c.material.clipShadows = true;
    }
  });
}

/* Initial */
loadLeft("1150.glb");
loadRight("1936.glb");

/* Slider */
const slider = document.getElementById("slider");
let dragging = false;

slider.onmousedown = () => dragging = true;
window.onmouseup = () => dragging = false;

window.onmousemove = e => {
  if (!dragging) return;
  const x = Math.max(250, Math.min(window.innerWidth - 50, e.clientX));
  slider.style.left = x + "px";
  const offset = (x - 220) / (window.innerWidth - 220);
  planeLeft.constant = -offset * 5;
  planeRight.constant = offset * 5;
};

/* Resize */
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

/* Render Loop */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
