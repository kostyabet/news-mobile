// Общий формат ответа от сервера (если у тебя стандартизированный ответ)
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp?: string;
}

// Тип для пагинации
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Тип для параметров запроса
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// Типы для пользователя (пример)
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Тип для создания пользователя
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
}

// Тип для обновления пользователя
export interface UpdateUserDto extends Partial<CreateUserDto> {}

// Типы для ошибок API
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}