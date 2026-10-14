import { Registration } from "../models/Registration.js";
import { cancelRegistration } from "../services/registration.service.js";

export async function myRegistrations(req, res) {
  const filter = { user: req.user.id };
  if (req.validQuery.status) filter.status = req.validQuery.status;

  const registrations = await Registration.find(filter).populate("event").sort({ registeredAt: -1 });
  // An event deleted by an admin leaves nothing to show.
  res.json({ registrations: registrations.filter((r) => r.event) });
}

export async function cancel(req, res) {
  const registration = await cancelRegistration(req.user.id, req.params.id);
  res.json({ message: "Registration cancelled", registration });
}
