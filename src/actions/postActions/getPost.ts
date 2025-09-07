"use server";

import prisma from "@/lib/prisma";
import { Tag } from "@prisma/client";

export async function getPosts(
  limit: number = 20,
  tags: Tag[] = [],
  cursor: string | null = null
) {
  const SIZE = 200;

  const candidates = await prisma.post.findMany({
    where: {
      ...(tags && tags.length > 0 ? { tags: { hasSome: tags } } : {}),
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: SIZE,
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      _count: { select: { likedBy: true, viewedBy: true, commentedBy: true } },
    },
  });

  const likesWeight = 3;
  const viewsWeight = 0.5;
  const commentsWeight = 4;
  const ageOffsetHours = 2;
  const decay = 1.3;

  const scored = candidates.map((post) => {
    const likes = post._count?.likedBy ?? 0;
    const views = post._count?.viewedBy ?? 0;
    const comments = post._count?.commentedBy ?? 0;

    const hoursAge = Math.max(
      (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60),
      0.001
    );

    const numerator =
      likes * likesWeight + views * viewsWeight + comments * commentsWeight;
    const denom = Math.pow(hoursAge + ageOffsetHours, decay);
    const score = numerator / denom;

    return { post: post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map((s) => s.post);

  const nextCursor = results.length
    ? results[results.length - 1].createdAt.toISOString()
    : null;

  return { posts: results, nextCursor };
}
