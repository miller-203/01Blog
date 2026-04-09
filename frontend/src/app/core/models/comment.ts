export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  owner: boolean;
  canDelete?: boolean;
  postId: string;
  createdAt: string;
  liked?: boolean;
  likesCount?: number;
  showMenu?: boolean;
}

export interface CommentRequest {
  content: string;
}

export interface CommentLikeRequest {
  commentId: string;
}

export interface CommentLikeResponse {
  liked: boolean;
  likesCount: number;
}
