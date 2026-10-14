import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import * as events from "../controllers/event.controller.js";
import * as registrations from "../controllers/registration.controller.js";
import * as admin from "../controllers/admin.controller.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.schemas.js";
import {
  adminListEventsQuery,
  createEventSchema,
  listEventsQuery,
  registrationsQuery,
  statusSchema,
  updateEventSchema,
} from "../validators/event.schemas.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

// Auth
router.post("/auth/register", validate(registerSchema), auth.register);
router.post("/auth/login", validate(loginSchema), auth.login);
router.get("/auth/me", requireAuth, auth.me);

// Events (browsing is public; registering needs a logged-in user)
router.get("/events", validate(listEventsQuery, "query"), events.listEvents);
router.get("/events/categories", events.listCategories);
router.get("/events/:id", optionalAuth, events.getEvent);
router.post("/events/:id/register", requireAuth, requireRole("USER"), events.register);

// The logged-in user's registrations
router.get("/registrations/me", requireAuth, validate(registrationsQuery, "query"), registrations.myRegistrations);
router.patch("/registrations/:id/cancel", requireAuth, registrations.cancel);

// Admin
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));
adminRouter.get("/stats", admin.stats);
adminRouter.get("/events", validate(adminListEventsQuery, "query"), admin.listEvents);
adminRouter.post("/events", validate(createEventSchema), admin.createEvent);
adminRouter.get("/events/:id", admin.getEvent);
adminRouter.put("/events/:id", validate(updateEventSchema), admin.updateEvent);
adminRouter.patch("/events/:id/status", validate(statusSchema), admin.setStatus);
adminRouter.delete("/events/:id", admin.deleteEvent);
adminRouter.get("/events/:id/registrations", validate(registrationsQuery, "query"), admin.eventRegistrations);
router.use("/admin", adminRouter);
