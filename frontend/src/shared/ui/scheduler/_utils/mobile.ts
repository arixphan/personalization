export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|windows phone|android.*mobile/i;
  return mobileRegex.test(userAgent);
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function doesScrollbarAffectLayout() {
  if (typeof document === "undefined") return false;
  const outer = document.createElement("div");
  outer.style.overflow = "scroll";
  outer.style.width = "100px";

  const inner = document.createElement("div");
  inner.style.width = "100%";

  outer.appendChild(inner);
  document.body.appendChild(outer);
  const widthDiff = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);

  return widthDiff > 0;
}
