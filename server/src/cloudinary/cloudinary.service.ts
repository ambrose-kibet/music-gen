import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';

@Injectable()
export class CloudinaryService {
  getSignedUrl(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
    expiresInSeconds = 3600,
  ): string {
    if (resourceType === 'image') {
      return cloudinary.url(publicId, {
        resource_type: 'image',
        secure: true,
      });
    }
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'authenticated',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      secure: true,
    });
  }

  async downloadFile({
    publicId,
    resourceType,
    downloadPath,
  }: {
    publicId: string;
    resourceType: 'image' | 'video' | 'raw';
    downloadPath: string;
  }): Promise<void> {
    const url = this.getSignedUrl(publicId, resourceType);
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(downloadPath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) resolve();
      });
    });
  }
}
