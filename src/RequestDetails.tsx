import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RequestDetails = () => {
  const location = useLocation();
  const { requestBody } = location.state || {};

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full p-6 bg-white rounded-lg">
        <h1 className="text-xl font-semibold mb-6">Детали запроса</h1>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(requestBody, null, 2)}
        </pre>
        <div className="flex space-x-4 mt-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            Вернуться
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RequestDetails;
