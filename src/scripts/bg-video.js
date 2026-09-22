export function prepareBgVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  if ("disableRemotePlayback" in video) video.disableRemotePlayback = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("disablepictureinpicture", "");
  video.removeAttribute("controls");
}

export function playBgVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return Promise.resolve();
  prepareBgVideo(video);
  if (video.preload === "none") video.preload = "metadata";
  // Never call video.load() here. On iOS it aborts muted autoplay and
  // paints the native play overlay; play() already starts fetching.
  return video.play().catch(() => {});
}
