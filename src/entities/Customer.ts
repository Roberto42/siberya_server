import { model, Schema } from "mongoose";

export const Customer = model('customers', new Schema({
  type:{
    type: String,
    required: true,
    enum: ['FISICA', 'JURIDICA'],
    default:'FISICA'
  },
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
  },
  phone:{
    type: String,
  },
  address:{
    type: String,
    required: true,
  },
  number:{
    type: String,
  },
  district:{
    type: String,
  },
  complement:{
    type: String,
  },
  city:{
    type: String,
  },
  state:{
    type: String,
  },
  zipcode:{
    type: String,
  },
  deleted:{
    type: Boolean,
    required: true,
    default: false,
    select: false,
  },
  active:{
    type: Boolean,
    required: true,
    default: true,
  },
  created_at:{
    type: Date,
    default: Date.now,
  },
  updated_at:{
    type: Date,
    default: Date.now,
  },
  user:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  }
}));