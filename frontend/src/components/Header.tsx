export default function Header() {
  return (
    <header className="bg-black-800 text-white-200 w-full h-[7vh] sticky top-0  flex items-center justify-center">
      <div className="max-w-240 w-full flex items-center justify-end gap-16">
        <p className="cursor-pointer">지원 현황</p>
        <p className="cursor-pointer">지원 예정</p>
      </div>
    </header>
  );
}
