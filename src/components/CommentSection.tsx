import CommentInput from "./CommentInput";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Comment, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { getComments } from "@/actions/postActions/getComments";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
  postId: string;
  user: User | null;
};

type CommentWithExtras = Comment & {
  commentedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export default function CommentSection({ user, postId }: Props) {
  const [comments, setComments] = useState<CommentWithExtras[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getComments(postId);
      setComments(res);
    })();
  }, [postId]);

  const handleNewComment = (newComment: CommentWithExtras) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Comments ({comments.length})
      </h2>

      {user ? (
        <CommentInput user={user} postId={postId} onSubmit={handleNewComment} />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-muted/50 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Want to join the discussion?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be logged in to leave a comment.
          </p>
          <SignInButton>
            <Button>Login</Button>
          </SignInButton>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card
            key={comment.id}
            className="p-6 bg-gradient-card shadow-soft hover:shadow-medium transition-smooth"
          >
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.commentedBy.avatar} />
                <AvatarFallback>
                  {comment.commentedBy.firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">
                    {comment.commentedBy.firstName}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {comment.createdAt.toLocaleString()}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed mb-3">
                  {comment.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
