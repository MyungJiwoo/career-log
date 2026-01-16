import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import axiosInstance from './apis/axiosInstance';
import Header from './components/Header';

const queryClient = new QueryClient();

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const verifyToken = async () => {
    try {
      const res = await axiosInstance.post('/auth/verify-token');
      setIsAuthenticated(res.data.isValid);
    } catch (error) {
      console.log('토큰 인증 실패: ', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return !isAuthenticated ? (
    <Navigate replace to='/login' />
  ) : (
    <QueryClientProvider client={queryClient}>
      <div className='bg-white-200 flex flex-col items-center'>
        <Header />
        <main className='my-[5vh] flex min-h-[83vh] w-full max-w-240 justify-center'>
          <Outlet />
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
