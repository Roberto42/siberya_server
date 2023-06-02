import { model, Schema } from "mongoose";

const OrderSchema = new Schema({
  customer:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'customers',
  },
  equipement:{
    type: String,    
  },
  model:{
    type: String,
  },
  serial:{
    type: String,
  },
  accessories:{
    type: String,
  },
  situation:{
    type: String,
  },
  damage:{
    type: String,
  },
  items:[{
    type: Schema.Types.ObjectId,
    ref: 'items',
  }],  
  amount:{
    type: Number,
    require: true,
    default: 0,
  },
  checkout:{
    type: Schema.Types.ObjectId,
    ref: 'checkout',
  },
  completed: {
    type: Boolean,
    default: false,
    require: true,
  },
  created_at:{
    type: Date,
    default: Date.now,
  },
  updated_at:{
    type: Date,
    default: Date.now,
  },
  deleted:{
    type: Boolean,
    required: true,
    default: false,
    select: false,
  },
  status:{
    type: String,
    enum: ['OPENED','WAITING','REPROVED','APROVED'],
    default: 'OPENED',
  },
  user:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  }
});

const Order = model('orders', OrderSchema);

export default Order;