// user-info.dto.ts

export class GenderDto {
    id: number;
    name: string;
}

export class InterestDto {
  id: number;
  name: string;
}

  
  export class UserInfoDto {
    email: string;
    gender: GenderDto;             // Using GenderDto as the structure for the gender object
    interests: InterestDto[];              // Interests could be a list of objects, you can refine this type based on actual data structure
    selectedInterests: number[];   // List of selected interest ids (numbers)
  }
  
  export class UserSocketDto {
    userInfo: UserInfoDto;
    socketId: string;
  }
  