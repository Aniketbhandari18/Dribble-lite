"use client";

import { Heart } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Post, User } from "@prisma/client";
import CommentSection from "../CommentSection";
import { useState } from "react";
import { toggleLike } from "@/actions/postActions/toggleLike";

type Props = {
  post: Post;
  user: User | null;
  initialLikedStatus: boolean;
};

export default function PostPage({ post, user, initialLikedStatus }: Props) {
  const [liked, setLiked] = useState(initialLikedStatus);

  const handleToggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    const result = await toggleLike(post.id);

    if (!result.success) {
      setLiked(!newLiked);
    }
  };

  return (
    <div className="min-h-screen bg-background m-4 sm:m-18 sm:mt-15">
      {/* Author Details */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
          </Avatar>

          <p className="font-semibold">Aniket Bhandari</p>
        </div>
        <div>
          <button
            onClick={handleToggleLike}
            className="bg-gray-200 h-8 w-8 flex justify-center items-center rounded-full cursor-pointer"
          >
            <Heart size={16} fill={liked ? "black" : "none"} />
          </button>
        </div>
      </div>
      {/* Hero Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={post.imageUrl}
          alt="Mountain lake at sunset"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {/* description */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Comments Section */}
        <CommentSection user={user} postId={post.id} />
      </div>
    </div>
  );
}
