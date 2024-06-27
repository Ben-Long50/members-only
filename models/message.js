import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
});

export default mongoose.model('Message', MessageSchema);
