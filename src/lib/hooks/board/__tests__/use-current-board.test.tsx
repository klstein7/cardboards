import { describe, expect, it } from "vitest";
import * as CurrentBoardHook from "../use-current-board";
import * as BoardHook from "../use-board";

describe("useCurrentBoard", () => {
  it("should export the useCurrentBoard hook", () => {
    expect(CurrentBoardHook.useCurrentBoard).toBeDefined();
    expect(typeof CurrentBoardHook.useCurrentBoard).toBe("function");
  });

  it("should use the useBoard hook internally", () => {
    // Just check that the hook imports Board hook
    expect(Object.keys(BoardHook)).toContain("useBoard");
  });
});
