import { IsString, IsNotEmpty } from 'class-validator';

export class OcrUploadDto {
    @IsString()
    @IsNotEmpty()
    base64Image: string;
}
