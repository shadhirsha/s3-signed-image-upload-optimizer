const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
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

  const outputKey = `${dirName}/${baseName}200x200.webp`;

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

    const optimizedBuffer = await sharp(inputBuffer)
      .resize(250)
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

    console.log(`Successfully optimized ${key} and saved to ${outputKey}`);

    const publicUrl = `https://hm-image-storage-test.s3.${process.env.AWS_REGION}.amazonaws.com/${outputKey}`;

    console.log(`PublicURL: ${publicUrl}`);

    const resposne = await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: event.Records[0].s3.object.key,
      }),
    );

    console.log("DELETE RESPONSE: ", response);

    return { status: "success", file: outputKey };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};
