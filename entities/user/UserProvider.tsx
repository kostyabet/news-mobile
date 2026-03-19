import React, { useState, useEffect, useCallback } from "react";
import { UserContext } from "./UserContext";
import { useAuth } from "@/entities/auth/useAuth";
import { getAccessToken } from "@/entities/services/keychain";
import {
  UserProfile,
  UpdateProfileDto,
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
} from "@/entities/services/profile";

function decodeJwtPayload(token: string): { sub: number; login: string; role: string } {
  const base64 = token.split(".")[1];
  const json = atob(base64);
  return JSON.parse(json);
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const payload = decodeJwtPayload(token);
      const data = await getProfile(payload.sub);
      setProfile(data);
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isLoggedIn, fetchProfile]);

  const updateUserProfile = useCallback(
    async (data: UpdateProfileDto) => {
      if (!profile) return;
      const updated = await updateProfile(profile.id, data);
      setProfile(updated);
    },
    [profile],
  );

  const uploadUserAvatar = useCallback(
    async (uri: string) => {
      if (!profile) return;
      const url = await uploadAvatar(profile.id, uri);
      setProfile((prev) => (prev ? { ...prev, avatar: url } : prev));
    },
    [profile],
  );

  const deleteAccount = useCallback(async () => {
    if (!profile) return;
    await deleteProfile(profile.id);
    await signOut();
  }, [profile, signOut]);

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        fetchProfile,
        updateUserProfile,
        uploadUserAvatar,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
