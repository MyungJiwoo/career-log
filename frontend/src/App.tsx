import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import axios from "axios";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const verifyToken = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/verify-token",
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(true);
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
    <Navigate to="/login" replace />
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
