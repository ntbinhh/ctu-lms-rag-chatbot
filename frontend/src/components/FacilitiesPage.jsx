import React from "react";
import AddTrainingFacilityForm from "../components/AddTrainingFacilityForm";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const FacilitiesPage = () => {
  return (
    <div className="facilities-page">
        <AdminHeader />
      <h1>Danh sách Cơ sở liên kết đào tạo</h1>
      <AddTrainingFacilityForm />
      <AdminFooter />
    </div>
    
  );
};

export default FacilitiesPage;
