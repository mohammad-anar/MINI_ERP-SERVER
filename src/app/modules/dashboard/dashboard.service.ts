import { Product } from '../product/product.model';
import { Sale } from '../sales/sales.model';

const getDashboardStatsFromDB = async () => {
  const totalProducts = await Product.countDocuments();
  const totalSales = await Sale.countDocuments();
  const lowStockProducts = await Product.countDocuments({
    stockQuantity: { $lt: 5 },
  });

  return {
    totalProducts,
    totalSales,
    lowStockProducts,
  };
};

export const DashboardService = {
  getDashboardStatsFromDB,
};
