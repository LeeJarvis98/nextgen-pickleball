export type RegistrationCategory = 'singles' | 'doubles';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Registration {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  category: RegistrationCategory;
  partner_name?: string;
  notes?: string;
  status: RegistrationStatus;
}

export interface RegistrationFormValues {
  full_name: string;
  phone: string;
  email: string;
  category: RegistrationCategory;
  partner_name: string;
  notes: string;
}
