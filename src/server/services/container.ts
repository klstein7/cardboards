import "server-only";

// Import the *real* production db instance
import { type Database, db } from "../db";
// Import all SERVICE CLASSES
import { AiInsightService } from "./ai-insight.service";
import { AnalyticsService } from "./analytics.service";
import { AuthService } from "./auth.service";
import { BoardService } from "./board.service";
import { BoardContextService } from "./board-context.service";
import { CardService } from "./card.service";
import { CardCommentService } from "./card-comment.service";
import { ColumnService } from "./column.service";
import { HistoryService } from "./history.service";
import { InvitationService } from "./invitation.service";
import { NotificationService } from "./notification.service";
import { ProjectService } from "./project.service";
import { ProjectUserService } from "./project-user.service";
import { UserService } from "./user.service";

// Instantiate services in dependency order, injecting the production 'db'
// and other required service *instances*.

// Simpler services first
const userService = new UserService(db);
const analyticsService = new AnalyticsService(db);
const notificationService = new NotificationService(db);
const boardContextService = new BoardContextService(db);

// Services depending on db and simpler services
const projectUserService = new ProjectUserService(db, notificationService); // Depends on NotificationService
const historyService = new HistoryService(db, projectUserService); // Depends on ProjectUserService
const authService = new AuthService(db, projectUserService); // Depends on ProjectUserService

// Services with more complex dependencies
const projectService = new ProjectService(
  db,
  historyService,
  notificationService,
  projectUserService,
  userService,
);
const columnService = new ColumnService(
  db,
  boardContextService,
  historyService,
  notificationService,
  projectService,
  projectUserService,
);
const invitationService = new InvitationService(
  db,
  projectUserService,
  userService,
);
const cardCommentService = new CardCommentService(
  db,
  historyService,
  notificationService,
  projectService,
);

const cardService = new CardService(
  db,
  boardContextService,
  columnService,
  historyService,
  notificationService,
  projectService,
  projectUserService,
);

const boardService = new BoardService(
  db,
  cardService,
  columnService,
  historyService,
  notificationService,
  projectService,
  projectUserService,
);

const aiInsightService = new AiInsightService(
  db,
  boardService,
  cardService,
  columnService,
  historyService,
  projectService,
);

// Group all service instances into a single object for export
const services = {
  aiInsightService,
  analyticsService,
  authService,
  boardContextService,
  boardService,
  cardCommentService,
  cardService,
  columnService,
  historyService,
  invitationService,
  notificationService,
  projectService,
  projectUserService,
  userService,
};

// Export the grouped services object
export { services };

// Type helper derived from the grouped services object
export type ServiceContainer = typeof services;
