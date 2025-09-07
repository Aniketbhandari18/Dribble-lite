"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (file: File): Promise<UploadApiResponse | null> => {
  try {
    if (!file) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );

      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

// export async function getCloudinarySignature() {
//   const timestamp = Math.round(new Date().getTime() / 1000);

//   const signature = cloudinary.utils.api_sign_request(
//     { timestamp },
//     process.env.CLOUDINARY_API_SECRET!
//   );

//   return {
//     timestamp,
//     signature,
//     cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
//     apiKey: process.env.CLOUDINARY_API_KEY!,
//   };
// }

