import cloudinary from "../../config/cloudinary";
import { FileData, FileStorage } from "../types/storage";

export class CloudinaryStorage implements FileStorage {
  constructor() {
    // No need to reconfigure here since it's already done in cloudinary.ts
  }

  async upload(data: FileData): Promise<string> {
    const { fileData, filename } = data;

    const buffer = Buffer.from(fileData);

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: filename, // Use the filename as the public ID in Cloudinary
        },
        (err, result) => {
          if (err) {
            reject(new Error(`Upload to Cloudinary failed: ${err.message}`));
          } else {
            resolve(result?.secure_url || ""); // Resolve with the secure_url or an empty string
          }
        },
      );
      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    });
  }

  // Delete a file from Cloudinary
  async delete(publicId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) {
          reject(new Error(`Delete from Cloudinary failed: ${err}`));
        } else {
          resolve(); // Successfully deleted
        }
      });
    });
  }

  // Get the URI of a file stored in Cloudinary
  getObjectUri(): string {
    throw new Error("Method not implemented.");
  }
}
