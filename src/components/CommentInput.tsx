import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Comment, User } from "@prisma/client";
import { addComment } from "@/actions/postActions/addComment";
import toast from "react-hot-toast";

type CommentWithExtras = Comment & {
  commentedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

type Props = {
  user: User;
  postId: string;
  onSubmit: (newComment: CommentWithExtras) => void;
};

const CommentInput = ({ user, postId, onSubmit }: Props) => {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setPosting(true);

    const result = await addComment(postId, comment);

    if (result.success && result.newComment) {
      setComment("");
      toast.success("Comment added successfully");
      onSubmit(result.newComment);
    } else {
      toast.error(result.message);
    }

    setPosting(false);
  };

  const handleCancel = () => {
    setComment("");
  };

  if (posting) {
    return (
      <div className="w-full flex justify-center my-5">
        <LoaderCircle className="size-9 animate-spin [animation-duration:.6s] text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* User Avatar */}
      <div className="w-9 shrink-0">
        <img
          className="w-full bg-gray-300 rounded-full"
          src={user.avatar}
          alt={user.firstName}
        />
      </div>

      <div className="w-full sm:w-98">
        <textarea
          name="comment-input"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border-2 border-gray-500 w-full rounded-md py-1 px-2 font-semibold resize-none placeholder:font-semibold"
          placeholder="Enter your comment.."
        />

        <div
          className={`relative flex items-center ${
            !isSmallScreen ? "justify-between" : "justify-end"
          }`}
        >
          <div>
            <button
              onClick={handleCancel}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-white rounded-lg cursor-pointer mr-2 ${
                !comment.trim()
                  ? "bg-gray-400"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              Cancel
            </button>
            <button
              disabled={!comment.trim()}
              onClick={handleSubmit}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-white rounded-lg cursor-pointer 
              ${
                !comment.trim()
                  ? "bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommentInput;
