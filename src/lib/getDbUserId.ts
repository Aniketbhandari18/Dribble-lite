import { CustomSessionClaims } from "@/types/clerk";
import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";
import { ApiError } from "./apiError";

export async function getDbUserId() {
  const { userId, sessionClaims } = await auth();

  const typedClaims = sessionClaims as CustomSessionClaims;
  const dbUserId = typedClaims?.publicMetadata?.dbUserId;

  if (!dbUserId){
    if (!userId) {
      throw new ApiError("Unauthorized - No user id found", 401);
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      throw new ApiError("Unauthorized - No user found in database", 401);
    }

    return user.id;
  }

  return dbUserId;
}