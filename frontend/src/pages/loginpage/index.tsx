import { useState } from "react";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/apis/axiosInstance";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<
    | {
        message: string;
        remainingAttempts: number;
      }
    | string
  >();

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("/auth/login", formData);

      if (response.data.user) {
        navigate("/");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // console.error("로그인 실패:", error.response?.data || error.message);
      const remainingAttempts = error.response.data.remainingAttempts;
      setError({
        message: error.response.data.message,
        remainingAttempts: remainingAttempts,
      });
    }
  };
  return (
    <div className=" bg-white-200 w-screen h-screen flex justify-center items-center">
      <form className="w-100 bg-white-100 rounded-2xl p-5 gap-6 flex flex-col">
        <h1 className="text-2xl font-bold text-black-900">Career Log</h1>
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
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="off"
                className="border rounded-lg px-2 py-1 border-white-200 shadow-none"
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {error && (
          <div className="p-4 text-center text-red-500 rounded-lg bg-red-50 text-sm">
            {typeof error === "string" ? error : error.message}

            {typeof error !== "string" &&
              error.remainingAttempts !== undefined && (
                <div>남은 시도 횟수: {error.remainingAttempts}회</div>
              )}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">
          로그인하기
        </Button>
      </form>
    </div>
  );
}
