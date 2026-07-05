import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Product } from '../product/product.model';
import { ISale, ISaleProduct } from './sales.interface';
import { Sale } from './sales.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { notificationHelper } from '../../../helpers/notificationHelper';

const createSaleInDB = async (
  sellerId: string,
  payload: { products: { product: string; quantity: number }[] }
): Promise<ISale> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const saleProducts: ISaleProduct[] = [];
    let grandTotal = 0;
    const lowStockProducts: { id: Types.ObjectId; name: string; qty: number }[] = [];

    for (const item of payload.products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Product not found!`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Insufficient stock for product: ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        );
      }

      // Reduce stock
      product.stockQuantity -= item.quantity;
      await product.save({ session });

      if (product.stockQuantity < 5) {
        lowStockProducts.push({
          id: product._id,
          name: product.name,
          qty: product.stockQuantity,
        });
      }

      const unitPrice = product.sellingPrice;
      saleProducts.push({
        product: new Types.ObjectId(item.product),
        quantity: item.quantity,
        unitPrice,
      });

      grandTotal += unitPrice * item.quantity;
    }

    const saleData = {
      products: saleProducts,
      grandTotal,
      seller: new Types.ObjectId(sellerId),
      saleDate: new Date(),
    };

    const [createdSale] = await Sale.create([saleData], { session });

    await session.commitTransaction();
    session.endSession();

    // Notify Low Stock Alert (Admins and Managers)
    try {
      if (lowStockProducts.length > 0) {
        const staff = await User.find({
          role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER] },
        });
        for (const user of staff) {
          for (const item of lowStockProducts) {
            await notificationHelper.send({
              userId: user._id,
              type: 'ADMIN_ALERT',
              title: 'Product Low Stock Alert',
              message: `Product "${item.name}" is low on stock. Current quantity: ${item.qty}.`,
              relatedId: item.id,
              relatedType: 'Product',
            });
          }
        }
      }
    } catch (e) {
      // Log/ignore notification fail
    }

    // Notify Sale Creation (Admins only)
    try {
      const admins = await User.find({
        role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
      });
      for (const admin of admins) {
        await notificationHelper.send({
          userId: admin._id,
          type: 'SALE',
          title: 'New Sale Generated',
          message: `A new sale #${createdSale._id} of ${saleProducts.length} items was generated. Total: $${grandTotal.toFixed(2)}.`,
          relatedId: createdSale._id,
          relatedType: 'Sale',
        });
      }
    } catch (e) {
      // Log/ignore notification fail
    }

    return createdSale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getSaleHistoryFromDB = async () => {
  const result = await Sale.find()
    .populate('products.product')
    .populate('seller', 'name email role')
    .sort({ createdAt: -1 });
  return result;
};

export const SalesService = {
  createSaleInDB,
  getSaleHistoryFromDB,
};
