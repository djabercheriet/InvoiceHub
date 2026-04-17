import * as licensingRepository from './licensing.repository';

export const licensingService = {
  async getLicenseByKey(licenseKey: string) {
    const { data, error } = await licensingRepository.getLicenseByKey(licenseKey);
    if (error) throw error;
    return data;
  },

  async checkActivation(licenseId: string, deviceId: string) {
    const { data, error } = await licensingRepository.checkActivation(licenseId, deviceId);
    if (error) throw error;
    return data;
  }
};
