export interface FileData {
  filename: string;
  fileData: ArrayBuffer;
}

export interface FileStorage {
  upload(data: FileData): Promise<string>;
  delete(publicId: string): Promise<void>;
  getObjectUri(filename: string): string;
}
