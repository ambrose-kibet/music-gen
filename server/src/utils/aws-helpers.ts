import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getPresignedUrl = async (
  objectKey: string,
  expiresInSeconds = 3600,
  bucketName = process.env.AWS_BUCKET_NAME!,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return signedUrl;
};

export const downloadFileFromS3 = async ({
  signedUrl,
  downloadPath,
}: {
  signedUrl: string;
  downloadPath: string;
}): Promise<void> => {
  const response = await axios.get(signedUrl, {
    responseType: 'stream',
  });

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
      if (!error) {
        resolve();
      }
    });
  });
};
