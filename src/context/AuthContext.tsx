// User, token, login/logout fonksiyonları
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authService } from "../api/authService";
import { storage } from "../utils/storage";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../constants/config";
import { User, LoginRequest, RegisterRequest } from "../types/auth";

// Context'in type'ı
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açıldığında token kontrolü yap
  useEffect(() => {
    checkAuth();
  }, []);

  // Token var mı kontrol et, varsa user bilgisini yükle
  const checkAuth = async () => {
    try {
      const token = await storage.get(TOKEN_KEY);
      const userJson = await storage.get(USER_KEY);

      if (token && userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login fonksiyonu
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);

      if (!response.isSuccess) {
        throw new Error(response.message || "Login başarısız");
      }

      const { accessToken, refreshToken, userId, email, firstName, lastName } =
        response.data;

      // Token'ları kaydet
      await storage.set(TOKEN_KEY, accessToken);
      await storage.set(REFRESH_TOKEN_KEY, refreshToken);

      // User bilgisini kaydet
      const userData: User = {
        userId,
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
      };

      await storage.set(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Giriş yapılamadı"
      );
    }
  };

  // Register fonksiyonu
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);

      if (!response.isSuccess) {
        throw new Error(response.message || "Kayıt başarısız");
      }

      // Kayıt başarılı, şimdi otomatik login yap
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Kayıt oluşturulamadı"
      );
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    try {
      // Token'ları ve user'ı sil
      await storage.remove(TOKEN_KEY);
      await storage.remove(REFRESH_TOKEN_KEY);
      await storage.remove(USER_KEY);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook - AuthContext'i kullanmak için
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth hook, AuthProvider içinde kullanılmalı");
  }
  return context;
};
