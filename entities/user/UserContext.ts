import { createContext } from "react";
import { UserProfile, UpdateProfileDto } from "@/entities/services/profile";

export interface UserContextData {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileDto) => Promise<void>;
  uploadUserAvatar: (uri: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const UserContext = createContext<UserContextData>(
  {} as UserContextData,
);
