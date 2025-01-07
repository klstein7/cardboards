"use client";

import { createContext, useCallback, useContext, useRef } from "react";

type TaskRegistry = Record<string, HTMLElement>;

export const TaskRegistryContext = createContext<{
  register: (id: string, element: HTMLElement) => void;
  get: (id: string) => HTMLElement | undefined;
  unregister: (id: string) => void;
}>({
  register: () => undefined,
  get: () => undefined,
  unregister: () => undefined,
});

export function TaskRegistryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const registry = useRef<TaskRegistry>({});

  const register = useCallback((id: string, element: HTMLElement) => {
    registry.current[id] = element;
  }, []);

  const get = useCallback((id: string) => {
    return registry.current[id];
  }, []);

  const unregister = useCallback((id: string) => {
    delete registry.current[id];
  }, []);

  return (
    <TaskRegistryContext.Provider value={{ register, get, unregister }}>
      {children}
    </TaskRegistryContext.Provider>
  );
}

export function useTaskRegistry() {
  return useContext(TaskRegistryContext);
}
