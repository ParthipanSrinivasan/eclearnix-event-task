import mongoose from "mongoose";

export const REGISTRATION_STATUSES = ["REGISTERED", "CANCELLED"];

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    status: { type: String, enum: REGISTRATION_STATUSES, default: "REGISTERED" },
    registeredAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  },
);

// One registration document per user per event: re-registering after a
// cancellation reactivates it. The database enforces "no double registration"
// even when two requests arrive at the same moment.
registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });

export const Registration = mongoose.model("Registration", registrationSchema);
