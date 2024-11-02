import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import RequestDetails from "./RequestDetails";
import "./App.css";

const App = () => {
  return (
    <>
      {/* FIXED_CONTENT */}

      <nav>
        <Link to="/">Payment Form</Link>
        {" | "}
        <Link to="/request-details">Request Details</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/request-details" element={<RequestDetails />} />
      </Routes>

      {/* FIXED_CONTENT */}
    </>
  );
};

export default App;
