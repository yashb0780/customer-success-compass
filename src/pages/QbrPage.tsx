import { useParams } from "react-router-dom";
import { QbrProvider } from "@/contexts/QbrContext";
import QbrDashboard from "@/pages/QbrDashboard";

export default function QbrPage() {
  const { customerId } = useParams();
  return (
    <QbrProvider customerId={customerId || "default"}>
      <QbrDashboard />
    </QbrProvider>
  );
}
