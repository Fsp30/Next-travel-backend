export interface PrismaUserDTO {
  id: string;
  email: string;
  name: string;
  google_id: string;          
  profile_picture: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}