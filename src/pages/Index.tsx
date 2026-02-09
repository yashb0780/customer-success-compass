import { QbrProvider } from "@/contexts/QbrContext";
import QbrDashboard from "@/pages/QbrDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <QbrProvider customerId="default">
      <QbrDashboard />
    </QbrProvider>
  );
};

export default Index;
