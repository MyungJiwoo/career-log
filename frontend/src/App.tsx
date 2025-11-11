import { Outlet } from "react-router-dom";
import Header from "./components/Header";

export function App() {
  return (
    <div className="flex flex-col items-center bg-white-200">
      <Header />
      <main className="max-w-240 w-full my-[5vh] min-h-[83vh] flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
