import { Badge } from "./ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface UpcomingMeetingsProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload", campaignInfo?: { prospectCount: number; campaignName: string; status: "active" | "paused" | "completed" }, cadenceData?: any, reportsView?: any) => void;
}

export function UpcomingMeetings({ onNavigate }: UpcomingMeetingsProps) {
  const meetings = [
    {
      status: "Accepted",
      prospect: "Sarah Alvarez",
      company: "TechFlow Solutions",
      dateTime: "Aug 1, 10:30am",
      campaign: "Q3 FinTech Blitz",
      statusType: "accepted" as const,
    },
    {
      status: "Tentative",
      prospect: "Brian Koenig",
      company: "RevOps Inc",
      dateTime: "Aug 1, 1:00pm",
      campaign: "RevOps Campaign",
      statusType: "tentative" as const,
    },
    {
      status: "Accepted",
      prospect: "Dana Michaels",
      company: "Growth Labs",
      dateTime: "Aug 2, 3:00pm",
      campaign: "DreamForce Conference",
      statusType: "accepted" as const,
    },
    {
      status: "Accepted",
      prospect: "Marcus Chen",
      company: "CloudScale Dynamics",
      dateTime: "Aug 2, 9:00am",
      campaign: "Enterprise Outreach",
      statusType: "accepted" as const,
    },
    {
      status: "Tentative",
      prospect: "Jennifer Wu",
      company: "StartupBoost",
      dateTime: "Aug 2, 11:30am",
      campaign: "Q3 FinTech Blitz",
      statusType: "tentative" as const,
    },
    {
      status: "Accepted",
      prospect: "Robert Thompson",
      company: "GlobalTech Systems",
      dateTime: "Aug 3, 2:00pm",
      campaign: "Enterprise Outreach",
      statusType: "accepted" as const,
    },
    {
      status: "Accepted",
      prospect: "Amanda Rodriguez",
      company: "InnovateLabs",
      dateTime: "Aug 3, 4:30pm",
      campaign: "DreamForce Conference",
      statusType: "accepted" as const,
    },
    {
      status: "Tentative",
      prospect: "David Kim",
      company: "FutureVision Corp",
      dateTime: "Aug 4, 10:00am",
      campaign: "RevOps Campaign",
      statusType: "tentative" as const,
    },
    {
      status: "Accepted",
      prospect: "Lisa Patel",
      company: "DataDriven Solutions",
      dateTime: "Aug 4, 1:15pm",
      campaign: "Q3 FinTech Blitz",
      statusType: "accepted" as const,
    },
    {
      status: "Tentative",
      prospect: "Michael Johnson",
      company: "ScaleUp Ventures",
      dateTime: "Aug 5, 9:30am",
      campaign: "Enterprise Outreach",
      statusType: "tentative" as const,
    },
    {
      status: "Accepted",
      prospect: "Emily Zhang",
      company: "NextGen Analytics",
      dateTime: "Aug 5, 3:00pm",
      campaign: "DreamForce Conference",
      statusType: "accepted" as const,
    },
    {
      status: "Accepted",
      prospect: "Alex Morrison",
      company: "DigitalFirst Inc",
      dateTime: "Aug 6, 11:00am",
      campaign: "Q3 FinTech Blitz",
      statusType: "accepted" as const,
    },
  ];

  const getStatusIcon = (statusType: "accepted" | "tentative") => {
    if (statusType === "accepted") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (statusType: "accepted" | "tentative", status: string) => {
    if (statusType === "accepted") {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Meetings</h2>
      </div>
      
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-600 bg-white">Status</th>
              <th className="text-left p-4 font-medium text-gray-600 bg-white">Prospect</th>
              <th className="text-left p-4 font-medium text-gray-600 bg-white">Date / Time</th>
              <th className="text-left p-4 font-medium text-gray-600 bg-white">Campaign</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(meeting.statusType)}
                    {getStatusBadge(meeting.statusType, meeting.status)}
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900">{meeting.prospect}</div>
                    <div className="text-sm text-gray-500">{meeting.company}</div>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{meeting.dateTime}</td>
                <td className="p-4">
                  <button 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => {
                      // Pass campaign-specific data based on the campaign name
                      const getCampaignInfo = (campaignName: string) => {
                        switch (campaignName) {
                          case "Q3 FinTech Blitz":
                            return { prospectCount: 150, status: "active" as const };
                          case "RevOps Campaign":
                            return { prospectCount: 75, status: "active" as const };
                          case "DreamForce Conference":
                            return { prospectCount: 45, status: "active" as const };
                          case "Enterprise Outreach":
                            return { prospectCount: 120, status: "active" as const };
                          default:
                            return { prospectCount: 50, status: "active" as const };
                        }
                      };
                      
                      const campaignInfo = {
                        campaignName: meeting.campaign,
                        ...getCampaignInfo(meeting.campaign)
                      };
                      onNavigate("campaign-detail", campaignInfo);
                    }}
                  >
                    {meeting.campaign}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}