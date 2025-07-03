import ManagerHeader from "../components/manager/ManagerHeader";
import AdminFooter from "../components/AdminFooter";

export default function DashboardAdmin() {
  return (
    <>
      <ManagerHeader />
      <main className="p-4">
        <h2>Trang quản lý</h2>
        {/* Nội dung quản trị */}
      </main>
      <AdminFooter />
    </>
  );
}