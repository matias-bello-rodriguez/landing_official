export function initHeroReel() {
  const root = document.querySelector("[data-hero-reel]");
  if (!root) return;

  const srcs = [
    "/assets/videos/hero-code.mp4",
    "/assets/videos/hero-ops.mp4",
    "/assets/videos/hero-data.mp4",
    "/assets/videos/hero-collab.mp4",
  ];
  const layers = root.querySelectorAll(".video-hero__media");
  if (layers.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let i = 0;
  let showing = 0;
  let timer = 0;
  let visible = true;
  const hold = 6500;

  function load(el, src) {
    if (el.getAttribute("src") === src) return;
    el.src = src;
    el.load();
  }

  function playCurrent() {
    if (document.hidden || !visible) return;
    layers[showing].play().catch(() => {});
  }

  load(layers[0], srcs[0]);
  layers[0].classList.add("is-active");

  if (reduceMotion) return;

  playCurrent();

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) playCurrent();
      else layers.forEach((layer) => layer.pause());
    },
    { threshold: 0.12 },
  );
  io.observe(root);

  timer = window.setInterval(() => {
    if (document.hidden || !visible) return;
    const nextIdx = (i + 1) % srcs.length;
    const hide = layers[showing];
    const show = layers[1 - showing];
    load(show, srcs[nextIdx]);
    show.play().catch(() => {});
    show.classList.add("is-active");
    hide.classList.remove("is-active");
    window.setTimeout(() => {
      hide.pause();
    }, 900);
    i = nextIdx;
    showing = 1 - showing;
  }, hold);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      layers.forEach((layer) => layer.pause());
    } else {
      playCurrent();
    }
  });

  window.addEventListener(
    "pagehide",
    () => {
      window.clearInterval(timer);
      io.disconnect();
    },
    { once: true },
  );
}
