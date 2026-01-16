import { useNavigate } from "react-router-dom";

import axiosInstance from "@/apis/axiosInstance";

import Button from "./Button";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");
      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.log("로그아웃 실패: ", error);
    }
  };

  return (
    <header className="bg-black-800 text-white-200 w-full h-[7vh] sticky top-0 z-100 flex items-center justify-center">
      <nav className="max-w-240 w-full flex items-center justify-end gap-12">
        <Button size="sm" onClick={() => navigate("/")}>
          지원 현황
        </Button>
        <Button size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </nav>
    </header>
  );
}
