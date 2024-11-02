import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import RequestDetails from "./RequestDetails";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/request-details" element={<RequestDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
