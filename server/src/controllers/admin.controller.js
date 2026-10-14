import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate, searchFilter } from "../utils/query.js";

async function findEventOr404(id) {
  const event = mongoose.isValidObjectId(id) ? await Event.findById(id) : null;
  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

export async function stats(_req, res) {
  const now = new Date();
  const [totalEvents, activeEvents, upcomingEvents, totalRegistrations, totalUsers] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: "ACTIVE" }),
    Event.countDocuments({ status: "ACTIVE", dateTime: { $gt: now } }),
    Registration.countDocuments({ status: "REGISTERED" }),
    User.countDocuments({ role: "USER" }),
  ]);
  res.json({ totalEvents, activeEvents, upcomingEvents, totalRegistrations, totalUsers });
}

export async function listEvents(req, res) {
  const { search, status, page, limit } = req.validQuery;
  const filter = searchFilter(search, ["name", "category", "location"]);
  if (status) filter.status = status;
  res.json(await paginate(Event, filter, { page, limit, sort: { dateTime: -1, _id: -1 } }));
}

export async function getEvent(req, res) {
  res.json({ event: await findEventOr404(req.params.id) });
}

export async function createEvent(req, res) {
  const event = await Event.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ message: "Event created", event });
}

export async function updateEvent(req, res) {
  await findEventOr404(req.params.id);
  const changes = req.body;

  // Capacity can't drop below the seats already taken; checked in the same atomic update.
  const filter = { _id: req.params.id };
  if (changes.maxParticipants !== undefined) filter.registeredCount = { $lte: changes.maxParticipants };

  const event = await Event.findOneAndUpdate(filter, changes, { returnDocument: "after", runValidators: true });
  if (!event) {
    const current = await Event.findById(req.params.id);
    throw ApiError.badRequest("Please check the highlighted fields", {
      maxParticipants: `${current?.registeredCount ?? 0} people are already registered. Capacity can't be lower than that.`,
    });
  }
  res.json({ message: "Event updated", event });
}

export async function setStatus(req, res) {
  await findEventOr404(req.params.id);
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: "after" },
  );
  res.json({ message: event.status === "ACTIVE" ? "Event enabled" : "Event disabled", event });
}

export async function deleteEvent(req, res) {
  const event = await findEventOr404(req.params.id);
  await Registration.deleteMany({ event: event.id });
  await event.deleteOne();
  res.json({ message: "Event deleted" });
}

export async function eventRegistrations(req, res) {
  const event = await findEventOr404(req.params.id);
  const filter = { event: event.id };
  if (req.validQuery.status) filter.status = req.validQuery.status;

  const registrations = await Registration.find(filter)
    .populate("user", "name email")
    .sort({ registeredAt: -1 });
  res.json({ event, registrations });
}
