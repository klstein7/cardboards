import { z } from "zod";

import { baseProcedure, createTRPCRouter } from "~/trpc/init";

// Import domain-specific routers
import { analyticsRouter } from "./analytics";
import { boardRouter } from "./board";
import { cardRouter } from "./card";
import { cardCommentRouter } from "./card-comment";
import { columnRouter } from "./column";
import { invitationRouter } from "./invitation";
import { projectRouter } from "./project";
import { projectUserRouter } from "./project-user";

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
  analytics: analyticsRouter,
  board: boardRouter,
  card: cardRouter,
  cardComment: cardCommentRouter,
  column: columnRouter,
  invitation: invitationRouter,
  project: projectRouter,
  projectUser: projectUserRouter,
});

export type AppRouter = typeof appRouter;
