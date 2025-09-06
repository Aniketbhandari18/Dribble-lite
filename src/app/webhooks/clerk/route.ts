// This route handles incoming webhooks events from clerk.
// It listens for user related events - user.created, user.updated, user.deleted.

import { createUser, deleteUser, updateuser } from "@/actions/userActions";
import { ApiError } from "@/lib/apiError";
import { clerkUserPayload } from "@/types/clerk";
import { WebhookEvent } from "@clerk/nextjs/webhooks";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!secret) {
      throw new ApiError("Please add webhook secret in env", 400);
    }

    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixSignature || !svixTimestamp) {
      throw new ApiError("Error occured - No svix headers", 400);
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(secret);

    let evt: WebhookEvent;
    try {
      evt = (await wh.verify(body, {
        "svix-id": svixId,
        "svix-signature": svixSignature,
        "svix-timestamp": svixTimestamp,
      })) as WebhookEvent;

      console.log(evt);
    } catch (error) {
      console.log(error);
      console.error("Error verifying webhook");

      throw new ApiError("Error verifying webhook", 400);
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (!id) {
      throw new ApiError("Error occured - No id in event", 400);
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const user: clerkUserPayload = {
        clerkId: id,
        email: evt.data.email_addresses[0].email_address,
        firstName: evt.data.first_name!,
        lastName: evt.data.last_name!,
        avatar: evt.data.image_url,
      };

      if (eventType === "user.created") {
        try {
          const newUser = await createUser(user);

          return NextResponse.json(
            { message: "User created successfully", newUser },
            { status: 201 }
          );
        } catch (error) {
          console.error("Error creating user:", error);
          throw new ApiError("Error creating user", 500);
        }
      } else if (eventType === "user.updated") {
        try {
          const updatedUser = await updateuser(id, user);
          return NextResponse.json(
            { message: "User updated successfully", updatedUser },
            { status: 200 }
          );
        } catch (error) {
          console.error("Error updating user:", error);
          throw new ApiError("Error updating user", 500);
        }
      }
    }

    if (eventType === "user.deleted") {
      try {
        const deletedUser = await deleteUser(id);

        return NextResponse.json(
          { message: "User deleted successfully", deletedUser },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new ApiError("Error deleting user", 500);
      }
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
  }
}