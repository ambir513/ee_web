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
    <div className="mx-auto max-w-5xl space-y-12 py-8">
      {/* Summary Section */}
      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-secondary/30 p-8 text-center backdrop-blur-sm border border-border/50">
          <span className="text-7xl font-serif font-bold text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-4">
            <StarRating value={averageRating} readOnly iconSize={24} color="#D4AF37" />
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-widest">
            {ratingCount} Global Reviews
          </p>
          
          <Button 
            variant="outline" 
            className="mt-8 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? "Close Review Form" : "Write a Review"}
          </Button>
        </div>

        <div className="flex flex-col justify-center space-y-4 px-4">
          <h3 className="text-lg font-serif font-semibold">Rating Distribution</h3>
          <div className="space-y-3">
            {distribution.map((count, i) => {
              const star = 5 - i;
              const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4">
                  <span className="w-12 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {star} Stars
                  </span>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-[#D4AF37]"
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-muted-foreground">
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-primary/10 bg-white p-8 shadow-xl shadow-primary/5"
          >
            {!currentUser ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-amber-500" />
                <p className="font-serif text-lg">Please sign in to share your experience</p>
                <Button variant="link" className="mt-2 text-primary">Login to your account</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="mb-4 font-serif text-xl font-semibold">Share Your Thoughts</h3>
                  <label className="text-sm font-medium text-muted-foreground">How would you rate this product?</label>
                  <div className="mt-2">
                    <StarRating 
                      value={ratingValue} 
                      onChange={(v) => setValue("rating", v)} 
                      iconSize={32}
                      color="#D4AF37"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Detailed Review</label>
                  <textarea
                    {...register("comment", { required: "Please tell us what you think" })}
                    rows={4}
                    className="w-full rounded-2xl border border-border bg-secondary/10 p-4 font-sans text-sm outline-none ring-primary/20 transition-all focus:border-primary/40 focus:ring-4"
                    placeholder="Tell others about the quality, design, and fit..."
                  />
                  {errors.comment && (
                    <p className="text-xs text-destructive">{errors.comment.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="rounded-full bg-primary px-8 py-6 text-primary-foreground hover:bg-primary/90"
                  >
                    {mutation.isPending ? "Sharing..." : "Post Review"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                {mutation.isSuccess && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-4 text-center text-sm font-medium text-emerald-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Thank you for your review!
                  </motion.p>
                )}
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Separator className="opacity-50" />

      {/* Reviews List */}
      <div className="space-y-8">
        <h3 className="font-serif text-2xl font-semibold">Authentic Experiences ({reviews.length})</h3>
        
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-serif text-xl">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience with this boutique piece.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-3xl border border-border/40 p-6 transition-all hover:bg-white hover:shadow-lg hover:shadow-primary/5"
              >
                {editingReviewId === review._id ? (
                  /* Inline Edit Form */
                  <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-semibold">Edit Your Review</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingReviewId(null)}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                    <div>
                      <StarRating 
                        value={editRatingValue} 
                        onChange={(v) => setValueEdit("rating", v)} 
                        iconSize={24}
                        color="#D4AF37"
                      />
                    </div>
                    <textarea
                      {...registerEdit("comment", { required: "Comment cannot be empty" })}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-secondary/5 p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                    <div className="flex justify-end gap-2">
                       <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full"
                        onClick={() => setEditingReviewId(null)}
                       >
                         Cancel
                       </Button>
                       <Button 
                        type="submit" 
                        size="sm" 
                        disabled={editMutation.isPending}
                        className="rounded-full bg-primary text-primary-foreground"
                       >
                         {editMutation.isPending ? "Updating..." : "Update Review"}
                       </Button>
                    </div>
                  </form>
                ) : (
                  /* Review Content */
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {typeof review.userId !== "string" ? (
                            <span className="text-lg font-bold">
                              {review.userId.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-semibold text-foreground">
                              {typeof review.userId !== "string" ? review.userId.name : "Verified Customer"}
                            </h4>
                            {typeof review.userId !== "string" && currentUser?._id === review.userId._id && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">You</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={cn(
                                "fill-muted-foreground/20 text-muted-foreground/20",
                                i < Math.round(review.rating) && "fill-[#D4AF37] text-[#D4AF37]"
                              )}
                            />
                          ))}
                        </div>
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                          Verified Purchase
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pl-16">
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        "{review.comment}"
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp size={12} /> Helpful
                          </button>
                          <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                            Report
                          </button>
                        </div>

                        {/* Edit/Delete Actions */}
                        {typeof review.userId !== "string" && currentUser?._id === review.userId._id && (
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleEditClick(review)}
                              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-blue-600 transition-colors"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button 
                              onClick={() => setReviewToDelete(review._id)}
                              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

     
      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent >
          {/* Custom Close Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => setReviewToDelete(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <DialogHeader className="px-10 pt-16 pb-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-500 mb-8 border border-rose-100/50"
            >
              <Trash2 size={40} strokeWidth={1.5} className="animate-pulse" />
            </motion.div>
            <DialogTitle className="font-serif text-3xl font-bold text-foreground tracking-tight">
              Delete Review?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-[15px] pt-4 leading-relaxed font-sans">
              This action is permanent and cannot be reversed. To confirm your intention, please type <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/50">delete</span> in the field below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-10 pb-12">
            <div className="relative group">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'delete' to verify"
                className="h-16 text-center text-lg rounded-2xl border-muted/30 bg-secondary/10 font-sans tracking-wide placeholder:text-muted-foreground/30 focus-visible:ring-rose-500/10 focus-visible:border-rose-200 transition-all duration-300"
              />
              <motion.div 
                initial={false}
                animate={{ opacity: deleteConfirmText.toLowerCase() === "delete" ? 1 : 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500"
              >
                <CheckCircle2 size={20} />
              </motion.div>
            </div>
          </div>

          <DialogFooter className="flex-row  items-center  gap-3 ">
            <Button
              variant="ghost"
              onClick={() => setReviewToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteConfirmText.toLowerCase() !== "delete" || deleteMutation.isPending}
              
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  Processing...
                </span>
              ) : (
                "Delete Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Review, Review_04Props };
