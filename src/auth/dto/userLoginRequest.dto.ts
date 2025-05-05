import { IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
export class SignupRequestDto extends LoginRequestDto{
    @IsString()
    fullName: string;
  
}