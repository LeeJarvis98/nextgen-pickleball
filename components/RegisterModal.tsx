'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Text,
  Group,
  Box,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { User, Phone, Mail, Users, CheckCircle } from 'lucide-react';
import type { RegistrationFormValues } from '@/types';

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

  const labelStyle = {
    fontFamily: 'var(--font-space-grotesk)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#ADAAAA',
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '1.3rem',
            color: '#B8FF00',
          }}
        >
          ĐĂNG KÝ THAM DỰ
        </Text>
      }
      size="lg"
      styles={{
        content: {
          backgroundColor: '#1A1919',
          border: '1px solid rgba(184,255,0,0.15)',
        },
        header: {
          backgroundColor: '#1A1919',
          borderBottom: '1px solid rgba(72,72,71,0.4)',
          paddingBottom: '1rem',
        },
        close: { color: '#ADAAAA' },
      }}
      centered
    >
      {success ? (
        <Stack align="center" py={32} gap="lg">
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(184,255,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(184,255,0,0.3)',
            }}
          >
            <CheckCircle size={36} color="#B8FF00" />
          </Box>
          <Text
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '1.5rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            Đăng Ký Thành Công!
          </Text>
          <Text style={{ color: '#ADAAAA', textAlign: 'center' }}>
            Chúng tôi sẽ liên hệ xác nhận thông tin qua email và số điện thoại của bạn.
          </Text>
          <Button
            onClick={handleClose}
            style={{ backgroundColor: '#B8FF00', color: '#486700', fontWeight: 700 }}
          >
            Đóng
          </Button>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" mt="sm">
            <Text
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '0.7rem',
                color: '#B8FF00',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Season 1 · 2026
            </Text>

            <TextInput
              label="Họ và Tên"
              placeholder="Nguyễn Văn A"
              required
              leftSection={<User size={16} color="#ADAAAA" />}
              styles={{ label: labelStyle }}
              {...form.getInputProps('full_name')}
            />

            <Group grow>
              <TextInput
                label="Số Điện Thoại"
                placeholder="0912 345 678"
                required
                leftSection={<Phone size={16} color="#ADAAAA" />}
                styles={{ label: labelStyle }}
                {...form.getInputProps('phone')}
              />
              <TextInput
                label="Email"
                placeholder="email@example.com"
                required
                leftSection={<Mail size={16} color="#ADAAAA" />}
                styles={{ label: labelStyle }}
                {...form.getInputProps('email')}
              />
            </Group>

            <Select
              label="Hạng Mục Thi Đấu"
              placeholder="Chọn hạng mục"
              required
              leftSection={<Users size={16} color="#ADAAAA" />}
              styles={{ label: labelStyle }}
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
                styles={{ label: labelStyle }}
                {...form.getInputProps('partner_name')}
              />
            )}

            <Textarea
              label="Ghi Chú (Tùy chọn)"
              placeholder="Thông tin thêm, yêu cầu đặc biệt..."
              styles={{ label: labelStyle }}
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Divider style={{ borderColor: 'rgba(72,72,71,0.4)' }} mt="xs" />

            <Group gap="xs" wrap="wrap">
              {['Thi đấu 1vs1 & 2vs2', 'Trọng tài chuyên nghiệp', 'Giải thưởng hấp dẫn'].map(
                (item) => (
                  <Group key={item} gap={6}>
                    <CheckCircle size={14} color="#B8FF00" />
                    <Text
                      style={{
                        fontSize: '0.75rem',
                        color: '#ADAAAA',
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {item}
                    </Text>
                  </Group>
                )
              )}
            </Group>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              style={{
                backgroundColor: '#B8FF00',
                color: '#486700',
                fontFamily: 'var(--font-space-grotesk)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                boxShadow: '0 10px 30px rgba(184,255,0,0.15)',
                marginTop: 8,
              }}
            >
              {loading ? 'ĐANG GỬI...' : '[ ĐĂNG KÝ NGAY ]'}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
