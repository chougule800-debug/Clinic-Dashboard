import { DoctorUser } from '../types';

export const INITIAL_DOCTORS: DoctorUser[] = [
  {
    id: 'doc_bharat',
    email: 'chougule800@gmail.com',
    password: String(['05', '16', '17'].join('')),
    name: 'Dr. Bharat Chougule',
    qualifications: 'B.H.M.S., PGDCP, CCH',
    regNo: 'A-11124',
    speciality: 'Classical Homeopathy & Chronic Disease Specialist',
    clinicName: "Dr. Bharat's Arogya Homeopathy",
    address: '1st Floor Mahalaxmi plaza, Vengurla Road, Opp Central Jail Hindalga',
    city: 'Belgaum',
    pinCode: '591108',
    phone: '+91 9902686173',
    role: 'owner',
    createdAt: '2025-01-01T00:00:00.000Z',
    consultationFee: 600
  }
];

export const OWNER_CONTACT_MESSAGE = 'Contact Dr. Bharat Chougule (9902686173) for Login details';
export const OWNER_PHONE_RAW = '9902686173';
