import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SalesService } from './sales.service';

const createSale = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await SalesService.createSaleInDB(sellerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Sale created successfully',
    data: result,
  });
});

const getSaleHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await SalesService.getSaleHistoryFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sales history retrieved successfully',
    data: result,
  });
});

export const SalesController = {
  createSale,
  getSaleHistory,
};
