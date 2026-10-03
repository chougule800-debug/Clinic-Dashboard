export interface ClinicConfig {
  appName: string;
  doctorName: string;
  qualifications: string;
  regNo: string;
  address: string;
  city: string;
  pinCode: string;
  phone: string;
  email: string;
  consultationFee?: number;
}

/**
 * Runtime clinic config. These are DEFAULTS only.
 * The actual values are loaded from the Supabase `clinic_settings` table
 * and `profiles` table at runtime via ClinicContext, then applied here so
 * that print/PDF letterheads that reference CLINIC_CONFIG still work.
 */
export const CLINIC_CONFIG: ClinicConfig = {
  appName: 'Homeopathy Clinic',
  doctorName: 'Doctor',
  qualifications: '',
  regNo: '',
  address: '',
  city: '',
  pinCode: '',
  phone: '',
  email: '',
  consultationFee: 0
};

export function applyClinicConfig(partial: Partial<ClinicConfig>): void {
  Object.assign(CLINIC_CONFIG, partial);
}