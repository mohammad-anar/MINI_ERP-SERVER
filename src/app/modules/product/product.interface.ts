import { Model } from 'mongoose';

export type IProduct = {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: string; // Product Image
};

export type ProductModel = Model<IProduct>;
