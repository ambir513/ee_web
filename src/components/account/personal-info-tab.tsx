"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X, Loader2 } from "lucide-react"

interface PersonalInfoData {
  name: string
  email: string
  avatar?: string
}

export function PersonalInfoTab() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: "",
    email: "",
    avatar: undefined,
  })
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me", { queryClient })
      return response
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: false, // Don't refetch on every tab switch
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { name: string; avatar?: string }) => {
      return api.patch("/account/edit", data, { queryClient })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUser"] })
      setIsEditing(false)
      setErrors({})
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || "Failed to update profile" })
    },
  })

  // Sync form data with user data
  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        avatar: userData.data.avatar || undefined,
      })
      setAvatarPreview(userData.data.avatar || undefined)
    }
  }, [userData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = "Name is required."
    } else if (trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters."
    } else if (trimmedName.length > 30) {
      newErrors.name = "Name must be at most 30 characters."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validationError = validateImageFile(file, 5)
    if (validationError) {
      setErrors({ ...errors, avatar: validationError })
      return
    }

    try {
      setIsUploading(true)
      setErrors({ ...errors, avatar: "" })

      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file, "avatars", queryClient)
      
      // Update form data with Cloudinary URL
      setFormData({ ...formData, avatar: cloudinaryUrl })
      setAvatarPreview(cloudinaryUrl)
      
    } catch (error: any) {
      setErrors({ ...errors, avatar: error.message || "Failed to upload image" })
      setAvatarPreview(formData.avatar)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined)
    setFormData({ ...formData, avatar: undefined })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    if (validate()) {
      updateUserMutation.mutate({
        name: formData.name.trim(),
        avatar: formData.avatar,
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        avatar: userData.data.avatar || undefined,
      })
      setAvatarPreview(userData.data.avatar || undefined)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Personal Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your personal details and profile information.
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <Separator className="my-5" />

      {/* Avatar Section */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Profile Picture
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-border">
              {avatarPreview && avatarPreview !== "avatar.png" ? (
                <AvatarImage src={avatarPreview} alt={formData.name} />
              ) : null}
              <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
                {getInitials(formData.name || "User")}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                aria-label="Change avatar"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          
          {isEditing && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
              {avatarPreview && avatarPreview !== "avatar.png" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
        {errors.avatar && (
          <p className="text-xs text-destructive mt-2">{errors.avatar}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG or GIF. Max size 5MB. {isUploading && "Uploading to cloud..."}
        </p>
      </div>

      <Separator className="my-5" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            disabled={!isEditing}
            placeholder="Your name"
            maxLength={30}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            3-30 characters, trimmed.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted cursor-not-allowed"
            placeholder="you@example.com"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed for security reasons.
          </p>
        </div>
      </div>

      {errors.submit && (
        <p className="text-sm text-destructive mt-4">{errors.submit}</p>
      )}

      {isEditing && (
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={updateUserMutation.isPending || isUploading}>
            {updateUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={updateUserMutation.isPending || isUploading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
