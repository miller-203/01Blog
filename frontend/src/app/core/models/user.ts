export interface UserRegister {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    password: string;
    avatar?: File | null;
}

export interface UserLogin {
    username: string;
    password: string;
    avatar?: File | null;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  bio: string
  role: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  currentUser: boolean;
  createdAt: string;
}
