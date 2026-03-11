'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, notificationApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { User, NotificationSettings } from '@/types';
import { NOTIFICATION_TYPES } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const otpSchema = z.object({ otp: z.string().length(6) });
const disableTfaSchema = z.object({ password: z.string().min(1) });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [tfaStep, setTfaStep] = useState<'idle' | 'sent'>('idle');
  const [tfaMsg, setTfaMsg] = useState('');
  const queryClient = useQueryClient();

  // Profile form
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const updateProfile = async (data: ProfileData) => {
    const res = await authApi.updateProfile(data);
    updateUser(res as User);
    setProfileMsg('Profile updated.');
  };

  // Password form
  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });
  const changePassword = async (data: PasswordData) => {
    await authApi.changePassword(data);
    setPwMsg('Password changed.');
    passwordForm.reset();
  };

  // TFA
  const enableTfa = async () => {
    setTfaMsg('');
    await authApi.enableTfa();
    setTfaStep('sent');
    setTfaMsg('OTP sent to your email. Enter it below.');
  };

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  });
  const verifyTfa = async (data: z.infer<typeof otpSchema>) => {
    await authApi.verifyEnableTfa(data);
    updateUser({ ...user!, tfaEnabled: true });
    setTfaStep('idle');
    setTfaMsg('TFA enabled successfully.');
  };

  const disableForm = useForm<z.infer<typeof disableTfaSchema>>({
    resolver: zodResolver(disableTfaSchema),
  });
  const disableTfa = async (data: z.infer<typeof disableTfaSchema>) => {
    await authApi.disableTfa(data);
    updateUser({ ...user!, tfaEnabled: false });
    setTfaMsg('TFA disabled.');
    disableForm.reset();
  };

  // Notification settings
  const { data: notifSettings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const res = await notificationApi.getSettings();
      return res as NotificationSettings;
    },
  });

  const updateNotifSettings = useMutation({
    mutationFn: (data: { emailTypes?: string[]; socketTypes?: string[] }) =>
      notificationApi.updateSettings(data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['notification-settings'],
      }),
  });

  const toggleType = (channel: 'emailTypes' | 'socketTypes', type: string) => {
    if (!notifSettings) return;
    const current = notifSettings[channel] ?? [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateNotifSettings.mutate({ [channel]: updated });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Profile */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Personal Information</h2>
        <form
          onSubmit={profileForm.handleSubmit(updateProfile)}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input
                className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                {...profileForm.register('firstName')}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input
                className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                {...profileForm.register('lastName')}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
              value={user?.email ?? ''}
              disabled
            />
          </div>
          {profileMsg && <p className="text-green-600 text-sm">{profileMsg}</p>}
          <button
            type="submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Save changes
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit(changePassword)}
          className="space-y-3"
        >
          <div>
            <label className="text-sm font-medium">Current password</label>
            <input
              type="password"
              className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
              {...passwordForm.register('currentPassword')}
            />
          </div>
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
              {...passwordForm.register('newPassword')}
            />
          </div>
          {pwMsg && <p className="text-green-600 text-sm">{pwMsg}</p>}
          <button
            type="submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Update password
          </button>
        </form>
      </section>

      {/* TFA */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Status: {user?.tfaEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        {tfaMsg && (
          <p
            className={`text-sm ${user?.tfaEnabled ? 'text-green-600' : 'text-muted-foreground'}`}
          >
            {tfaMsg}
          </p>
        )}

        {!user?.tfaEnabled && tfaStep === 'idle' && (
          <button
            onClick={enableTfa}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Enable TFA
          </button>
        )}

        {!user?.tfaEnabled && tfaStep === 'sent' && (
          <form
            onSubmit={otpForm.handleSubmit(verifyTfa)}
            className="flex gap-2"
          >
            <input
              placeholder="000000"
              maxLength={6}
              className="rounded-md border bg-transparent px-3 py-2 text-sm w-32 text-center tracking-widest"
              {...otpForm.register('otp')}
            />
            <button
              type="submit"
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Verify OTP
            </button>
          </form>
        )}

        {user?.tfaEnabled && (
          <form
            onSubmit={disableForm.handleSubmit(disableTfa)}
            className="flex gap-2"
          >
            <input
              type="password"
              placeholder="Confirm password"
              className="rounded-md border bg-transparent px-3 py-2 text-sm"
              {...disableForm.register('password')}
            />
            <button
              type="submit"
              className="rounded-md bg-destructive text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Disable TFA
            </button>
          </form>
        )}
      </section>

      {/* Notification Preferences */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Notification Preferences</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Event</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Realtime</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map((type) => (
                <tr key={type} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground capitalize">
                    {type.replace(/\./g, ' ')}
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        notifSettings?.emailTypes?.includes(type) ?? false
                      }
                      onChange={() => toggleType('emailTypes', type)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        notifSettings?.socketTypes?.includes(type) ?? false
                      }
                      onChange={() => toggleType('socketTypes', type)}
                      className="rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
