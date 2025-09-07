"use server";

import { getDbUserId } from "@/lib/getDbUserId";
import prisma from "@/lib/prisma";

export async function toggleLike(postId: string) {
  try {
    const dbUserId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new Error("Post doesn't exist");
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        likedById_postId: {
          postId: postId,
          likedById: dbUserId,
        },
      },
    });

    if (!existingLike) {
      await prisma.like.create({
        data: {
          postId: postId,
          likedById: dbUserId,
        },
      });
    } else {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    }

    return {
      success: true,
      message: "Toggle successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error toggling",
    };
  }
}
