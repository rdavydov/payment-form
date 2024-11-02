import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import RequestDetails from "./RequestDetails";
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    path: "/payment-form/",
    element: <App />,
    children: [
      {
        path: "/payment-form/",
        element: <PaymentForm />,
      },
      {
        path: "/payment-form/request-details",
        element: <RequestDetails />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
