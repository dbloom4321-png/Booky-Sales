import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, Plus, Trash2, Copy, ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";

interface CadencesPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "edit-cadence" | "clone-cadence" | "prospect-upload", campaignInfo?: Partial<{ prospectCount: number; campaignName: string; status: "active" | "paused" | "completed" }>, cadenceData?: Cadence) => void;
  cadences: Cadence[];
  onDeleteCadence: (id: number) => void;
}

interface Cadence {
  id: number;
  name: string;
  steps: number;
  assigned: string;
  bookedMeetings: string;
  bookedCount: number;
  prospectCount: number;
  status: string;
  statusType: "active" | "completed";
  dateCreated: string;
  dateFinished: string | null;
}

type SortField = "name" | "steps" | "assigned" | "bookedMeetings" | "status" | "bookingRate" | "dateCreated" | "dateFinished";
type SortDirection = "asc" | "desc";

export function CadencesPage({ onNavigate, cadences, onDeleteCadence }: CadencesPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cadenceToDelete, setCadenceToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("dateCreated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleDeleteClick = (id: number) => {
    setCadenceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cadenceToDelete) {
      onDeleteCadence(cadenceToDelete);
      console.log(`Deleted cadence ${cadenceToDelete}`);
    }
    setDeleteDialogOpen(false);
    setCadenceToDelete(null);
  };

  const handleCopyCadence = (id: number) => {
    const cadenceToCopy = cadences.find(c => c.id === id);
    if (cadenceToCopy) {
      // Navigate to clone cadence page instead of directly creating a copy
      onNavigate("clone-cadence", undefined, cadenceToCopy);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedCadences = () => {
    return [...cadences].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "steps":
          aValue = a.steps;
          bValue = b.steps;
          break;
        case "assigned":
          aValue = a.assigned.toLowerCase();
          bValue = b.assigned.toLowerCase();
          break;
        case "bookedMeetings":
          aValue = a.bookedCount;
          bValue = b.bookedCount;
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "bookingRate":
          aValue = calculateBookingPercentage(a.bookedCount, a.prospectCount);
          bValue = calculateBookingPercentage(b.bookedCount, b.prospectCount);
          break;
        case "dateCreated":
          aValue = new Date(a.dateCreated);
          bValue = new Date(b.dateCreated);
          break;
        case "dateFinished":
          aValue = a.dateFinished ? new Date(a.dateFinished) : new Date(0);
          bValue = b.dateFinished ? new Date(b.dateFinished) : new Date(0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const calculateBookingPercentage = (bookedCount: number, prospectCount: number) => {
    if (prospectCount === 0) return 0;
    return Math.round((bookedCount / prospectCount) * 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {children}
      <div className="flex flex-col">
        <ChevronUp 
          className={`h-3 w-3 ${
            sortField === field && sortDirection === "asc" 
              ? "text-blue-600" 
              : "text-gray-300"
          }`} 
        />
        <ChevronDown 
          className={`h-3 w-3 -mt-1 ${
            sortField === field && sortDirection === "desc" 
              ? "text-blue-600" 
              : "text-gray-300"
          }`} 
        />
      </div>
    </button>
  );

  const getStatusBadge = (statusType: "active" | "completed", status: string) => {
    if (statusType === "active") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
        {status}
      </Badge>
    );
  };

  const CadenceActionButtons = ({ cadence }: { 
    cadence: Cadence
  }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        onClick={() => handleDeleteClick(cadence.id)}
        title="Delete cadence"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        onClick={() => handleCopyCadence(cadence.id)}
        title="Clone cadence"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
          onClick={() => onNavigate("dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-900">Cadences</h1>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={() => onNavigate("new-cadence")}
          >
            <Plus className="h-4 w-4" />
            New Cadence
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Cadences Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="name">Name</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="steps">Steps</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="assigned">Assigned</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="bookedMeetings">Booked Meetings</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="bookingRate">Booking Rate</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="dateCreated">Date Created</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="dateFinished">Date Finished</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedCadences().map((cadence, index) => (
                <tr key={cadence.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate("cadence-detail", undefined, cadence)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                      >
                        {cadence.name}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{cadence.steps}</td>
                  <td className="p-4 text-gray-600">{cadence.assigned}</td>
                  <td className="p-4 text-gray-600">{cadence.bookedMeetings}</td>
                  <td className="p-4">
                    {getStatusBadge(cadence.statusType, cadence.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">
                        {calculateBookingPercentage(cadence.bookedCount, cadence.prospectCount)}%
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({cadence.bookedCount}/{cadence.prospectCount})
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{formatDate(cadence.dateCreated)}</td>
                  <td className="p-4 text-gray-600">{formatDate(cadence.dateFinished)}</td>
                  <td className="p-4">
                    <CadenceActionButtons cadence={cadence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setDeleteDialogOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure you want to delete?
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the cadence
                {cadenceToDelete && cadences.find(c => c.id === cadenceToDelete)?.name && 
                  ` "${cadences.find(c => c.id === cadenceToDelete)?.name}"`
                } and remove all associated data.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}