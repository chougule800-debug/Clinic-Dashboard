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
}

export const CLINIC_CONFIG: ClinicConfig = {
  appName: "Dr. Bharat's Aroga Homeopathy",
  doctorName: 'Dr. Bharat Chougule',
  qualifications: 'BHMS, PGDCP',
  regNo: 'A-11124',
  address: '1st Floor Mahalaxmi plaza, Vengulra Road, Opp Central Jail Hindalga, Belgaum 591108',
  city: 'Belgaum',
  pinCode: '591108',
  phone: '+91 94481 23456',
  email: 'chougule800@gmail.com'
};
