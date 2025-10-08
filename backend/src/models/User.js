import mongoose from 'mongoose';

const { Schema } = mongoose;

export const USER_ROLES = ['volunteer', 'manager', 'admin'];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: USER_ROLES, default: 'volunteer', required: true },
    isLocked: { type: Boolean, default: false },
    managerPending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;


