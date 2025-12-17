import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import CreatePage from "@/pages/createpage";
import DetailPage from "@/pages/detailpage";
import LoginPage from "@/pages/loginpage";
import MainPage from "@/pages/mainpage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MainPage /> },
      { path: ":id", element: <DetailPage /> },
      { path: "new", element: <CreatePage /> },
      { path: "new/:id", element: <CreatePage /> },
    ],
  },
]);

export default router;
