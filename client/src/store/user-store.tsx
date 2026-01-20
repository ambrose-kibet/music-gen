import type { User } from "@/utils/types";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  setUser: (user: User | null) => set(() => ({ user })),
}));

export default useUserStore;
