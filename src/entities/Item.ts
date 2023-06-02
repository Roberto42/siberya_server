import { model, Schema } from "mongoose";

export const Item = model('items', new Schema({
  order:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'orders',
  },
  barcode:{
    type: String,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  unitary: {
    type: Number,
    default: 0,
  },
  amount:{
    type: Number,
    default: 0,
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
    ref: 'users'
  }
}));