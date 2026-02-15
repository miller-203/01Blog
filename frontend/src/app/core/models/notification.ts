export interface Notification {
  id: number;
  actorId: string;
  actorFirstName: string;
  actorLastName: string;
  actorAvatar?: string;
  type: string;
  postId?: string;
  commentId?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
