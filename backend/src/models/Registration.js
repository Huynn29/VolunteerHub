import mongoose from 'mongoose';

const { Schema } = mongoose;

export const REGISTRATION_STATUSES = ['pending', 'approved', 'cancelled', 'rejected', 'completed'];

const registrationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: { type: String, enum: REGISTRATION_STATUSES, default: 'pending', required: true },
  },
  { timestamps: true }
);

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;


