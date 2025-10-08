import mongoose from 'mongoose';

const { Schema } = mongoose;

export const EVENT_STATUSES = ['draft', 'published', 'completed', 'cancelled'];

const eventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: false, trim: true, default: 'general' },
    status: { type: String, enum: EVENT_STATUSES, default: 'draft', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;


