import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-black-800 text-white-200 w-full h-[7vh] sticky top-0 z-100 flex items-center justify-center">
      <nav className="max-w-240 w-full flex items-center justify-end gap-16">
        <NavLink to="/">지원 현황</NavLink>
        <p className="cursor-pointer">지원 예정</p>
      </nav>
    </header>
  );
}
