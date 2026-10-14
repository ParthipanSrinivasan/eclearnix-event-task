import mongoose from "mongoose";

export const EVENT_STATUSES = ["ACTIVE", "DISABLED"];

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    dateTime: { type: Date, required: true },
    maxParticipants: { type: Number, required: true, min: 1 },
    // Kept in step with active registrations by atomic $inc updates, so the
    // capacity check and the seat reservation happen in one database operation.
    registeredCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: EVENT_STATUSES, default: "ACTIVE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

eventSchema.virtual("seatsLeft").get(function seatsLeft() {
  return Math.max(this.maxParticipants - this.registeredCount, 0);
});

eventSchema.virtual("isFull").get(function isFull() {
  return this.registeredCount >= this.maxParticipants;
});

eventSchema.virtual("isPast").get(function isPast() {
  return this.dateTime <= new Date();
});

eventSchema.index({ status: 1, dateTime: 1 });
eventSchema.index({ category: 1 });

export const Event = mongoose.model("Event", eventSchema);
