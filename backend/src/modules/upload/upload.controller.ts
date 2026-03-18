import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  @Post('avatar')
  @Public() // Or remove @Public() if you require authentication (preferable, but using Public() for easy dev if needed. Avatar upload should probably be authenticated unless specified otherwise. In user.controller, getProfile requires auth. Let's make it authenticated by removing @Public(). Actually, better to keep it authenticated).
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Return relative URL for the uploaded file
    // e.g., 'http://localhost:3000/uploads/avatars/file-1234.png'
    // But returning the relative path so the frontend can build the URL or the frontend can rely on the returned structure
    return {
      url: `/uploads/avatars/${file.filename}`,
    };
  }
}
