import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import type { Database, Transaction } from "~/server/db";
import type { ProjectUserService } from "~/server/services/project-user.service";

export const mockDb = mockDeep<Database>();
export const mockTx = mockDeep<Transaction>();

export const mockProjectUserService = mockDeep<ProjectUserService>();

beforeEach(() => {
  mockReset(mockDb);
  mockReset(mockTx);
  mockReset(mockProjectUserService);
});
