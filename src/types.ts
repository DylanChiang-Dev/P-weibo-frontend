export interface User {
  id: number;
  email: string;
  displayName?: string;
  avatar?: string;
  created_at?: string;
  role?: 'admin' | 'user';
  stats?: {
    posts: number;
  };
}

export interface PostImage {
  id: number;
  file_path: string;
  width: number;
  height: number;
}

export interface PostVideo {
  id: number;
  file_path: string;
  duration?: number | null;
  thumbnail_path?: string | null;
}

export interface Post {
  id: number;
  content: string;
  created_at: string;
  author: {
    id: number;
    email: string;
    displayName?: string;
    avatar?: string;
  };
  images: PostImage[];
  videos: PostVideo[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_pinned?: boolean;
  visibility?: 'public' | 'private';
}

export interface AuthResponse {
  access_token: string;
  access_expires_in: number;
  refresh_token: string;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: {
    id: number;
    email: string;
    displayName?: string;
    avatar?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedList<T> {
  items: T[];
  next_cursor: string | null;
}
