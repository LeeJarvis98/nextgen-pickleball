'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Center, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { LockKeyhole, User } from 'lucide-react';
import styles from './AdminLoginForm.module.css';

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.trim().length < 1 ? 'Required' : null),
      password: (v) => (v.length < 1 ? 'Required' : null),
    },
  });

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const from = searchParams.get('from') ?? '/admin/dashboard';
      router.push(from);
      router.refresh();
    } catch {
      notifications.show({
        title: 'Access denied',
        message: 'Invalid username or password.',
        color: 'red',
      });
      form.setFieldValue('password', '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center className={styles.page}>
      <Box className={styles.card}>
        <Stack gap="xs" mb="xl" align="center">
          <Box className={styles.lockIcon}>
            <LockKeyhole size={28} color="#b8ff00" />
          </Box>
          <span className={styles.title}>ADMIN ACCESS</span>
          <span className={styles.subtitle}>NextGen Pickleball Series</span>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="admin"
              autoComplete="username"
              leftSection={<User size={16} color="#adaaaa" />}
              classNames={{ label: styles.inputLabel }}
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              autoComplete="current-password"
              leftSection={<LockKeyhole size={16} color="#adaaaa" />}
              classNames={{ label: styles.inputLabel }}
              {...form.getInputProps('password')}
            />
            <Button
              type="submit"
              loading={loading}
              fullWidth
              mt="xs"
              className={styles.submitButton}
            >
              {loading ? 'VERIFYING...' : '[ LOGIN ]'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}
