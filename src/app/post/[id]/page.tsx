import PostPage from "@/components/pages/PostPage";
import { getDbUserId } from "@/lib/getDbUserId";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user: User | null = null;
  try {
    const dbUserId = await getDbUserId();

    user = await prisma.user.findUnique({
      where: { id: dbUserId },
    });
  } catch (error) {
    console.log(error);
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      likedBy: {
        where: { likedById: user?.id },
        select: { id: true },
      },
    },
  });

  if (!post) {
    return notFound();
  }

  const hasLiked = post.likedBy.length > 0;

  return <PostPage post={post} user={user} initialLikedStatus={hasLiked} />;
}
