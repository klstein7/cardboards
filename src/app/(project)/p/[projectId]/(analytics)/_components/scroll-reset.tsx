"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const ScrollReset = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Function to reset scroll positions
    const resetScroll = () => {
      // Reset main window scroll
      window.scrollTo(0, 0);

      // Reset main content element scroll if it exists
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.scrollTop = 0;
      }

      // Reset any other scrollable containers
      document
        .querySelectorAll(".overflow-auto, .overflow-y-auto")
        .forEach((element) => {
          if (element instanceof HTMLElement) {
            element.scrollTop = 0;
          }
        });
    };

    // Reset scroll immediately
    resetScroll();

    // Also reset after a small delay to handle any post-render layout shifts
    const timeoutId = setTimeout(resetScroll, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};
