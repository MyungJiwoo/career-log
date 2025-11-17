import { useState } from "react";
import axios from "axios";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.user) {
        navigate("/");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("로그인 실패:", error.response?.data || error.message);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };
  return (
    <div className="w-100">
      <form className="bg-white-100 rounded-2xl w-full p-5 gap-4 flex flex-col">
        <h1 className="text-2xl font-bold text-black-900 mb-4">로그인</h1>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">아이디</FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <Input
                id="password"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                required
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button onClick={handleSubmit} className="w-full mt-8">
          로그인하기
        </Button>
      </form>
    </div>
  );
}
