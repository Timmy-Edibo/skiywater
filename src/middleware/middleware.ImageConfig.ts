import { Request, Response, NextFunction } from 'express';
import multer from 'multer'



const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.example'];
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExt && allowedExtensions.includes(`.${fileExt}`)) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file extension'));
    }

};


export const handleMulterErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File size limit exceeded' });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, error: 'File count limit exceeded' });
        }

        return res.status(400).json({ success: false, error: 'Multer error' });
        
    } else if (err.toString().includes("file extension")) {
        return res.status(400).json({ success: false, error: 'File  Extention not supported' });
    }
    else if (err) {
        // Other non-Multer errors
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    next(); // Pass control to the next middleware
};


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
        files: 1
    },
    fileFilter
});

export default upload;


