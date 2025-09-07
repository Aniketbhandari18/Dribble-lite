"use client";

import { useEffect, useState, useCallback } from "react";
import { Tag, Post, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
import { getPosts } from "@/actions/postActions/getPost";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import Loader from "./Loader";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

type PostWithExtras = Post & {
  createdBy: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
  _count: { likedBy: number; commentedBy: number; viewedBy: number };
};

export default function PostList() {
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPosts = useCallback(
    async (cursorParam: string | null = null, reset: boolean = false) => {
      try {
        setIsLoading(true);
        const res = await getPosts(10, tags, cursorParam);
        setPosts((prev) => (reset ? res.posts : [...prev, ...res.posts]));
        setCursor(res.nextCursor);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [tags]
  );

  useEffect(() => {
    fetchPosts(null, true);
  }, [tags, fetchPosts]);

  const loadMore = () => {
    if (!cursor) return;
    fetchPosts(cursor);
  };

  const toggleTag = (tag: Tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const lastElementRef = useInfiniteScroll(
    isLoading,
    Boolean(cursor),
    loadMore
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.values(Tag).map((tag) => (
          <Button
            key={tag}
            variant={tags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <div
            ref={idx === posts.length - 1 ? lastElementRef : null}
            key={post.id}
            className="group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/20 hover:bg-card-hover hover:shadow-lg cursor-pointer"
          >
            <Link href={`/post/${post.id}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-card-foreground text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {post.title}
                </h3>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={post.createdBy.avatar}
                        alt={post.createdBy.firstName}
                      />
                      <AvatarFallback className="text-xs">
                        {post.createdBy.firstName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {post.createdBy.firstName}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{post._count.likedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post._count.viewedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {isLoading && <Loader className="mt-10" />}
    </div>
  );
}
