"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { postFormSchema } from "@/lib/zodSchemas/postFormSchema";
import { Tag } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { ChangeEvent, useState, useTransition } from "react";
import { Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { createPost } from "@/actions/postActions/createPost";
import { useRouter } from "next/navigation";

type Props = {
  postId?: string;
  defaultValues?: {
    title: string;
    description?: string;
    tags: Tag[];
  };
};

export default function PostForm({ postId, defaultValues }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      image: undefined,
      tags: defaultValues?.tags || [],
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    form.setValue("image", file, { shouldValidate: true });

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    form.setValue("image", undefined, { shouldValidate: true });
    setImagePreview(null);
  };

  const handleSubmit = (values: z.infer<typeof postFormSchema>) => {
    startTransition(async () => {
      if (!isEditMode) {
        if (!values.image) {
          toast.error("Image is required");
          return;
        }

        // const sigRes = await getCloudinarySignature();
        // const { timestamp, signature, apiKey, cloudName } = sigRes;

        // const formData = new FormData();
        // formData.append("file", values.image);
        // formData.append("api_key", apiKey);
        // formData.append("timestamp", timestamp.toString());
        // formData.append("signature", signature);

        // console.log("entered")

        // const res = await axios.post(
        //   `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        //   formData
        // );
        // console.log("res");
        // console.log(res);

        // await createPost({...values, image: undefined}, res.data.secure_url);
        const result = await createPost(values);
        if (result.success){
          toast.success("Post created successfully");
          form.reset();
          router.push(`/post/${result.post!.id}`);
        }
        else toast.error(result.message);
      }
      // else updatePost
    });
  };

  const isEditMode = Boolean(defaultValues);

  return (
    <div className="m-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Design</CardTitle>
          <CardDescription>Share your shot</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {!isEditMode && (
                <>
                  {!imagePreview ? (
                    <div className="relative border-2 border-dashed rounded-lg transition-all duration-200 hover:bg-upload-hover cursor-pointer border-upload-border bg-upload-bg">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload image"
                      />
                      <div className="flex flex-col items-center justify-center px-6 py-12">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-foreground mb-2">
                            Drag & drop your design here
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            or click to browse files
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="w-full aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TITLE */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Title" {...field} />
                    </FormControl>
                    <FormDescription>Short title for your shot</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe your design (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TAGS */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => {
                  const availableTags = Object.values(Tag).filter(
                    (tag) => !field.value?.includes(tag)
                  );

                  return (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="px-3 py-1 text-sm rounded-full border bg-gray-200 text-gray-700 border-gray-300 cursor-pointer"
                            onClick={() =>
                              field.onChange([...(field.value ?? []), tag])
                            }
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1">
                        {(field.value ?? []).map((tag: Tag) => (
                          <span
                            key={tag}
                            className="flex items-center text-sm gap-1 px-3 py-1 bg-blue-500 text-white rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  (field.value ?? []).filter(
                                    (t: Tag) => t !== tag
                                  )
                                )
                              }
                              className="ml-1 text-white font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <FormDescription>
                        Select relevant tags for your design
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Posting..."}
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
