import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* Enable animation mode */
document.documentElement.classList.add("js");

const state = {
  theme: localStorage.getItem("theme") || "dark",
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

const el = {
  canvas: document.getElementById("webgl"),
  themeBtn: document.getElementById("themeBtn"),
  year: document.getElementById("year"),
  copyEmailBtn: document.getElementById("copyEmailBtn"),
  fakeSend: document.getElementById("fakeSend"),
  formHint: document.getElementById("formHint"),
};

if (el.year) el.year.textContent = new Date().getFullYear();

/* Theme toggle */
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  localStorage.setItem("theme", t);
  state.theme = t;
}
applyTheme(state.theme);

if (el.themeBtn){
  el.themeBtn.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });
}

/* Copy email */
if (el.copyEmailBtn){
  el.copyEmailBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try{
      await navigator.clipboard.writeText("you@example.com");
      el.copyEmailBtn.textContent = "Copied ✓";
      setTimeout(() => (el.copyEmailBtn.textContent = "Copy email"), 1200);
    } catch {
      el.copyEmailBtn.textContent = "Copy failed";
      setTimeout(() => (el.copyEmailBtn.textContent = "Copy email"), 1200);
    }
  });
}

/* Fake send */
if (el.fakeSend && el.formHint){
  el.fakeSend.addEventListener("click", () => {
    el.fakeSend.textContent = "Sent ✓";
    el.fakeSend.disabled = true;
    el.formHint.textContent = "Nice. Connect this to Formspree / your backend when ready.";
    setTimeout(() => {
      el.fakeSend.textContent = "Send message";
      el.fakeSend.disabled = false;
      el.formHint.textContent = "This demo button shows UI feedback. Wire it to Formspree / your backend when ready.";
    }, 2200);
  });
}

/* -------------------- ✅ Animate everything on scroll -------------------- */
const items = Array.from(document.querySelectorAll(".animate"));

/* Auto-assign direction if missing */
const cycle = ["down", "left", "right", "up"]; // variety
items.forEach((node, i) => {
  if (!node.dataset.anim) node.dataset.anim = cycle[i % cycle.length];
  node.style.transitionDelay = `${(i % 10) * 65}ms`; // stagger
});

if (state.prefersReducedMotion){
  items.forEach((n) => n.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting){
          e.target.classList.add("is-in");
          io.unobserve(e.target); // animate once
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((n) => io.observe(n));
}

/* -------------------- Three.js hero scene -------------------- */
if (el.canvas){
  const canvas = el.canvas;
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0.1, 0.6, 4.4);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.6;
  controls.maxDistance = 6.4;
  controls.autoRotate = !state.prefersReducedMotion;
  controls.autoRotateSpeed = 0.45;

  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(3, 4, 2);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const hero = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.9, 0.28, 240, 22),
    new THREE.MeshPhysicalMaterial({
      color: 0x8a7dff,
      roughness: 0.28,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.22,
    })
  );
  scene.add(hero);

  function resizeRendererToDisplaySize(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pr = renderer.getPixelRatio();
    const rw = Math.floor(w * pr);
    const rh = Math.floor(h * pr);
    if (canvas.width !== rw || canvas.height !== rh){
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  const clock = new THREE.Clock();
  function tick(){
    const dt = clock.getDelta();
    resizeRendererToDisplaySize();
    hero.rotation.y += dt * 0.35;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}
