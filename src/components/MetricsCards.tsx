import { Card, CardContent } from "./ui/card";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
}

interface MetricsCardsProps {
  campaignData: CampaignData;
  timeFrame: "week" | "month" | "quarter";
  cadences?: any[];
}

export function MetricsCards({ campaignData, timeFrame, cadences = [] }: MetricsCardsProps) {
  // Calculate real metrics from cadences data
  const totalProspects = cadences.reduce((sum, cadence) => sum + cadence.prospectCount, 0);
  const totalBookedMeetings = cadences.reduce((sum, cadence) => sum + cadence.bookedCount, 0);
  const activeCadences = cadences.filter(cadence => cadence.statusType === "active").length;
  
  // Calculate metrics based on time frame
  const getTimeFrameMultiplier = () => {
    switch (timeFrame) {
      case "week":
        return 0.25; // ~1/4 of monthly data
      case "month":
        return 1;
      case "quarter":
        return 3;
      default:
        return 1;
    }
  };

  const multiplier = getTimeFrameMultiplier();
  const invitesSent = Math.floor(totalProspects * multiplier);
  const meetingsBooked = Math.floor(totalBookedMeetings * multiplier);
  const bookRate = totalProspects > 0 ? ((totalBookedMeetings / totalProspects) * 100).toFixed(1) + "%" : "0%";
  
  const metrics = [
    {
      value: meetingsBooked.toString(),
      label: "Meetings booked",
    },
    {
      value: bookRate,
      label: "Book rate",
    },
    {
      value: activeCadences.toString(),
      label: "Active cadences",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6">
          <CardContent className="p-0">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <div className="text-gray-600">
              {metric.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}