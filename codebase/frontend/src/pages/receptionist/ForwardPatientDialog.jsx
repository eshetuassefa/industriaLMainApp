import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";

const ForwardPatientDialog = ({
  showForwardDialog,
  setShowForwardDialog,
  forwardDetails,
  setForwardDetails,
  handleForwardSubmit,
  departments,
}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all staff members when component mounts
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllStaff();
        if (response.success) {
          // Ensure backendData is an array
          let backendData = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

          // Additional check if backendData is still not an array
          if (!Array.isArray(backendData)) {
            console.warn("backendData is not an array:", backendData);
            backendData = [];
          }

          // Transform and filter healthcare providers
          const healthcareProviders = backendData
            .filter(staff => staff.role === "HEALTHCARE_PROVIDER")
            .map(staff => ({
              id: staff.id,
              name: `${staff.person?.firstName || ''} ${staff.person?.lastName || ''}`.trim(),
              department: staff.department?.name || '',
            }));
          setProviders(healthcareProviders);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter providers based on selected department
  const filteredProviders = forwardDetails.department
    ? providers.filter((p) => p.department === forwardDetails.department)
    : providers;

  return (
    <Dialog
      open={showForwardDialog}
      onOpenChange={(open) => {
        setShowForwardDialog(open);
        if (!open) {
          setForwardDetails({
            patientId: "",
            providerId: "",
            department: "",
            reason: "",
            priority: "normal",
          });
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Forward Patient</DialogTitle>
          <DialogDescription>
            Forward the patient to a provider.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={forwardDetails.department}
              onValueChange={(value) => {
                setForwardDetails({ 
                  ...forwardDetails, 
                  department: value,
                  providerId: "", // Reset provider when department changes
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {(departments || []).map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Healthcare Provider *</Label>
            <Select
              value={forwardDetails.providerId}
              onValueChange={(value) => {
                setForwardDetails({ 
                  ...forwardDetails, 
                  providerId: value,
                });
              }}
              disabled={!forwardDetails.department || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading providers..." : "Select provider"} />
              </SelectTrigger>
              <SelectContent>
                {filteredProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={forwardDetails.reason}
              onChange={(e) =>
                setForwardDetails({ ...forwardDetails, reason: e.target.value })
              }
              placeholder="Enter reason for forwarding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={forwardDetails.priority}
              onValueChange={(value) =>
                setForwardDetails({ ...forwardDetails, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowForwardDialog(false);
              setForwardDetails({
                patientId: "",
                providerId: "",
                department: "",
                reason: "",
                priority: "normal",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForwardSubmit}
            disabled={
              !forwardDetails.providerId ||
              !forwardDetails.department ||
              !forwardDetails.reason
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Forward Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardPatientDialog;
