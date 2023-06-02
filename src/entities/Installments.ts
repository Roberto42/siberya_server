import { model, Schema } from "mongoose";

const InstallmentsSchema = new Schema({
  order:{
    type: Schema.Types.ObjectId,
    ref: 'orders',
    require: true,
  },
  checkout:{
    type: Schema.Types.ObjectId,
    ref: 'checkout',
    require: true,
  },
  quota:{
    type: Number,
    default: 1,
  },
  quota_amount:{
    type: Number,
    default: 0,
  },
  created_at:{
    type: Date,
    default: Date.now,
  },
  expires: {
    type: Date,
  },
  paid:{
    type: String,
    enum: ['OK','NO'],
    default: 'NO',
  },
  user:{
    type: Schema.Types.ObjectId,
    ref: 'users',
    require: true,
  },
});

const Installments = model('installments', InstallmentsSchema);

export default Installments;