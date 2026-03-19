import { useContext } from "react";
import { AuthContext } from "@/entities/auth/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useArticles must be used within a ArticleProvider");
  }

  return context;
};
