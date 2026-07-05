import { z } from 'zod';
import { withBody, zodString } from '../../../shared/zodValidators';

const createProductSchema = withBody({
  name: zodString('Product Name'),
  sku: zodString('SKU'),
  category: zodString('Category'),
  purchasePrice: z.coerce
    .number({ required_error: 'Purchase Price is required' })
    .positive('Purchase Price must be positive'),
  sellingPrice: z.coerce
    .number({ required_error: 'Selling Price is required' })
    .positive('Selling Price must be positive'),
  stockQuantity: z.coerce
    .number({ required_error: 'Stock Quantity is required' })
    .int('Stock Quantity must be an integer')
    .nonnegative('Stock Quantity must be non-negative'),
  image: z.string().optional(),
});

const updateProductSchema = z.object({
  body: z.object({
    name: zodString('Product Name').optional(),
    sku: zodString('SKU').optional(),
    category: zodString('Category').optional(),
    purchasePrice: z.coerce
      .number()
      .positive('Purchase Price must be positive')
      .optional(),
    sellingPrice: z.coerce
      .number()
      .positive('Selling Price must be positive')
      .optional(),
    stockQuantity: z.coerce
      .number()
      .int('Stock Quantity must be an integer')
      .nonnegative('Stock Quantity must be non-negative')
      .optional(),
    image: z.string().optional(),
  }),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
};
