'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Box,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { User, Phone, Mail, Users, CheckCircle } from 'lucide-react';
import type { RegistrationFormValues } from '@/types';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function RegisterModal({ opened, onClose }: RegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegistrationFormValues>({
    initialValues: {
      full_name: '',
      phone: '',
      email: '',
      category: 'singles',
      partner_name: '',
      notes: '',
    },
    validate: {
      full_name: (v) =>
        v.trim().length < 2 ? 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)' : null,
      phone: (v) =>
        /^[0-9+\-\s()]{9,15}$/.test(v.trim()) ? null : 'Số điện thoại không hợp lệ',
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email không hợp lệ'),
      partner_name: (v, values) =>
        values.category === 'doubles' && (!v || v.trim().length < 2)
          ? 'Vui lòng nhập tên đồng đội'
          : null,
    },
  });

  const handleSubmit = async (values: RegistrationFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Đăng ký thất bại');
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      notifications.show({
        title: 'Lỗi đăng ký',
        message: err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<span className={styles.modalTitle}>ĐĂNG KÝ THAM DỰ</span>}
      size="lg"
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
        close: styles.modalClose,
      }}
      centered
    >
      {success ? (
        <Stack align="center" py={32} gap="lg">
          <Box className={styles.successIconBox}>
            <CheckCircle size={36} color="#B8FF00" />
          </Box>
          <span className={styles.successTitle}>Đăng Ký Thành Công!</span>
          <p className={styles.successSubtext}>
            Chúng tôi sẽ liên hệ xác nhận thông tin qua email và số điện thoại của bạn.
          </p>
          <Button onClick={handleClose} className={styles.successCloseButton}>
            Đóng
          </Button>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" mt="sm">
            <span className={styles.seasonLabel}>Season 1 · 2026</span>

            <TextInput
              label="Họ và Tên"
              placeholder="Nguyễn Văn A"
              required
              leftSection={<User size={16} color="#ADAAAA" />}
              classNames={{ label: styles.inputLabel }}
              {...form.getInputProps('full_name')}
            />

            <Group grow>
              <TextInput
                label="Số Điện Thoại"
                placeholder="0912 345 678"
                required
                leftSection={<Phone size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('phone')}
              />
              <TextInput
                label="Email"
                placeholder="email@example.com"
                required
                leftSection={<Mail size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('email')}
              />
            </Group>

            <Select
              label="Hạng Mục Thi Đấu"
              placeholder="Chọn hạng mục"
              required
              leftSection={<Users size={16} color="#ADAAAA" />}
              classNames={{ label: styles.inputLabel }}
              data={[
                { value: 'singles', label: '1vs1 — Đơn' },
                { value: 'doubles', label: '2vs2 — Đôi' },
              ]}
              {...form.getInputProps('category')}
            />

            {form.values.category === 'doubles' && (
              <TextInput
                label="Tên Đồng Đội"
                placeholder="Họ và tên người cùng thi đấu"
                required
                leftSection={<User size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('partner_name')}
              />
            )}

            <Textarea
              label="Ghi Chú (Tùy chọn)"
              placeholder="Thông tin thêm, yêu cầu đặc biệt..."
              classNames={{ label: styles.inputLabel }}
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Divider className={styles.divider} mt="xs" />

            <Group gap="xs" wrap="wrap">
              {['Thi đấu 1vs1 & 2vs2', 'Trọng tài chuyên nghiệp', 'Giải thưởng hấp dẫn'].map(
                (item) => (
                  <Group key={item} gap={6}>
                    <CheckCircle size={14} color="#B8FF00" />
                    <span className={styles.featureText}>{item}</span>
                  </Group>
                )
              )}
            </Group>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className={styles.submitButton}
            >
              {loading ? 'ĐANG GỬI...' : '[ ĐĂNG KÝ NGAY ]'}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}