"use server";

import prisma from "@/lib/prisma";

export async function getComments(postId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        commentedBy: {
          select: { id: true, avatar: true, firstName: true, lastName: true },
        },
      },
    });

    return comments;
  } catch (error) {
    console.log(error);
    return [];
  }
}
