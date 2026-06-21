export interface IFileStorageService {
  save(buffer: Buffer, mimeType: string): Promise<string>;
  delete(filename: string): Promise<void>;
  getAbsolutePath(filename: string): string;
  exists(filename: string): Promise<boolean>;
}
