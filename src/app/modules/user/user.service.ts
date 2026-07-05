import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Sale } from '../sales/sales.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = payload.role || USER_ROLES.EMPLOYEE;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const createStaffToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.role || ![USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE].includes(payload.role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid staff role provided!');
  }

  const isExist = await User.findOne({ email: payload.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
  }

  // Pre-verify staff accounts so they can log in immediately
  payload.verified = true;
  payload.status = 'active';

  const createStaff = await User.create(payload);
  if (!createStaff) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create staff account');
  }

  return createStaff;
};

const getUsersStatsFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find({ status: 'active' }), query)
    .search(['name', 'email', 'role', 'contact', 'location'])
    .filter()
    .sort()
    .paginate();

  const users = await userQuery.modelQuery;
  const pagination = await userQuery.getPaginationInfo();

  const userIds = users.map((u: any) => u._id);
  const salesStatsList = await Sale.aggregate([
    { $match: { seller: { $in: userIds } } },
    {
      $group: {
        _id: '$seller',
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$grandTotal' },
      },
    },
  ]);

  const statsMap = new Map(
    salesStatsList.map((s) => [s._id.toString(), s])
  );

  const data = users.map((user: any) => {
    const stats = statsMap.get(user._id.toString()) || {
      totalSales: 0,
      totalRevenue: 0,
    };
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      location: user.location,
      image: user.image,
      status: user.status,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalSales: stats.totalSales,
      totalRevenue: stats.totalRevenue,
    };
  });

  return {
    pagination,
    data,
  };
};

export const UserService = {
  createUserToDB,
  createStaffToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getUsersStatsFromDB,
};
