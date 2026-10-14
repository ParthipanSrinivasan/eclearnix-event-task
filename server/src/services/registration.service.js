import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Registers a user for an event, following the validation flow:
 * authenticated (checked by middleware) → event exists → event is ACTIVE →
 * event has not started → not already registered → seats available → create.
 *
 * The explicit checks give clear error messages. The seat itself is then
 * reserved with one conditional, atomic update, so two users racing for the
 * last seat can never both get it.
 */
export async function registerForEvent(userId, eventId) {
  if (!mongoose.isValidObjectId(eventId)) throw ApiError.notFound("Event not found");

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");
  if (event.status !== "ACTIVE") throw ApiError.badRequest("This event is not open for registration");

  const now = new Date();
  if (event.dateTime <= now) throw ApiError.badRequest("This event has already started or ended");

  const existing = await Registration.exists({ user: userId, event: eventId, status: "REGISTERED" });
  if (existing) throw ApiError.conflict("You are already registered for this event");

  if (event.registeredCount >= event.maxParticipants) throw ApiError.conflict("Sorry, this event is full");

  const reserved = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: "ACTIVE",
      dateTime: { $gt: now },
      $expr: { $lt: ["$registeredCount", "$maxParticipants"] },
    },
    { $inc: { registeredCount: 1 } },
    { returnDocument: "after" },
  );
  // Something changed since the checks above; the most likely cause is the last seat going.
  if (!reserved) throw ApiError.conflict("Sorry, this event just filled up");

  try {
    // Re-registering after a cancellation reactivates the earlier record.
    const reactivated = await Registration.findOneAndUpdate(
      { user: userId, event: eventId, status: "CANCELLED" },
      { status: "REGISTERED", registeredAt: now, cancelledAt: null },
      { returnDocument: "after" },
    );
    return reactivated ?? (await Registration.create({ user: userId, event: eventId }));
  } catch (err) {
    // Give the seat back if the registration could not be saved.
    await Event.updateOne({ _id: eventId, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
    if (err?.code === 11000) throw ApiError.conflict("You are already registered for this event");
    throw err;
  }
}

/** Cancels a user's own registration, allowed until the event starts. */
export async function cancelRegistration(userId, registrationId) {
  if (!mongoose.isValidObjectId(registrationId)) throw ApiError.notFound("Registration not found");

  const registration = await Registration.findOne({ _id: registrationId, user: userId }).populate("event");
  if (!registration) throw ApiError.notFound("Registration not found");
  if (registration.status === "CANCELLED") throw ApiError.badRequest("This registration is already cancelled");
  if (registration.event && registration.event.dateTime <= new Date()) {
    throw ApiError.badRequest("Registrations cannot be cancelled after the event has started");
  }

  // Conditional update: a double-click cannot free the same seat twice.
  const cancelled = await Registration.findOneAndUpdate(
    { _id: registrationId, status: "REGISTERED" },
    { status: "CANCELLED", cancelledAt: new Date() },
    { returnDocument: "after" },
  ).populate("event");
  if (!cancelled) throw ApiError.badRequest("This registration is already cancelled");

  await Event.updateOne(
    { _id: registration.event?._id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
  );
  return Registration.findById(cancelled.id).populate("event");
}
