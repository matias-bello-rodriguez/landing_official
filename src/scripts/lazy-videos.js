import { playBgVideo, prepareBgVideo } from "./bg-video.js";

export function initLazyVideos() {
  const videos = [...document.querySelectorAll("video")];
  if (!videos.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-hero-reel]");
  const managed = videos.filter((video) => !hero?.contains(video));

  for (const video of videos) prepareBgVideo(video);
  if (!managed.length) return;

  const inView = new WeakSet();
  const pausing = new WeakSet();

  const playIfAllowed = (video) => {
    if (reduceMotion || document.hidden || !inView.has(video)) return;
    if (!video.paused && !video.ended) return;
    playBgVideo(video);
  };

  const pauseQuietly = (video) => {
    pausing.add(video);
    video.pause();
    requestAnimationFrame(() => pausing.delete(video));
  };

  const hideTimers = new WeakMap();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) continue;
        window.clearTimeout(hideTimers.get(video));
        if (entry.isIntersecting) {
          inView.add(video);
          playIfAllowed(video);
        } else {
          hideTimers.set(
            video,
            window.setTimeout(() => {
              inView.delete(video);
              pauseQuietly(video);
            }, 400),
          );
        }
      }
    },
    { rootMargin: "120px 0px", threshold: 0.01 },
  );

  for (const video of managed) {
    if (!video.getAttribute("preload")) video.preload = "none";
    video.addEventListener("pause", () => {
      if (pausing.has(video) || document.hidden) return;
      playIfAllowed(video);
    });
    observer.observe(video);
  }

  const resumeVisible = () => {
    if (document.hidden) {
      for (const video of managed) pauseQuietly(video);
      return;
    }
    for (const video of managed) playIfAllowed(video);
  };

  document.addEventListener("visibilitychange", resumeVisible);
  window.addEventListener("pageshow", resumeVisible);
  window.addEventListener("focus", resumeVisible);
  window.addEventListener("touchstart", resumeVisible, { passive: true });
  window.addEventListener("pointerdown", resumeVisible, { passive: true });
}
