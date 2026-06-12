import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import axios from "axios";

export function AuthInterceptor() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const interceptorId = axios.interceptors.request.use(async (config) => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore token errors
        }
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [isSignedIn, getToken]);

  return null;
}
