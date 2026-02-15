export interface Post {
  id: string;

  title?: string;
  content?: string;
  parsedContent?: any;

  authorName?: string;
  authorUsername?: String;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatar?: string;
  authorImage?: string;
  authorId?: string;

  createdAt?: string;

  likesCount?: number;
  commentsCount?: number;
  savesCount?: number;
  reportsCount?: number;

  liked?: boolean;
  saved?: boolean;
  hidden?: boolean;
}
