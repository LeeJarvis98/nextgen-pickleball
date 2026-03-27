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
  logoUrl?: string;
  courts: number;
  courtType: string;
  city: string;
  country: string;
}

export interface TournamentPrizeEntry {
  rank: number;
  title: string;
  amount: string;
  bonus?: string;
}

export interface TournamentPrizes {
  totalPrize: string;
  entries: TournamentPrizeEntry[];
}

export type RegistrationGender = 'male' | 'female';
export type RegistrationCategory =
  | 'singles_male'
  | 'singles_female'
  | 'doubles_male'
  | 'doubles_female'
  | 'doubles_mixed';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface CategorySlotInfo {
  capacity: number;
  used: number;
}

export type EntryFeeMode = 'per_category' | 'flat';

export interface TournamentRegistration {
  deadline: string;
  deadlineDateTime: string;
  totalSlots: number;
  registrationLink: string;
  ctaTitle: string;
  ctaDescription: string;
  features: string[];
  availableCategories: RegistrationCategory[];
  doublesPartnerMode: 'fixed' | 'random';
  categorySlots: Partial<Record<RegistrationCategory, CategorySlotInfo>>;
  entryFeeMode: EntryFeeMode;
  entryFee?: string;
  categoryFees?: Partial<Record<RegistrationCategory, string>>;
}

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  schedule: TournamentSchedule;
  venue: TournamentVenue;
  prizes: TournamentPrizes;
  registration: TournamentRegistration;
}

export interface Registration {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  gender: RegistrationGender;
  category: RegistrationCategory[];
  partner_names?: Partial<Record<RegistrationCategory, string>>;
  notes?: string;
  status: RegistrationStatus;
}

export interface RegistrationFormValues {
  tournament_id: string;
  full_name: string;
  phone: string;
  email: string;
  gender: RegistrationGender;
  category: RegistrationCategory[];
  partner_names: Partial<Record<RegistrationCategory, string>>;
  notes: string;
}
