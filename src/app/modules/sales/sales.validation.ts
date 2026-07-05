import { z } from 'zod';
import { withBody, zodObjectId } from '../../../shared/zodValidators';

const createSaleSchema = withBody({
  products: z.array(
    z.object({
      product: zodObjectId('Product ID'),
      quantity: z.number({ required_error: 'Quantity is required' })
        .int('Quantity must be an integer')
        .positive('Quantity must be positive'),
    })
  ).nonempty('At least one product is required for sale'),
});

export const SalesValidation = {
  createSaleSchema,
};
