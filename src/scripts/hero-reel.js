import { playBgVideo, prepareBgVideo } from "./bg-video.js";

export function initHeroReel() {
  const root = document.querySelector("[data-hero-reel]");
  if (!root) return;

  const srcs = [
    "/assets/videos/hero-code.mp4",
    "/assets/videos/hero-ops.mp4",
    "/assets/videos/hero-data.mp4",
    "/assets/videos/hero-collab.mp4",
  ];
  const layers = [...root.querySelectorAll(".video-hero__media")];
  if (layers.length < 2) return;

  layers.forEach(prepareBgVideo);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0;
  let showing = 0;
  let timer = 0;
  let hideTimer = 0;
  let visible = true;
  let busy = false;
  const hold = 6500;
  const quiet = new WeakSet();

  function currentSrc(el) {
    return el.getAttribute("src") || el.currentSrc || "";
  }

  function srcMatches(el, src) {
    const now = currentSrc(el);
    return now === src || now.endsWith(src);
  }

  function pauseQuiet(el) {
    quiet.add(el);
    el.pause();
    requestAnimationFrame(() => quiet.delete(el));
  }

  function loadReady(el, src) {
    prepareBgVideo(el);
    if (srcMatches(el, src) && el.readyState >= 2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(failTimer);
        resolve();
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        reject(new Error("video load failed"));
      };
      const failTimer = window.setTimeout(fail, 8000);
      el.addEventListener("canplay", done, { once: true });
      el.addEventListener("loadeddata", done, { once: true });
      el.addEventListener("error", fail, { once: true });
      if (!srcMatches(el, src)) el.src = src;
      if (el.readyState >= 2) done();
    });
  }

  function playCurrent() {
    if (document.hidden || !visible) return;
    const el = layers[showing];
    if (!el.paused && !el.ended) return;
    playBgVideo(el);
  }

  void loadReady(layers[0], srcs[0]).then(() => {
    layers[0].classList.add("is-active");
    if (!reduceMotion) playCurrent();
  });

  if (reduceMotion) return;

  const io = new IntersectionObserver(
    (entries) => {
      const nowVisible = entries.some((entry) => entry.isIntersecting);
      if (nowVisible) {
        window.clearTimeout(hideTimer);
        visible = true;
        playCurrent();
        return;
      }
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        visible = false;
        layers.forEach(pauseQuiet);
      }, 400);
    },
    { threshold: 0.01, rootMargin: "80px 0px" },
  );
  io.observe(root);

  async function swap() {
    if (busy || document.hidden || !visible) return;
    busy = true;
    try {
      const nextIdx = (i + 1) % srcs.length;
      const hide = layers[showing];
      const show = layers[1 - showing];
      await loadReady(show, srcs[nextIdx]);
      await playBgVideo(show);
      if (show.paused) return;
      show.classList.add("is-active");
      hide.classList.remove("is-active");
      window.setTimeout(() => {
        if (hide !== layers[showing]) pauseQuiet(hide);
      }, 900);
      i = nextIdx;
      showing = 1 - showing;
    } catch {
      playCurrent();
    } finally {
      busy = false;
    }
  }

  timer = window.setInterval(() => {
    void swap();
  }, hold);

  const resume = () => {
    if (document.hidden || !visible) return;
    playCurrent();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) layers.forEach(pauseQuiet);
    else resume();
  });
  window.addEventListener("pageshow", resume);
  window.addEventListener("focus", resume);
  window.addEventListener("touchstart", resume, { passive: true });
  window.addEventListener("pointerdown", resume, { passive: true });

  layers.forEach((layer) => {
    layer.addEventListener("pause", () => {
      if (quiet.has(layer) || layer !== layers[showing] || document.hidden || !visible) return;
      playBgVideo(layer);
    });
  });

  window.addEventListener(
    "pagehide",
    () => {
      window.clearInterval(timer);
      window.clearTimeout(hideTimer);
      io.disconnect();
    },
    { once: true },
  );
}
