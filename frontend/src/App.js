import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentDetails from "./pages/StudentDetails";
import LORList from "./pages/LORList";  // Add this import
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/:id" element={<StudentDetails />} />
          <Route path="/lors" element={<LORList />} />  {/* Add this route */}
        </Route>
      </Routes>
    </Router>
  );
}