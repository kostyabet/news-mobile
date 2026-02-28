import axiosClient from "@/entities/api/api";

export interface Role {
  id: number;
  role: string;
}

export const getUserRoles = () => {
  return axiosClient.get(`/user-roles`);
};

export const postUser = (login: string, pass: string, role: number) => {
  return axiosClient.post(`/users`, { login, password: pass, role });
};

export const postSignIn = (login: string, password: string) => {
  return axiosClient.post(`/users/login`, { login, password });
};
