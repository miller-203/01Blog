export interface Notification {
  id: number;
  message: string;
  postId: number; // or 'post' object depending on your backend JSON
  senderUsername: string; // convenient to have
  isRead: boolean;
  createdAt: string;
}