import { z } from 'zod';

export const registrationSchema = z.object({
  full_name: z.string().min(2, 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)').max(100),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  category: z.enum(['singles', 'doubles'] as const, {
    error: 'Vui lòng chọn hạng mục thi đấu',
  }),
  partner_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.category === 'singles' || (data.partner_name && data.partner_name.length >= 2),
  {
    message: 'Vui lòng nhập tên đồng đội (ít nhất 2 ký tự)',
    path: ['partner_name'],
  }
);

export type RegistrationInput = z.infer<typeof registrationSchema>;
