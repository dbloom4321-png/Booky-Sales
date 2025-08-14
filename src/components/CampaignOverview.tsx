import { Card, CardContent } from "./ui/card";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
}

interface CampaignOverviewProps {
  campaignData: CampaignData;
}

export function CampaignOverview({ campaignData }: CampaignOverviewProps) {
  // Calculate dynamic metrics based on actual prospect count
  const invitesSent = campaignData.prospectCount > 0 ? campaignData.prospectCount : 112;
  const bookedMeetings = Math.floor(invitesSent * 0.30); // 30% book rate
  const tentativeMeetings = Math.floor(invitesSent * 0.16); // 16% tentative rate
  const bookingRate = invitesSent > 0 ? Math.round((bookedMeetings / invitesSent) * 100) + "%" : "30%";
  
  const metrics = [
    {
      label: "Invites Sent",
      value: invitesSent.toString(),
    },
    {
      label: "Booked Meetings",
      value: bookedMeetings.toString(),
    },
    {
      label: "Tentative Meetings",
      value: tentativeMeetings.toString(),
    },
    {
      label: "Booking Rate",
      value: `${bookingRate} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Campaign Overview</h2>
      
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="text-gray-600 mb-2">{metric.label}</div>
                <div className="text-3xl font-semibold text-gray-900">{metric.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}