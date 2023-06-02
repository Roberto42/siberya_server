import { model, Schema } from "mongoose";

const CashSchema = new Schema({
  order:{
    type: Schema.Types.ObjectId,
    ref: 'ordes',
    require: true,
  },
  payment_condition:{
    type: Schema.Types.ObjectId,
    ref: 'paymentConditions',
    require: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    default: 0,
  },
  created_at:{
    type: Date,
    default: Date.now,
  },
  user:{
    type: Schema.Types.ObjectId,
    ref: 'users',
    require: true,
  },
});

const Cash = model('checkout', CashSchema);

export default Cash; 