// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface IPaginationOptions {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ─────────────────────────────────────────────────────────────────────────────
// Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises raw query params into validated, typed pagination values.
 * Safe defaults: page=1, limit=10, sortBy=createdAt, sortOrder=desc.
 *
 * @example
 * const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculate(req.query);
 * const results = await Model.find({}).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);
 */
const calculate = (options: IPaginationOptions): IPaginationResult => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder: 'asc' | 'desc' =
    options.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

/**
 * Builds the standard pagination metadata object for API responses.
 */
const buildMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPage: Math.ceil(total / limit),
});

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const paginationHelper = { calculate, buildMeta };
