import { Schema, model } from 'mongoose';
import { ISale, SaleModel } from './sales.interface';

const saleProductSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const saleSchema = new Schema<ISale, SaleModel>(
  {
    products: {
      type: [saleProductSchema],
      required: true,
      validate: {
        validator: (v: unknown) => Array.isArray(v) && v.length > 0,
        message: 'A sale must have at least one product.',
      },
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Sale = model<ISale, SaleModel>('Sale', saleSchema);
