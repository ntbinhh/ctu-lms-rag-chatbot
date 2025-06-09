import React from "react";
import AddTrainingFacilityForm from "../components/AddTrainingFacilityForm";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const FacilitiesPage = () => {
  return (
    <div className="facilities-page">
      <AdminHeader />
      
      <AddTrainingFacilityForm />
      <AdminFooter />
    </div>
    
  );
};

export default FacilitiesPage;
