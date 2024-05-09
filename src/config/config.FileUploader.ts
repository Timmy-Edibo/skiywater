import dontenv from 'dotenv';
import { S3Client } from "@aws-sdk/client-s3";


dontenv.config()

const accessKey = process.env.AWS_ACCESS_KEY_ID || "";
const secretKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const region = process.env.AWS_REGION || "";

// Define the configuration object
const s3Config = {
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  region: region,
};

export const s3Client = new S3Client(s3Config);
export const bucketName = process.env.AWS_BUCKET_NAME || "";


