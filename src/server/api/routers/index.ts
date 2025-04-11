import { z } from "zod";

import { baseProcedure, createTRPCRouter } from "~/trpc/init";

// Import domain-specific routers
import { aiInsightRouter } from "./ai-insight.router";
import { analyticsRouter } from "./analytics.router";
import { boardRouter } from "./board.router";
import { cardRouter } from "./card.router";
import { cardCommentRouter } from "./card-comment.router";
import { columnRouter } from "./column.router";
import { historyRouter } from "./history.router";
import { invitationRouter } from "./invitation.router";
import { notificationRouter } from "./notification.router";
import { projectRouter } from "./project.router";
import { projectUserRouter } from "./project-user.router";

export const appRouter = createTRPCRouter({
  // Test endpoint (does not require authentication)
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  // Domain-specific routers with authorization checks
  aiInsight: aiInsightRouter,
  analytics: analyticsRouter,
  board: boardRouter,
  card: cardRouter,
  cardComment: cardCommentRouter,
  column: columnRouter,
  history: historyRouter,
  invitation: invitationRouter,
  notification: notificationRouter,
  project: projectRouter,
  projectUser: projectUserRouter,
});

export type AppRouter = typeof appRouter;
