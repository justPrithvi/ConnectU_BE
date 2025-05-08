import { IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  id: string;

  @IsString()
  to: string;

  @IsString()
  from: string;

  @IsString()
  text: string;
}
