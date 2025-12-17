import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import axiosInstance from "./apis/axiosInstance";
import Header from "./components/Header";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const verifyToken = async () => {
    try {
      const res = await axiosInstance.post("/auth/verify-token");
      setIsAuthenticated(res.data.isValid);
    } catch (error) {
      console.log("토큰 인증 실패: ", error);
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
    <Navigate replace to="/login" />
  ) : (
    <div className="flex flex-col items-center bg-white-200">
      <Header />
      <main className="max-w-240 w-full my-[5vh] min-h-[83vh] flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
