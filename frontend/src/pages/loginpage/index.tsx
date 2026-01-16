import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ErrorResponse } from '@/apis/axiosInstance';
import { login } from '@/apis/http';
import Button from '@/components/Button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loginError, setLoginError] = useState<{
    message: string;
    remainingAttempts?: number;
  } | null>(null);

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.user) {
        navigate('/');
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError<ErrorResponse>(error)) {
        const serverData = error.response?.data;
        setLoginError({
          message: serverData?.message || '로그인에 실패했습니다.',
          remainingAttempts: serverData?.remainingAttempts,
        });
      } else {
        setLoginError({ message: '네트워크 오류가 발생했습니다.' });
      }
    },
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    loginMutation.mutate(formData);
  };

  return (
    <div className='bg-white-200 flex h-screen w-screen items-center justify-center'>
      <form className='bg-white-100 flex w-100 flex-col gap-6 rounded-2xl p-5' onSubmit={handleSubmit}>
        <h1 className='text-black-900 text-2xl font-bold'>Career Log</h1>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='username'>아이디</FieldLabel>
              <Input
                required
                className='border-white-200 rounded-lg border px-2 py-1 shadow-none'
                id='username'
                name='username'
                type='text'
                value={formData.username}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='password'>비밀번호</FieldLabel>
              <Input
                required
                autoComplete='off'
                className='border-white-200 rounded-lg border px-2 py-1 shadow-none'
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {loginError && (
          <div className='rounded-lg bg-red-50 p-4 text-center text-sm text-red-500'>
            <div>{loginError.message}</div>
            {loginError.remainingAttempts !== undefined && (
              <div className='mt-1 font-semibold'>남은 시도 횟수: {loginError.remainingAttempts}회</div>
            )}
          </div>
        )}

        <Button className='w-full' disabled={loginMutation.isPending} type='submit'>
          {loginMutation.isPending ? '로그인 중...' : '로그인하기'}
        </Button>
      </form>
    </div>
  );
}
