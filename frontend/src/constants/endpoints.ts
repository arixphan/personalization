import { AUTH_CONFIG } from "@personalization/shared";
import { z } from "zod";
import { createRoute } from "../lib/route-builder";

export enum AuthEndpoint {
  signIn = "auth/login",
  signUp = "user/register",
  logout = "auth/logout",
  refreshToken = "auth/refresh",
}
export const REFRESH_TOKEN_ENDPOINT = "/internal-api/auth-refresh";

export const ProjectEndpoint = {
  list: createRoute({ path: "projects" }),
  create: createRoute({ path: "projects" }),
  detail: createRoute({
    path: "projects/:id",
    params: z.object({ id: z.string() }),
  }),
  delete: createRoute({
    path: "projects/:id",
    params: z.object({ id: z.string() }),
  }),
  update: createRoute({
    path: "projects/:id",
    params: z.object({ id: z.string() }),
  }),
  updateStatus: createRoute({
    path: "projects/:id/status",
    params: z.object({ id: z.string() }),
  }),
};

export const TicketEndpoint = {
  list: createRoute({ path: "tickets" }),
  create: createRoute({ path: "tickets" }),
  detail: createRoute({
    path: "tickets/:id",
    params: z.object({ id: z.string() }),
  }),
  update: createRoute({
    path: "tickets/:id",
    params: z.object({ id: z.string() }),
  }),
  delete: createRoute({
    path: "tickets/:id",
    params: z.object({ id: z.string() }),
  }),
  listByProject: createRoute({
    path: "tickets/project/:projectId",
    params: z.object({ projectId: z.coerce.string() }),
  }),
  closeDone: createRoute({
    path: "tickets/project/:projectId/close-done",
    params: z.object({ projectId: z.coerce.string() }),
  }),
};


export const UserEndpoint = {
  list: createRoute({ path: "user" }),
  detail: createRoute({
    path: "user/:id",
    params: z.object({ id: z.string() }),
  }),
  profile: createRoute({ path: "user/profile" }),
  settings: createRoute({ path: "user/settings" }),
  experience: createRoute({ path: "user/profile/experience" }),
  education: createRoute({ path: "user/profile/education" }),
  skills: createRoute({ path: "user/profile/skills" }),
};

export const ProgressEndpoint = {
  list: createRoute({ path: "progress" }),
  create: createRoute({ path: "progress" }),
  detail: createRoute({
    path: "progress/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
  update: createRoute({
    path: "progress/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
  delete: createRoute({
    path: "progress/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
  updateItem: createRoute({
    path: "progress/:id/items/:itemId",
    params: z.object({ id: z.coerce.string(), itemId: z.coerce.string() }),
  }),
  addItem: createRoute({
    path: "progress/:id/items",
    params: z.object({ id: z.coerce.string() }),
  }),
};

export const EnglishLearningEndpoint = {
  list: createRoute({ path: "english-learning" }),
  random: createRoute({ path: "english-learning/random" }),
  aiAssist: createRoute({ path: "english-learning/ai-assist" }),
  create: createRoute({ path: "english-learning" }),
  update: createRoute({
    path: "english-learning/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
  delete: createRoute({
    path: "english-learning/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
  listWritings: createRoute({ path: "english-learning/writings" }),
  createWriting: createRoute({ path: "english-learning/writings" }),
  writingDetail: createRoute({
    path: "english-learning/writings/:id",
    params: z.object({ id: z.coerce.string() }),
  }),
};

