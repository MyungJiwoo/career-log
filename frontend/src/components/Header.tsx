import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
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
        <Button onClick={() => navigate("/")} size="sm">
          지원 현황
        </Button>
        <Button onClick={handleLogout} size="sm">
          로그아웃
        </Button>
      </nav>
    </header>
  );
}
