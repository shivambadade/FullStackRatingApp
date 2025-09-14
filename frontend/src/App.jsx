import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StoreDashboard from "./pages/StoreDashboard";
import UserDashboard from "./pages/UserDashboard";
import Signup from "./pages/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/signupbyuser" element={<Signup />} />
      <Route path="/store-dashboard" element={<StoreDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

export default App;
