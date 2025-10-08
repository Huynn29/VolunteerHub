import mongoose from 'mongoose'

const { Schema } = mongoose

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    endpoint: { type: String, required: true },
    expirationTime: { type: Number },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
)

subscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true })

const Subscription = mongoose.model('Subscription', subscriptionSchema)
export default Subscription


