import * as profileRepository from './profile.repository';

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await profileRepository.getProfile(userId);
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await profileRepository.updateProfile(userId, updates);
    if (error) throw error;
    return data;
  }
};
