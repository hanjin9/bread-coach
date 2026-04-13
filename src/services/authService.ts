import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import type { LoginRequest, LoginResponse, SignupRequest, User } from '@/types';

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, request);
  },

  async signup(request: SignupRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(API_ENDPOINTS.SIGNUP, request);
  },

  async logout(): Promise<void> {
    await apiService.post(API_ENDPOINTS.LOGOUT);
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return apiService.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiService.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
  },

  async verifyPhone(phone: string, code: string): Promise<{ verified: boolean }> {
    return apiService.post(API_ENDPOINTS.VERIFY_PHONE, { phone, code });
  },

  async getProfile(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.GET_PROFILE);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<User>(API_ENDPOINTS.UPDATE_PROFILE, data);
  },

  async deleteAccount(): Promise<{ message: string }> {
    return apiService.delete(API_ENDPOINTS.DELETE_ACCOUNT);
  },
};
