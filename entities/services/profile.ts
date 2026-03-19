import axiosClient from "@/entities/api/api";

export interface UserProfile {
  id: number;
  login: string;
  role: string;
  email: string | null;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const getProfile = async (userId: number): Promise<UserProfile> => {
  return axiosClient.get(`/profile/${userId}`);
};

export const updateProfile = async (
  userId: number,
  data: UpdateProfileDto,
): Promise<UserProfile> => {
  return axiosClient.patch(`/profile/${userId}`, data);
};

export const deleteProfile = async (userId: number): Promise<void> => {
  return axiosClient.delete(`/profile/${userId}`);
};

export const uploadAvatar = async (
  userId: number,
  uri: string,
): Promise<string> => {
  const filename = uri.split("/").pop() || "avatar.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any);

  const result = await axiosClient.postFormData<{ url: string }>(
    `/profile/${userId}/avatar`,
    formData,
  );
  return result.url;
};
