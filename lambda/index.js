const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");
const sharp = require("sharp");

const s3 = new S3Client({});

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " "),
  );

  const ext = path.extname(key);
  const baseName = path.basename(key, ext);
  const dirName = "uploads";

  const outputKey = `${dirName}/${baseName}200x200${ext}`;

  try {
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(getCommand);
    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const inputBuffer = await streamToBuffer(response.Body);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: outputKey,
        Body: inputBuffer,
        ContentType: "image/webp",
      }),
    );

    console.log(`Successfully optimized ${key} and saved to ${outputKey}`);

    return { status: "success", file: outputKey };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};
