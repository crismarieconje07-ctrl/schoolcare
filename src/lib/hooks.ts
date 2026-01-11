"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/layout/auth-provider";

export const useAuth = () => {
  return useContext(AuthContext);
};
