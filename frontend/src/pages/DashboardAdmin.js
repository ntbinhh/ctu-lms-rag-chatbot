import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

export default function DashboardAdmin() {
  return (
    <>
      <AdminHeader />
      <main className="p-4">
        <h2>🛠️ Dashboard Admin</h2>
        {/* Nội dung quản trị */}
      </main>
      <AdminFooter />
    </>
  );
}