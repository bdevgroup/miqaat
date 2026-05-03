import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateLocationDto {
  @IsString() name!: string;
  @IsString() city!: string;
  @IsString() country!: string;
  @IsNumber() @Min(-90) @Max(90) lat!: number;
  @IsNumber() @Min(-180) @Max(180) lng!: number;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() makeCurrent?: boolean;
}
