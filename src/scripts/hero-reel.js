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

  let i = 0;
  let showing = 0;
  const hold = 6500;

  function load(el, src) {
    el.src = src;
    el.load();
  }

  load(layers[0], srcs[0]);
  layers[0].classList.add("is-active");
  layers[0].play().catch(() => {});
  load(layers[1], srcs[1]);

  setInterval(() => {
    const nextIdx = (i + 1) % srcs.length;
    const hide = layers[showing];
    const show = layers[1 - showing];
    show.play().catch(() => {});
    show.classList.add("is-active");
    hide.classList.remove("is-active");
    window.setTimeout(() => {
      hide.pause();
      load(hide, srcs[(nextIdx + 1) % srcs.length]);
    }, 900);
    i = nextIdx;
    showing = 1 - showing;
  }, hold);
}
