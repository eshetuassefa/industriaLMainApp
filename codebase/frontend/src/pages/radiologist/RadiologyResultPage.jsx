import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const RadiologyResultPage = () => {
  const { requestId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await radiologyService.getReport(requestId);
        if (response.success) {
          setReport(response.data);
        } else {
          throw new Error(response.error?.message || "Failed to load report");
        }
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: err.message || "Failed to load report details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.report) {
      setReport(location.state.report);
      setLoading(false);
    } else {
      fetchReport();
    }
  }, [requestId, location.state, toast]);

  if (loading) return <div className="p-8 text-center">Loading report...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!report) return <div className="p-8 text-center">No report found</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Radiology Report Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>
          <strong>Request ID:</strong> {report.radiologyRequestId}
        </p>
        <p>
          <strong>Imaging Type:</strong> {report.imagingType}
        </p>
        <p>
          <strong>Body Part:</strong> {report.bodyPart}
        </p>
        <p>
          <strong>Report Text:</strong>{" "}
          {report.reportText || "No report text available"}
        </p>
        <p>
          <strong>Notes:</strong> {report.notes || "No notes available"}
        </p>
        <p>
          <strong>Report Date:</strong>{" "}
          {new Date(report.reportDate).toLocaleString()}
        </p>
        <p>
          <strong>Radiologist:</strong> {report.radiologist?.person?.firstName}{" "}
          {report.radiologist?.person?.lastName}
        </p>
        {report.imageUrls &&
          Array.isArray(report.imageUrls) &&
          report.imageUrls.length > 0 && (
            <div className="mt-4">
              <strong>Images:</strong>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {report.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={`${API_URL}${url}`} // Adjust based on your server URL
                    alt={`Report Image ${index + 1}`}
                    className="max-w-full h-auto rounded"
                  />
                ))}
              </div>
            </div>
          )}
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default RadiologyResultPage;
