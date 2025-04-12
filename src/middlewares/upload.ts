import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storage } from '../config/cloundinary.config';

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    },
});

const uploadSingle = (fieldName: string) => upload.single(fieldName);
const uploadMultiple = (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount);

export { uploadSingle, uploadMultiple };
