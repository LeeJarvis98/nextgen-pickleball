export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface TournamentSchedule {
  startDate: string;
  endDate: string;
  displayDate: string;
  checkInTime: string;
  openingTime: string;
  closingTime: string;
}

export interface TournamentVenue {
  name: string;
  imageUrl: string;
  courts: number;
  courtType: string;
  city: string;
  country: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  schedule: TournamentSchedule;
  venue: TournamentVenue;
}

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
