import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentDetails from "./pages/StudentDetails";
import LORList from "./pages/LORList";  // Add this import
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterRequest from "./pages/RegisterRequest";
import ApproveUser from "./pages/ApproveUser";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-request" element={<RegisterRequest />} />
        <Route path="/approve-user" element={<ApproveUser />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/:id" element={<StudentDetails />} />
          <Route path="/lors" element={<LORList />} />
        </Route>
      </Routes>
    </Router>
  );
}