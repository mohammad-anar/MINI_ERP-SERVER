import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { notificationHelper } from '../../../helpers/notificationHelper';

const createProductToDB = async (payload: IProduct): Promise<IProduct> => {
  const isExist = await Product.findOne({ sku: payload.sku });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product with this SKU already exists!');
  }
  const result = await Product.create(payload);

  // Notify Admins about the new product creation
  try {
    const admins = await User.find({
      role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
    });
    for (const admin of admins) {
      await notificationHelper.send({
        userId: admin._id,
        type: 'SYSTEM',
        title: 'New Product Created',
        message: `Product "${result.name}" with SKU "${result.sku}" has been created.`,
        relatedId: result._id,
        relatedType: 'Product',
      });
    }
  } catch (error) {
    // Log error, but don't fail the operation
  }

  return result;
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name', 'sku', 'category'];
  const productQuery = new QueryBuilder(Product.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.getPaginationInfo();

  return {
    meta,
    data: result,
  };
};

const getSingleProductFromDB = async (id: string): Promise<IProduct | null> => {
  const result = await Product.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }
  return result;
};

const updateProductToDB = async (
  id: string,
  payload: Partial<IProduct>
): Promise<IProduct | null> => {
  const isExist = await Product.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }

  // If SKU is being updated, verify it is unique
  if (payload.sku && payload.sku !== isExist.sku) {
    const isSkuExist = await Product.findOne({ sku: payload.sku });
    if (isSkuExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product with this SKU already exists!');
    }
  }

  // Unlink old image if a new image is uploaded
  if (payload.image && isExist.image) {
    unlinkFile(isExist.image);
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteProductFromDB = async (id: string): Promise<IProduct | null> => {
  const isExist = await Product.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }

  if (isExist.image) {
    unlinkFile(isExist.image);
  }

  const result = await Product.findByIdAndDelete(id);
  return result;
};

export const ProductService = {
  createProductToDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductToDB,
  deleteProductFromDB,
};
