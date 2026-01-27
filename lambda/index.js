const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");
const sharp = require("sharp");

const s3 = new S3Client({});

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

exports.handler = async (event) => {
  const record = event.Records?.[0];
  if (!record) return;

  const bucket = record.s3.bucket.name;

  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

  // Safety: process only temp-uploads
  if (!key.startsWith("temp-uploads/")) return;

  const ext = path.extname(key);
  const baseName = path.basename(key, ext);
  const dirName = "uploads";

  try {
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const getResponse = await s3.send(getCommand);
    const inputBuffer = await streamToBuffer(getResponse.Body);

    const uploadedFiles = await Promise.all(
      [400, 600, 800].map(async (i) => {
        const outputKey = `${dirName}/${baseName}-${i}w${ext}`;
        const optimizedBuffer = await sharp(inputBuffer)
          .resize(i)
          .webp({ quality: 80 })
          .toBuffer();

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: outputKey,
            Body: optimizedBuffer,
            ContentType: "image/webp",
          }),
        );

        return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${outputKey}`;
      }),
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: event.Records[0].s3.object.key,
      }),
    );

    return { status: "success", files: uploadedFiles };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};
