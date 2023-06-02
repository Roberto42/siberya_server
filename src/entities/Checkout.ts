import { model, Schema } from "mongoose";

const CheckoutSchema = new Schema({
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
  installments:[{
    type: Schema.Types.ObjectId,
    ref: 'installments',
  }],
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

const Checkout = model('checkout', CheckoutSchema);

export default Checkout; 