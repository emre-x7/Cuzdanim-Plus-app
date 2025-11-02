// API ve uygulama ayarları

export const API_BASE_URL = __DEV__
  ? "http://192.168.1.139:5027/api/v1" // Geliştirme (local IP)
  : "https://api.cuzdanim.com/api/v1"; // Production

export const TOKEN_KEY = "@cuzdanim_token";
export const REFRESH_TOKEN_KEY = "@cuzdanim_refresh_token";
export const USER_KEY = "@cuzdanim_user";

export const APP_NAME = "Cüzdanım+";
export const APP_VERSION = "1.0.0";
