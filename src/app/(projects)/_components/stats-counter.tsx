"use client";

import { motion } from "framer-motion";

import { useProjects } from "~/lib/hooks";

export function StatsCounter({
  type,
}: {
  type: "active" | "boards" | "recent";
}) {
  const projects = useProjects();

  if (projects.isPending) {
    return <p className="text-2xl font-semibold text-muted/50">-</p>;
  }

  if (projects.isError) {
    return <p className="text-2xl font-semibold text-destructive">Error</p>;
  }

  if (type === "active") {
    return (
      <motion.p
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {projects.data.length}
      </motion.p>
    );
  }

  if (type === "boards") {
    const totalBoards = projects.data.reduce((acc, project) => {
      return acc + (project.boards?.length ?? 0);
    }, 0);

    return (
      <motion.p
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {totalBoards}
      </motion.p>
    );
  }

  if (type === "recent") {
    // Find the most recent project update
    if (projects.data.length === 0) {
      return <p className="text-2xl font-semibold text-muted/50">-</p>;
    }

    const mostRecentUpdate = projects.data.reduce((latest, project) => {
      const updatedAt = project.updatedAt ?? project.createdAt;
      return updatedAt > latest ? updatedAt : latest;
    }, new Date(0));

    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - mostRecentUpdate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let displayText = "";
    let colorClass = "";

    if (diffInDays === 0) {
      displayText = "Today";
      colorClass = "text-primary";
    } else if (diffInDays === 1) {
      displayText = "Yesterday";
      colorClass = "text-primary/80";
    } else {
      displayText = `${diffInDays}d ago`;
      colorClass = diffInDays <= 7 ? "text-primary/60" : "";
    }

    return (
      <motion.p
        className={`text-2xl font-semibold ${colorClass}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {displayText}
      </motion.p>
    );
  }

  return <p className="text-2xl font-semibold text-muted/50">-</p>;
}
