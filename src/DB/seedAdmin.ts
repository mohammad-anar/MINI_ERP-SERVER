import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

/**
 * Seeds the Super Admin account on server startup.
 *
 * Credentials are sourced entirely from environment variables:
 *   SUPER_ADMIN_NAME     (default: SuperAdmin)
 *   SUPER_ADMIN_EMAIL    (default: admin@gmail.com)
 *   SUPER_ADMIN_PASSWORD (default: 12345678)
 *
 * The function is idempotent — it only creates the account if no
 * Super Admin with the configured email already exists.
 */
export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const isExisting = await User.findOne({
      email: config.super_admin.email,
      role: USER_ROLES.SUPER_ADMIN,
    });

    if (isExisting) {
      logger.info(
        colors.cyan('ℹ️  Super Admin already exists — seed skipped.')
      );
      return;
    }

    await User.create({
      name: config.super_admin.name,
      email: config.super_admin.email,
      password: config.super_admin.password,
      role: USER_ROLES.SUPER_ADMIN,
      verified: true,
      status: 'active',
    });

    logger.info(
      colors.green(
        `✨ Super Admin seeded — email: ${config.super_admin.email}`
      )
    );
  } catch (error) {
    logger.error(colors.red('❌ Super Admin seed failed:'));
    logger.error(error);
  }
};
