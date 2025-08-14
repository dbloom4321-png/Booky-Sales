import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MetricsCards } from "./MetricsCards";
import { PerformanceChart } from "./PerformanceChart";
import { UpcomingMeetings } from "./UpcomingMeetings";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
}

interface DashboardContentProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload", campaignInfo?: Partial<CampaignData>, cadenceData?: any, reportsView?: any) => void;
  campaignData: CampaignData;
  cadences: any[];
}

export function DashboardContent({ onNavigate, campaignData, cadences }: DashboardContentProps) {
  const [timeFrame, setTimeFrame] = useState<"week" | "month" | "quarter">("month");

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Main Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gray-400 text-white">U</AvatarFallback>
        </Avatar>
      </div>

      {/* Cadence Performance Section Header with Time Frame Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Cadence Performance</h2>
        <Select value={timeFrame} onValueChange={(value: "week" | "month" | "quarter") => setTimeFrame(value)}>
          <SelectTrigger className="w-40 bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
              This Week
            </SelectItem>
            <SelectItem value="month" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
              This Month
            </SelectItem>
            <SelectItem value="quarter" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
              This Quarter
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <MetricsCards campaignData={campaignData} timeFrame={timeFrame} cadences={cadences} />

      {/* Performance Chart */}
      <div className="mb-8">
        <PerformanceChart timeFrame={timeFrame} campaignData={campaignData} cadences={cadences} />
      </div>

      {/* Upcoming Meetings */}
      <UpcomingMeetings onNavigate={onNavigate} />
    </div>
  );
}