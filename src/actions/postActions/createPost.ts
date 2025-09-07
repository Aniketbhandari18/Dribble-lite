"use server";

import { uploadOnCloudinary } from "@/lib/cloudinary";
import { getDbUserId } from "@/lib/getDbUserId";
import prisma from "@/lib/prisma";
import { postFormSchema } from "@/lib/zodSchemas/postFormSchema";
import { z } from "zod";

export async function createPost(values: z.infer<typeof postFormSchema>) {
  try {
    const dbUserId = await getDbUserId();
  
    const result = postFormSchema.safeParse(values);
  
    if (!result.success){
      throw new Error(result.error.issues[0].message);
    }
  
    const imageFile = values.image;
    if (!imageFile){
      throw new Error("Image is required");
    }
  
    const res = await uploadOnCloudinary(imageFile);
    console.log("done");
    console.log(res);
    if (!res){
      throw new Error("Error uploading image");
    }
  
    const imageUrl = res.secure_url;
  
    const newPost = await prisma.post.create({
      data: {
        title: values.title,
        description: values.description,
        tags: values.tags,
        imageUrl: imageUrl,
        createdById: dbUserId
      }
    })
  
    return {
      success: true,
      message: "Post created Successfully",
      post: newPost
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error creating post"
    }
  }
}