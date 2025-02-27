"use client";

import { createContext, useContext, useState } from "react";

type AnalyticsStoreContextType = {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
  setProjectId: (projectId: string) => void;
  setStartDate: (startDate: Date) => void;
  setEndDate: (endDate: Date) => void;
};

export const AnalyticsStoreContext = createContext<AnalyticsStoreContextType>({
  projectId: "",
  startDate: undefined,
  endDate: undefined,
  setProjectId: () => undefined,
  setStartDate: () => undefined,
  setEndDate: () => undefined,
});

export const AnalyticsStoreProvider = ({
  children,
  initialStartDate,
  initialEndDate,
}: {
  children: React.ReactNode;
  initialStartDate?: Date;
  initialEndDate?: Date;
}) => {
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStartDate,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  return (
    <AnalyticsStoreContext.Provider
      value={{
        projectId,
        startDate,
        endDate,
        setProjectId,
        setStartDate,
        setEndDate,
      }}
    >
      {children}
    </AnalyticsStoreContext.Provider>
  );
};

export const useAnalyticsStore = () => {
  const {
    projectId,
    startDate,
    endDate,
    setProjectId,
    setStartDate,
    setEndDate,
  } = useContext(AnalyticsStoreContext);

  return {
    projectId,
    startDate,
    endDate,
    setProjectId,
    setStartDate,
    setEndDate,
  };
};
