import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { uploadToCloudinary } from '../../helpers/cloudinaryHelper';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === 'image') {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg file supported'
          )
        );
      }
    } else if (file.fieldname === 'media') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 3 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
  ]);

  return async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      const isCloudinaryConfigured =
        config.cloudinary.cloud_name &&
        config.cloudinary.api_key &&
        config.cloudinary.api_secret;

      if (req.files && isCloudinaryConfigured) {
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        try {
          for (const fieldname of Object.keys(filesMap)) {
            const files = filesMap[fieldname];
            for (const file of files) {
              const result = await uploadToCloudinary(file.path, fieldname);
              if (result) {
                (file as any).cloudinaryUrl = result.secure_url;
              }
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            }
          }
        } catch (uploadErr) {
          // Cleanup any temp files on error
          for (const fieldname of Object.keys(filesMap)) {
            const files = filesMap[fieldname];
            for (const file of files) {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            }
          }
          return next(uploadErr);
        }
      }

      next();
    });
  };
};

export default fileUploadHandler;
