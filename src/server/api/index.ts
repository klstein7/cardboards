import {
  boardController,
  cardCommentController,
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
  cardComment: cardCommentController,
  projectUser: projectUserController,
};
