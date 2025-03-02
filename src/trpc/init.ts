import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { z } from "zod";

import { authService, projectUserService } from "~/server/services";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const { userId } = await auth();

  return { userId };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Middleware for ensuring user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

// Base authenticated procedure
export const authedProcedure = baseProcedure.use(isAuthed);

// Board access procedure - combine middleware with input validation
export const boardProcedure = authedProcedure
  .input(z.object({ boardId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessBoard(input.boardId);
    return next({
      ctx: {
        ...ctx,
        boardId: input.boardId,
      },
    });
  });

// Board access by ID procedure - for when the input is just the board ID
export const boardByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessBoard(input);
    return next({
      ctx: {
        ...ctx,
        boardId: input,
      },
    });
  });

// Project access procedure
export const projectProcedure = authedProcedure
  .input(z.object({ projectId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessProject(input.projectId);
    return next({
      ctx: {
        ...ctx,
        projectId: input.projectId,
      },
    });
  });

// Project access by ID procedure
export const projectByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessProject(input);
    return next({
      ctx: {
        ...ctx,
        projectId: input,
      },
    });
  });

// Project member procedure
export const projectMemberProcedure = authedProcedure
  .input(z.object({ projectId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    await projectUserService.getCurrentProjectUser(input.projectId);
    return next({
      ctx: {
        ...ctx,
        projectId: input.projectId,
      },
    });
  });

// Project member by ID procedure
export const projectMemberByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    await projectUserService.getCurrentProjectUser(input);
    return next({
      ctx: {
        ...ctx,
        projectId: input,
      },
    });
  });

// Project admin procedure
export const projectAdminProcedure = authedProcedure
  .input(z.object({ projectId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    await authService.requireProjectAdmin(input.projectId);
    return next({
      ctx: {
        ...ctx,
        projectId: input.projectId,
      },
    });
  });

// Project admin by ID procedure
export const projectAdminByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    await authService.requireProjectAdmin(input);
    return next({
      ctx: {
        ...ctx,
        projectId: input,
      },
    });
  });

// Card access procedure
export const cardProcedure = authedProcedure
  .input(z.object({ cardId: z.number() }))
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessCard(input.cardId);
    return next({
      ctx: {
        ...ctx,
        cardId: input.cardId,
      },
    });
  });

// Card access by ID procedure
export const cardByIdProcedure = authedProcedure
  .input(z.number())
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessCard(input);
    return next({
      ctx: {
        ...ctx,
        cardId: input,
      },
    });
  });

// Column access procedure
export const columnProcedure = authedProcedure
  .input(z.object({ columnId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessColumn(input.columnId);
    return next({
      ctx: {
        ...ctx,
        columnId: input.columnId,
      },
    });
  });

// Column access by ID procedure
export const columnByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessColumn(input);
    return next({
      ctx: {
        ...ctx,
        columnId: input,
      },
    });
  });

// Card comment access by ID procedure
export const cardCommentByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    const { cardCommentService } = await import("~/server/services");
    const comment = await cardCommentService.get(input);
    await authService.canAccessCard(comment.cardId);
    return next({
      ctx: {
        ...ctx,
        cardCommentId: input,
        comment: comment,
      },
    });
  });

// Card comment create procedure
export const cardCommentCreateProcedure = authedProcedure
  .input(z.object({ cardId: z.number() }).passthrough())
  .use(async ({ ctx, next, input }) => {
    await authService.canAccessCard(input.cardId);
    return next({ ctx });
  });

// Card comment update procedure
export const cardCommentUpdateProcedure = authedProcedure
  .input(
    z.object({
      cardCommentId: z.string(),
      data: z.object({ content: z.string() }),
    }),
  )
  .use(async ({ ctx, next, input }) => {
    const { cardCommentService } = await import("~/server/services");
    const comment = await cardCommentService.get(input.cardCommentId);
    await authService.canAccessCard(comment.cardId);
    return next({
      ctx: {
        ...ctx,
        cardCommentId: input.cardCommentId,
        updateData: input.data,
      },
    });
  });

// Invitation access by ID procedure
export const invitationByIdProcedure = authedProcedure
  .input(z.string())
  .use(async ({ ctx, next, input }) => {
    const { invitationService } = await import("~/server/services");
    const invitation = await invitationService.get(input);
    return next({
      ctx: {
        ...ctx,
        invitationId: input,
        invitation: invitation,
      },
    });
  });
