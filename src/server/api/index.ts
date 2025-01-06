import {
  boardController,
  columnController,
  projectController,
  cardController,
} from "./controllers";

export const api = {
  project: projectController,
  board: boardController,
  column: columnController,
  card: cardController,
};
