import mongoose from 'mongoose';
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  squareAccessToken: { type: String },
  squareRefreshToken: { type: String },
  squareTokenExpiry: { type: Date }
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email"});

export default mongoose.model('User', userSchema);
