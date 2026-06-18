export type PostType = 'text' | 'image' | 'video' | 'link';

export type PostStatus = 'draft' | 'scheduled' | 'published';

export interface PostMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface LinkedInPost {
  id: string;
  text: string;
  type: PostType;
  mediaUrl?: string;
  mediaName?: string;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metrics?: PostMetrics;
}
