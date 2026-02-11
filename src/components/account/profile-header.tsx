"use client";

import { Camera, Mail, MapPin, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: string; 
  role: "USER" | "ADMIN";
  joinedDate: string;
  location?: string;
  onEditProfile?: () => void;
}

export function ProfileHeader({
  name,
  email,
  role,
  joinedDate,
  location,
  avatar,
  onEditProfile,
}: ProfileHeaderProps) {

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarFallback className="bg-muted text-lg font-semibold text-foreground">
                <Image src={avatar} alt="Avatar"  className="object-cover"  width={100} height={100} />
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-0 left-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{name}</h1>
              <Badge
                variant={role === "ADMIN" ? "default" : "secondary"}
                className="text-xs"
              >
                {role === "ADMIN" ? "Admin" : "Member"}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={onEditProfile} className="shrink-0">
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
