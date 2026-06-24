/** モバイルブラウザのアドレスバー表示でずれるビューポート位置を CSS 変数に同期する。 */
export function syncAppHeight(): void {
  const root = document.documentElement;

  const apply = () => {
    const vv = window.visualViewport;
    const top = vv?.offsetTop ?? 0;
    root.style.setProperty("--app-offset-top", `${top}px`);
    // 参照用（overlay の max-height など）
    root.style.setProperty("--app-height", `${window.innerHeight - top}px`);
  };

  apply();
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  window.addEventListener("load", apply, { passive: true });
  window.addEventListener("pageshow", apply, { passive: true });
  window.addEventListener("resize", apply, { passive: true });
  window.addEventListener("orientationchange", apply, { passive: true });
  window.visualViewport?.addEventListener("resize", apply, { passive: true });
  window.visualViewport?.addEventListener("scroll", apply, { passive: true });
}
