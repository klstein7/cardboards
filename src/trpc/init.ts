import { auth } from "@clerk/nextjs/server";
import { type inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

import { type AppRouter } from "~/server/api/routers";

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

// Export router types
export type RouterOutputs = inferRouterOutputs<AppRouter>;
