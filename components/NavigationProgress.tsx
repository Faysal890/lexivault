"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const navigating = useRef(false);

  // Pathname changed → navigation complete
  useEffect(() => {
    if (!navigating.current) return;
    navigating.current = false;
    setFinishing(true);
    setWidth(100);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setFinishing(false);
      setWidth(0);
    }, 400);
  }, [pathname]);

  // Intercept link clicks to start the bar immediately
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const dest = href.split(/[?#]/)[0];
      if (dest === pathname) return;

      navigating.current = true;
      clearTimeout(hideTimer.current);
      setFinishing(false);
      setWidth(0);
      setVisible(true);
      // Double rAF ensures the element mounts at width=0 before the transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setWidth(72)));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        className="h-full bg-primary rounded-r-full"
        style={{
          width: `${width}%`,
          opacity: finishing ? 0 : 1,
          transition: finishing
            ? "width 200ms ease-out, opacity 250ms ease-out 150ms"
            : "width 4000ms ease-out",
        }}
      />
    </div>
  );
}
