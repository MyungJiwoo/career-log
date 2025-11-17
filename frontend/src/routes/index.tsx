import { createBrowserRouter } from "react-router-dom";
import DetailPage from "@/pages/detailpage";
import MainPage from "@/pages/mainpage";
import CreatePage from "@/pages/createpage";
import App from "@/App";
import LoginPage from "@/pages/loginpage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MainPage /> },
      { path: ":id", element: <DetailPage /> },
      { path: "new", element: <CreatePage /> },
      { path: "new/:id", element: <CreatePage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
]);

export default router;
