"use server";

import {
  authService,
  boardService,
  projectUserService,
} from "~/server/services";
import {
  type BoardCreate,
  BoardCreateSchema,
  type BoardGenerate,
  BoardGenerateSchema,
  type BoardUpdate,
  BoardUpdateSchema,
} from "~/server/zod";

export async function create(data: BoardCreate) {
  const parsed = BoardCreateSchema.parse(data);
  await projectUserService.getCurrentProjectUser(parsed.projectId);
  return boardService.create(parsed);
}

export async function list(projectId: string) {
  await projectUserService.getCurrentProjectUser(projectId);
  return boardService.list(projectId);
}

export async function get(boardId: string) {
  await authService.canAccessBoard(boardId);
  return boardService.get(boardId);
}

export async function update(data: BoardUpdate) {
  const { boardId, data: payload } = BoardUpdateSchema.parse(data);
  await authService.canAccessBoard(boardId);
  return boardService.update(boardId, payload);
}

export async function del(boardId: string) {
  await authService.canAccessBoard(boardId);
  return boardService.del(boardId);
}

export async function generate(data: BoardGenerate) {
  const { projectId, prompt } = BoardGenerateSchema.parse(data);
  await authService.canAccessProject(projectId);
  return boardService.generate(projectId, prompt);
}

export async function countByProjectId(projectId: string) {
  await authService.canAccessProject(projectId);
  return boardService.countByProjectId(projectId);
}
