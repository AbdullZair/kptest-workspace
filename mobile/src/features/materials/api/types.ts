export interface Material {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  category: string;
  projectId?: string;
  projectName?: string;
  url: string;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number; // for videos/audio in seconds
  isRead: boolean;
  readAt?: string;
  isDownloaded: boolean;
  downloadProgress: number;
  createdAt: string;
  updatedAt: string;
}

export type MaterialType =
  | 'article'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'link';

export interface MaterialListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MaterialType;
  projectId?: string;
  category?: string;
  status?: 'read' | 'unread' | 'all';
}

export interface MaterialListResponse {
  materials: Material[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  materialCount: number;
  icon?: string;
}

export interface DownloadProgress {
  materialId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}
