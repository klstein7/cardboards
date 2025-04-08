"use client";

import React from "react";

import { FloatingNotificationsButton } from "./floating-notifications-button";

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  return (
    <>
      {children}
      <FloatingNotificationsButton />
    </>
  );
}
