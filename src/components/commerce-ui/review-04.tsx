"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, ThumbsUp, User, Send, CheckCircle2, AlertCircle, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import StarRating from "@/components/commerce-ui/star-rating-fractions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { queryClient as globalQueryClient } from "@/utils/tanstack-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ReviewUser {
  _id: string;
  name: string;
  email: string;
}

interface Review {
  _id: string;
  userId: ReviewUser | string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Review_04Props {
  productId: string;
  reviews?: Review[];
  averageRating?: number;
  ratingCount?: number;
}

interface ReviewFormValues {
  rating: number;
  comment: string;
}

export default function Review_04({
  productId,
  reviews = [],
  averageRating = 0,
  ratingCount = 0,
}: Review_04Props) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReviewId, setEditingReviewId] = React.useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = React.useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

  const queryClient = useQueryClient();

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me", { queryClient });
      return response;
    },
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
  });
  const currentUser = userData?.data;

  // Rating distribution calculation
  const distribution = React.useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const floorRating = Math.floor(r.rating);
      if (floorRating >= 1 && floorRating <= 5) {
        dist[5 - floorRating]++;
      }
    });
    return dist;
  }, [reviews]);

  // Main Review Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Edit Review Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    watch: watchEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<ReviewFormValues>();

  const ratingValue = watch("rating");
  const editRatingValue = watchEdit("rating");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
    queryClient.invalidateQueries({ queryKey: ["/product", productId] });
  };

  const mutation = useMutation({
    mutationFn: (data: ReviewFormValues) =>
      api.post(`/review/create/${productId}`, data, { queryClient: globalQueryClient }),
    onSuccess: () => {
      invalidate();
      reset();
      setIsFormOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewFormValues }) =>
      api.patch(`/review/edit/${reviewId}`, data, { queryClient: globalQueryClient }),
    onSuccess: () => {
      invalidate();
      setEditingReviewId(null);
      resetEdit();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) =>
      api.delete(`/review/delete/${reviewId}`, { queryClient: globalQueryClient }),
    onSuccess: () => {
      invalidate();
      setReviewToDelete(null);
      setDeleteConfirmText("");
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    mutation.mutate(data);
  };

  const onEditSubmit = (data: ReviewFormValues) => {
    if (editingReviewId) {
      editMutation.mutate({ reviewId: editingReviewId, data });
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review._id);
    setValueEdit("rating", review.rating);
    setValueEdit("comment", review.comment);
  };

  const handleDeleteSubmit = () => {
    if (reviewToDelete && deleteConfirmText.toLowerCase() === "delete") {
      deleteMutation.mutate(reviewToDelete);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 sm:space-y-16 py-4 sm:py-8">
      {/* Summary Section */}
      <div className="grid gap-6 sm:gap-12 md:grid-cols-[1fr_2fr] items-center">
        <div className="flex flex-col items-center justify-center border border-border/60 p-6 sm:p-10 text-center">
          <span className="text-4xl sm:text-6xl font-serif text-foreground tracking-tight">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-3 sm:mt-4 flex gap-0.5 text-foreground">
            <StarRating value={averageRating} readOnly iconSize={18} color="#000" />
          </div>
          <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Based on {ratingCount} Reviews
          </p>

          <Button
            variant="outline"
            className="mt-6 sm:mt-8 rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors uppercase tracking-widest text-[10px] sm:text-[11px] h-10 sm:h-12 px-6 sm:px-8"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? "Close Form" : "Write a Review"}
          </Button>
        </div>

        <div className="flex flex-col justify-center space-y-3 sm:space-y-5 px-0 md:px-8">
          <div className="space-y-2.5 sm:space-y-4">
            {distribution.map((count, i) => {
              const star = 5 - i;
              const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2.5 sm:gap-4 text-xs">
                  <span className="w-12 sm:w-16 shrink-0 font-medium text-foreground uppercase tracking-widest text-[9px] sm:text-[10px]">
                    {star} Stars
                  </span>
                  <div className="relative h-[2px] flex-1 min-w-0 overflow-hidden bg-muted/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-foreground"
                    />
                  </div>
                  <span className="w-6 sm:w-8 shrink-0 text-right font-medium text-muted-foreground text-[9px] sm:text-[10px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-border/60 bg-background p-8 sm:p-12 mb-12">
              {!currentUser ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="font-serif text-2xl text-foreground tracking-tight">Sign in required</p>
                  <p className="mt-2 text-sm text-muted-foreground">You must be signed in to leave a review.</p>
                  <Button variant="outline" className="mt-6 rounded-none border-foreground uppercase tracking-widest text-[11px] h-12 px-8">Login</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <h3 className="font-serif text-2xl text-foreground tracking-tight mb-2">Share Your Experience</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Rate this product</p>
                    <div className="mt-6 flex justify-center text-foreground">
                      <StarRating
                        value={ratingValue}
                        onChange={(v) => setValue("rating", v)}
                        iconSize={28}
                        color="#000"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest">Your Review</label>
                    <textarea
                      {...register("comment", { required: "Please enter your review." })}
                      rows={5}
                      className="w-full rounded-none border border-border/60 bg-transparent p-4 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground/40"
                      placeholder="Share your thoughts on the fit, fabric, and design..."
                    />
                    {errors.comment && (
                      <p className="text-[11px] text-destructive uppercase tracking-widest">{errors.comment.message}</p>
                    )}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="rounded-none bg-foreground px-12 h-12 text-background hover:bg-foreground/90 uppercase tracking-widest text-[11px]"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>

                  {mutation.isSuccess && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Review submitted successfully
                    </motion.p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-12">
        <h3 className="font-serif text-2xl text-foreground border-b border-border/60 pb-4">
          Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-xl text-foreground/50">No reviews yet.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative pb-12 border-b border-border/30 last:border-0"
              >
                {editingReviewId === review._id ? (
                  /* Inline Edit Form */
                  <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-xl">Edit Review</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-none hover:bg-transparent hover:text-foreground/60"
                        onClick={() => setEditingReviewId(null)}
                      >
                        <X size={20} strokeWidth={1} />
                      </Button>
                    </div>
                    <div className="text-foreground">
                      <StarRating
                        value={editRatingValue}
                        onChange={(v) => setValueEdit("rating", v)}
                        iconSize={20}
                        color="#000"
                      />
                    </div>
                    <textarea
                      {...registerEdit("comment", { required: "Comment cannot be empty" })}
                      rows={4}
                      className="w-full rounded-none border border-border/60 bg-transparent p-4 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                    />
                    <div className="flex justify-start gap-4">
                      <Button
                        type="submit"
                        disabled={editMutation.isPending}
                        className="rounded-none bg-foreground text-background uppercase tracking-widest text-[10px] h-10 px-8"
                      >
                        {editMutation.isPending ? "Updating..." : "Update"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none uppercase tracking-widest text-[10px] h-10 px-8 border-border hover:bg-transparent hover:border-foreground"
                        onClick={() => setEditingReviewId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Review Content */
                  <div className="grid md:grid-cols-[200px_1fr] gap-8">
                    {/* User Info Col */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          {typeof review.userId !== "string" ? review.userId.name : "Verified Customer"}
                        </h4>
                        {typeof review.userId !== "string" && currentUser?._id === review.userId._id && (
                          <span className="inline-block mt-1 text-[9px] uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-0.5">Yours</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {formatDate(review.createdAt)}
                      </p>

                      <div className="pt-2 flex flex-col items-start gap-1">
                        <div className="flex items-center gap-0.5 text-foreground">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={cn(
                                "fill-transparent text-muted-foreground/30",
                                i < Math.round(review.rating) && "fill-foreground text-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Review Text Col */}
                    <div className="flex flex-col">
                      <p className="text-sm leading-relaxed text-foreground font-light mb-8">
                        {review.comment}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Empty left side or helpful buttons if needed */}
                        <div className="flex gap-4">
                          <button className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            Helpful
                          </button>
                        </div>

                        {/* Edit/Delete Actions */}
                        {typeof review.userId !== "string" && currentUser?._id === review.userId._id && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleEditClick(review)}
                              className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setReviewToDelete(review._id)}
                              className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-destructive transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>


      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="rounded-none border border-border/60 p-0 sm:max-w-[425px]">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="font-serif text-2xl text-foreground">
                Delete Review
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-light pt-2 uppercase tracking-wide">
                This action cannot be undone. Type 'delete' below to confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-8">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'delete'"
                className="rounded-none border-border/60 focus-visible:ring-foreground focus-visible:border-foreground"
              />
            </div>

            <DialogFooter className="flex gap-3 sm:justify-start">
              <Button
                variant="destructive"
                onClick={handleDeleteSubmit}
                disabled={deleteConfirmText.toLowerCase() !== "delete" || deleteMutation.isPending}
                className="rounded-none uppercase tracking-widest text-[10px] h-10 px-8"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setReviewToDelete(null)}
                className="rounded-none uppercase tracking-widest text-[10px] h-10 px-8 border-border hover:bg-transparent hover:text-foreground hover:border-foreground"
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Review, Review_04Props };
