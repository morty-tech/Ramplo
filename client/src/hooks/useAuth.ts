import { useQuery } from "@tanstack/react-query";
import { User, UserProfile, UserProgress } from "@shared/schema";

interface AuthData {
  user: User;
  profile: UserProfile | null;
  progress: UserProgress | null;
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthData>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: data?.user,
    profile: data?.profile,
    progress: data?.progress,
    isLoading,
    isAuthenticated: !!data?.user,
    isMortyUser: data?.user?.isMortyUser || false,
  };
}
