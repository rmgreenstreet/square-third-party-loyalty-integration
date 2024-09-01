import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  squareAccessToken: { type: String },
  squareRefreshToken: { type: String },
  squareTokenExpiry: { type: Date }
});

export default mongoose.model('User', userSchema);
