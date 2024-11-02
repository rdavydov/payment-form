import { BrowserRouter as Routes, Route, Outlet } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import RequestDetails from "./RequestDetails";
import "./App.css";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/request-details" element={<RequestDetails />} />
      </Routes>

      <Outlet />
    </>
  );
};

export default App;
