import { model, Schema } from "mongoose";

const PaymentConditionsSchema = new Schema({
  conditions:{
    type: String,
    enum: ['CASH','DEBIT','CREDIT','INSTALLMENTS'],
    default: 'CASH',
  },
  created_at:{
    type: Date,
    default: Date.now,
    select: false,
  },
  updated_at:{
    type: Date,
    default: Date.now,
    select: false,
  },
  deleted:{
    type: Boolean,
    require: true,
    default: false,
    select: false,
  },
  user:{
    type: Schema.Types.ObjectId,
    ref: 'users',
    require: true,
    select: false,
  }
});

const PaymentConditions = model('paymentConditions', PaymentConditionsSchema);

export default PaymentConditions;