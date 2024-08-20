import Login from "./login";
import App from "./App";
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/todos",
      element: <App />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};
export default Body;
