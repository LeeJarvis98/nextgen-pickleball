import { z } from 'zod';

const VALID_CATEGORIES = [
  'singles_male', 'singles_female',
  'doubles_male', 'doubles_female', 'doubles_mixed',
] as const;

export const registrationSchema = z.object({
  tournament_id: z.string().uuid(),
  full_name: z.string().min(2, 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)').max(100),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  gender: z.enum(['male', 'female'] as const, {
    error: 'Vui lòng chọn giới tính',
  }),
  category: z
    .array(z.enum(VALID_CATEGORIES))
    .min(1, 'Vui lòng chọn ít nhất một hạng mục thi đấu'),
  partner_names: z.record(z.enum(VALID_CATEGORIES), z.string().max(100).optional()).optional(),
  notes: z.string().max(500).optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
