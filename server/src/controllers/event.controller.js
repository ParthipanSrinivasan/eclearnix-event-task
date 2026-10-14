import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { registerForEvent } from "../services/registration.service.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex, paginate, searchFilter } from "../utils/query.js";

/** Events users can browse: ACTIVE and not yet started. */
function availableFilter() {
  return { status: "ACTIVE", dateTime: { $gt: new Date() } };
}

export async function listEvents(req, res) {
  const { search, category, from, to, page, limit } = req.validQuery;
  const filter = { ...availableFilter(), ...searchFilter(search, ["name", "description", "location"]) };

  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (from) filter.dateTime.$gte = from;
  if (to) {
    // "to" is a calendar day: include the whole day.
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    filter.dateTime.$lte = end;
  }

  res.json(await paginate(Event, filter, { page, limit, sort: { dateTime: 1, _id: 1 } }));
}

export async function listCategories(_req, res) {
  const categories = await Event.distinct("category", availableFilter());
  res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
}

export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id);
  // Disabled events are hidden from everyone except admins.
  if (!event || (event.status !== "ACTIVE" && req.user?.role !== "ADMIN")) {
    throw ApiError.notFound("Event not found");
  }

  const myRegistration = req.user
    ? await Registration.findOne({ user: req.user.id, event: event.id })
    : null;
  res.json({ event, myRegistration });
}

export async function register(req, res) {
  const registration = await registerForEvent(req.user.id, req.params.id);
  await registration.populate("event");
  res.status(201).json({ message: "You're registered!", registration });
}
