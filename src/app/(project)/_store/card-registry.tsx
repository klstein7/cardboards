"use client";

import { createContext, useCallback, useContext, useRef } from "react";

type CardRegistry = Record<string, HTMLElement>;

export const CardRegistryContext = createContext<{
  register: (id: string, element: HTMLElement) => void;
  get: (id: string) => HTMLElement | undefined;
  unregister: (id: string) => void;
}>({
  register: () => undefined,
  get: () => undefined,
  unregister: () => undefined,
});

export function CardRegistryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const registry = useRef<CardRegistry>({});

  const register = useCallback((id: string, element: HTMLElement) => {
    registry.current[id] = element;
  }, []);

  const get = useCallback((id: string) => {
    console.log(registry.current);
    return registry.current[id];
  }, []);

  const unregister = useCallback((id: string) => {
    delete registry.current[id];
  }, []);

  return (
    <CardRegistryContext.Provider value={{ register, get, unregister }}>
      {children}
    </CardRegistryContext.Provider>
  );
}

export function useCardRegistry() {
  return useContext(CardRegistryContext);
}
