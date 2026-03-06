export type OutputFormat = 'webp' | 'png' | 'jpg' | 'avif' | 'bmp';

export interface TransformConfig {
  width: number;
  height: number;
  lockAspect: boolean;
  format: OutputFormat;
  quality: number;
}

export type FileStatus = 'pending' | 'processing' | 'done' | 'error';

export interface ProcessingFile {
  id: string;
  file: File;
  thumbnail: string;
  status: FileStatus;
  progress: number;
  resultUrl?: string;
  resultSize?: number;
  error?: string;
}
