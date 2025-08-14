import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Pause, Edit, Copy, Download, CheckCircle, Clock, X } from "lucide-react";
import { CampaignOverview } from "./CampaignOverview";
import { ProspectsTable } from "./ProspectsTable";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
}

interface CampaignDetailProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload", campaignInfo?: Partial<CampaignData>, cadenceData?: any, reportsView?: any) => void;
  campaignData: CampaignData;
}

export function CampaignDetail({ onNavigate, campaignData }: CampaignDetailProps) {
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

      {/* Campaign Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-semibold text-gray-900">
            {campaignData.campaignName || "Campaign Details"}
          </h1>
          <Badge className={`${
            campaignData.status === "active" 
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : campaignData.status === "paused"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }`}>
            {campaignData.status.charAt(0).toUpperCase() + campaignData.status.slice(1)}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <CampaignOverview campaignData={campaignData} />

      {/* Prospects Table */}
      <ProspectsTable />
    </div>
  );
}