import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
        </div>
      </div>
    </div>
  );
}
