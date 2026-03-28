import { useParams } from "react-router-dom";
import PropertyForm from "@/components/PropertyForm";

const PropertyEdit = () => {
  const { id } = useParams<{ id: string }>();
  return <PropertyForm propertyId={id} />;
};

export default PropertyEdit;
