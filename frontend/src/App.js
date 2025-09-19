import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentDetails from "./pages/StudentDetails";
import LORList from "./pages/LORList";
import AddStudent from "./pages/AddStudent";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterRequest from "./pages/RegisterRequest";
import ApproveUser from "./pages/ApproveUser";
import AddInternship from "./pages/AddInternship";
import StudentHome from "./pages/StudentHome";
import Internships from "./pages/Internships";
import Placements from "./pages/Placements";
import AddPlacement from "./pages/AddPlacement";
import LORTemplates from "./pages/LORTemplates";
import LORDetail from "./pages/LORDetail";
import SmartLORGenerator from "./pages/SmartLORGenerator";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-request" element={<RegisterRequest />} />
        <Route path="/approve-user" element={<ApproveUser />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/smart-lor/:studentId" element={<SmartLORGenerator />} />
          <Route path="/student-home" element={<StudentHome />} />
          <Route path="/lor-templates" element={<LORTemplates />} />
          <Route path="/lor/:id" element={<LORDetail />} />
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
          <Route
            path="/add-internship/:studentId"
            element={<AddInternship />}
          />
        </Route>
      </Routes>
    </Router>
  );
}
