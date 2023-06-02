import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  name:{
    type: String,
    required: true,
  },
  document:{
    type: String,
    required: true,
    unique: true,
  },
  mobile:{
    type: String,
    required: true,
    unique: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  user:{
    type: String,
    required: true,
    unique: true,
  },
  pass:{
    type: String,
    required: true,
    select: false,
  },
  avatar:{
    type: String,    
  },
  resetTokenPassword:{
    type: String,
    select: false,
  },
  resetTokenExpires:{
    type: Date,
    select: false,
  },
  created_at:{
    type: Date,
    default: Date.now,
  },
  updated_at:{
    type: Date,
    default: Date.now,
  },
  active:{
    type: Boolean,
    required: true,
    default: false,
  },
  deleted:{
    type: Boolean,
    required: true,
    default: false,
    select: false,
  },
  access:{
    type: String,
    enum: ['ADMIN','MANAGER','GUESS'],
    default: 'GUESS',
  },
});

UserSchema.pre('save', async function(next){
  const hashPassword = await bcrypt.hash(this.pass, 10);
  this.pass = hashPassword;
  next();
});

const User = model('users', UserSchema);
export default User;