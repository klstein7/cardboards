import {
  boardController,
  cardController,
  columnController,
  projectController,
  projectUserController,
} from "./controllers";

export const api = {
  project: projectController,
  board: boardController,
  column: columnController,
  card: cardController,
  projectUser: projectUserController,
};
