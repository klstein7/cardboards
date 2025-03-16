// Type declarations for components
declare module "../_components/search-bar" {
  export function SearchBar(): JSX.Element;
}

declare module "../_components/stats-counter" {
  export function StatsCounter({
    type,
  }: {
    type: "active" | "boards" | "recent";
  }): JSX.Element;
}

declare module "../_components/project-list" {
  export function ProjectList(): JSX.Element;
}
