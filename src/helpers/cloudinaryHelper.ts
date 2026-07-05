import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import config from '../config';

// Configure Cloudinary
if (config.cloudinary.cloud_name && config.cloudinary.api_key && config.cloudinary.api_secret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });
}

export const uploadToCloudinary = async (
  filePath: string,
  folderName: string
): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: `mini-erp/${folderName}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};
