import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import type { Database, Transaction } from "~/server/db";
import type { ProjectUserService } from "~/server/services/project-user.service";

// Mock database
export const mockDb = mockDeep<Database>();
export const mockTx = mockDeep<Transaction>();

// Mock ProjectUserService that AuthService depends on
export const mockProjectUserService = mockDeep<ProjectUserService>();

// Reset all mocks before each test
beforeEach(() => {
  mockReset(mockDb);
  mockReset(mockTx);
  mockReset(mockProjectUserService);
});
