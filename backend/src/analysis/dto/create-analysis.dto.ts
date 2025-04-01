import { IsBoolean, IsOptional, IsString } from 'class-validator';

class SectionDTO {
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  boundingBox?: { x: number; y: number }[];
}

export class CreateAnalysisDTO {
  @IsString()
  userId: string;

  @IsString()
  image: string;

  @IsOptional()
  기본계약정보?: Record<string, SectionDTO>;

  @IsOptional()
  보증금및월세조건?: Record<string, SectionDTO>;

  @IsOptional()
  관리비및공과금부담명확화?: Record<string, SectionDTO>;

  @IsOptional()
  시설및수리책임조항?: Record<string, SectionDTO>;

  @IsOptional()
  전세계약시추가확인사항?: Record<string, SectionDTO>;

  @IsOptional()
  반전세계약시추가확인사항?: Record<string, SectionDTO>;

  @IsOptional()
  계약해지및갱신조건명시?: Record<string, SectionDTO>;

  @IsOptional()
  특약사항명시?: Record<string, SectionDTO>;

  @IsOptional()
  위험요인?: string;

  @IsOptional()
  누락요소?: string;

  @IsOptional()
  법률단어?: string;
}
