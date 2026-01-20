import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from "express";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post("/generate-signed-url", async (req, res) => {
  const { name, type } = req.body;

  const fileKey = `temp-uploads/${Date.now()}-${name}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: type,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 10,
    });

    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ signedUrl, publicUrl });
  } catch (error) {
    console.log("s3Error", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

export const S3Route = router;
