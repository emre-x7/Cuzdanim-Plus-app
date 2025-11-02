// Result<T>, ApiError

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface ApiError {
  message: string;
  errors?: string[];
  statusCode?: number;
}
