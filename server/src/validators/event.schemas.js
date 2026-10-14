import { z } from "zod";
import { EVENT_STATUSES } from "../models/Event.js";
import { REGISTRATION_STATUSES } from "../models/Registration.js";

const futureDate = z.coerce
  .date({ error: "Enter a valid date and time" })
  .refine((d) => d.getTime() > Date.now(), "Date and time must be in the future");

const eventFields = {
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  category: z.string().trim().min(2, "Category is required").max(50),
  location: z.string().trim().min(2, "Location is required").max(200),
  dateTime: futureDate,
  maxParticipants: z.coerce
    .number({ error: "Enter a number" })
    .int("Must be a whole number")
    .min(1, "At least 1 participant")
    .max(100000),
};

export const createEventSchema = z.object({
  ...eventFields,
  status: z.enum(EVENT_STATUSES).default("ACTIVE"),
});

export const updateEventSchema = z
  .object(eventFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Nothing to update");

export const statusSchema = z.object({ status: z.enum(EVENT_STATUSES) });

const optionalDate = z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional());
const optionalText = z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(100).optional());

const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};

export const listEventsQuery = z.object({
  search: optionalText,
  category: optionalText,
  from: optionalDate,
  to: optionalDate,
  ...paging,
});

export const adminListEventsQuery = z.object({
  search: optionalText,
  status: z.preprocess((v) => (v === "" ? undefined : v), z.enum(EVENT_STATUSES).optional()),
  ...paging,
});

export const registrationsQuery = z.object({
  status: z.preprocess((v) => (v === "" ? undefined : v), z.enum(REGISTRATION_STATUSES).optional()),
});
