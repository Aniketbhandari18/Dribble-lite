"use server";

import { getDbUserId } from "@/lib/getDbUserId";
import prisma from "@/lib/prisma";

export async function addComment(postId: string, content: string) {
  try {
    const dbUserid = await getDbUserId();

    if (!dbUserid) {
      throw new Error("Unauthorized");
    }

    const comment = await prisma.comment.create({
      data: {
        content: content,
        postId: postId,
        commentedById: dbUserid,
      },
      include: {
        commentedBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
    console.log(comment);

    return {
      success: true,
      message: "Comment added successfully",
      newComment: comment,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error adding comment",
    };
  }
}
