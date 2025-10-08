import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: false },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    comments: { type: [commentSchema], default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;


