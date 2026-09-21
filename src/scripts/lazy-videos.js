export function initLazyVideos() {
  const videos = [...document.querySelectorAll("video")];
  if (!videos.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-hero-reel]");

  const inView = new WeakSet();

  const playIfAllowed = (video) => {
    if (reduceMotion || document.hidden || !inView.has(video)) return;
    video.play().catch(() => {});
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) continue;
        if (entry.isIntersecting && entry.intersectionRatio > 0.08) {
          inView.add(video);
          if (video.preload === "none") video.preload = "metadata";
          playIfAllowed(video);
        } else {
          inView.delete(video);
          video.pause();
        }
      }
    },
    { rootMargin: "160px 0px", threshold: [0, 0.08, 0.25] },
  );

  for (const video of videos) {
    if (hero?.contains(video)) continue;
    if (!video.getAttribute("preload")) video.preload = "none";
    observer.observe(video);
  }

  document.addEventListener("visibilitychange", () => {
    for (const video of videos) {
      if (document.hidden) video.pause();
      else playIfAllowed(video);
    }
  });
}
