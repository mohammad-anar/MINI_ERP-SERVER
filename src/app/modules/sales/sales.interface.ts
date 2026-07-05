import { Model, Types } from 'mongoose';

export type ISaleProduct = {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
};

export type ISale = {
  products: ISaleProduct[];
  grandTotal: number;
  saleDate: Date;
  seller: Types.ObjectId;
};

export type SaleModel = Model<ISale>;
