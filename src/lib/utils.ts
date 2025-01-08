import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerPostMoveFlash(element: HTMLElement) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      if (element && document.body.contains(element)) {
        element.animate(
          [
            {
              backgroundColor: "hsl(var(--secondary))",
            },
            {
              backgroundColor: "transparent",
            },
          ],
          {
            duration: 500,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            iterations: 1,
          },
        );
      }
    });
  }, 50);
}

interface RetryFlashOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  isCrossColumnMove?: boolean;
  getElement: (cardId: string) => HTMLElement | undefined | null;
}

export function retryFlash(
  cardId: string,
  {
    maxRetries = 5,
    initialDelay = 10,
    backoffFactor = 1.1,
    isCrossColumnMove = false,
    getElement,
  }: RetryFlashOptions,
) {
  const attempt = (retriesLeft: number, currentDelay: number) => {
    const element = getElement(cardId);

    if (element) {
      triggerPostMoveFlash(element);
    } else if (retriesLeft > 0) {
      const nextDelay =
        isCrossColumnMove && retriesLeft === maxRetries
          ? 150
          : currentDelay * backoffFactor;

      setTimeout(() => {
        attempt(retriesLeft - 1, nextDelay);
      }, nextDelay);
    }
  };

  if (isCrossColumnMove) {
    setTimeout(() => attempt(maxRetries, initialDelay), 100);
  } else {
    attempt(maxRetries, initialDelay);
  }
}
