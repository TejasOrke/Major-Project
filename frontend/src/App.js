import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentDetails from "./pages/StudentDetails";
import LORList from "./pages/LORList";
import AddStudent from "./pages/AddStudent"; // Add this import
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterRequest from "./pages/RegisterRequest";
import ApproveUser from "./pages/ApproveUser";
import AddInternship from "./pages/AddInternship";
import Internships from "./pages/Internships";
import Placements from "./pages/Placements";
import AddPlacement from "./pages/AddPlacement";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-request" element={<RegisterRequest />} />
        <Route path="/approve-user" element={<ApproveUser />} />
        <Route element={<ProtectedRoute />}>
        <Route path="/add-placement" element={<AddPlacement />} />
<Route path="/add-placement/:studentId" element={<AddPlacement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/:id" element={<StudentDetails />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/lors" element={<LORList />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/add-internship" element={<AddInternship />} />
          <Route path="/add-internship/:studentId" element={<AddInternship />} />
        </Route>
      </Routes>
    </Router>
  );
}