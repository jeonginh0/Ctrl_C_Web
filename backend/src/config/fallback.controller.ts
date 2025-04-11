import { Controller, Get, Req, Res } from '@nestjs/common';
import { join } from 'path';
import { Request, Response } from 'express';

@Controller('*')
export class FallbackController {
    @Get()
    handleFallback(@Req() req: Request, @Res() res: Response) {
        console.log('Fallback Request:', req.path);
        const indexPath = join(__dirname, '..', '..', '..', 'frontend', 'out', 'index.html');
        res.sendFile(indexPath);
    }
}