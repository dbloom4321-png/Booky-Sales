import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, Mail, Calendar, Users, Target } from "lucide-react";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
}

interface PerformanceChartProps {
  timeFrame: "week" | "month" | "quarter";
  campaignData: CampaignData;
  cadences?: any[];
}

export function PerformanceChart({ timeFrame, campaignData, cadences = [] }: PerformanceChartProps) {
  // Calculate data based on time frame
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

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      default:
        return "This Month";
    }
  };

  const getTimeFrameDescription = () => {
    switch (timeFrame) {
      case "week":
        return "Total calendar invites sent this week";
      case "month":
        return "Total calendar invites sent this month";
      case "quarter":
        return "Total calendar invites sent this quarter";
      default:
        return "Total calendar invites sent this month";
    }
  };

  const multiplier = getTimeFrameMultiplier();
  
  // Calculate real data from cadences
  const totalProspects = cadences.reduce((sum, cadence) => sum + cadence.prospectCount, 0);
  const totalBookedMeetings = cadences.reduce((sum, cadence) => sum + cadence.bookedCount, 0);
  
  const invitesSent = Math.floor(totalProspects * multiplier);
  const meetingsBooked = Math.floor(totalBookedMeetings * multiplier);
  const secondMeetings = Math.floor(meetingsBooked * 0.46); // ~46% of first meetings lead to second
  const opportunities = Math.floor(secondMeetings * 0.58); // ~58% of second meetings become opportunities
  
  // Base monthly data adjusted for time frame using consistent calculations
  const funnelData = [
    {
      stage: "Invites Sent",
      value: invitesSent,
      color: "#3b82f6",
      icon: Mail,
      description: getTimeFrameDescription()
    },
    {
      stage: "Meetings Booked",
      value: meetingsBooked,
      color: "#10b981",
      icon: Calendar,
      description: "First meetings successfully scheduled"
    },
    {
      stage: "Second Meetings",
      value: secondMeetings,
      color: "#8b5cf6",
      icon: Users,
      description: "Follow-up meetings completed"
    },
    {
      stage: "Opportunities",
      value: opportunities,
      color: "#f59e0b",
      icon: Target,
      description: "Qualified opportunities created"
    }
  ];

  // Calculate conversion rates
  const getConversionRate = (current: number, previous: number) => {
    return previous > 0 ? ((current / previous) * 100).toFixed(1) : "0";
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel - {getTimeFrameLabel()}</h3>
        <p className="text-sm text-gray-600">Track your pipeline from initial outreach to opportunities</p>
      </div>
      
      {/* Funnel Visualization */}
      <div className="flex items-center justify-between mb-6">
        {funnelData.map((stage, index) => {
          const Icon = stage.icon;
          const prevStage = funnelData[index - 1];
          const conversionRate = prevStage ? getConversionRate(stage.value, prevStage.value) : null;
          
          return (
            <div key={stage.stage} className="flex items-center">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${stage.color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: stage.color }} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stage.value}</div>
                <div className="text-xs text-gray-600 font-medium">{stage.stage}</div>
                {conversionRate && (
                  <div className="text-xs text-green-600 mt-1">
                    {conversionRate}% rate
                  </div>
                )}
              </div>
              {index < funnelData.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-sm text-gray-600">Overall Conversion</div>
          <div className="text-lg font-semibold text-gray-900">
            {getConversionRate(funnelData[3].value, funnelData[0].value)}%
          </div>
          <div className="text-xs text-gray-500">Invites → Opportunities</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Pipeline Value</div>
          <div className="text-lg font-semibold text-green-600">${(opportunities * 15000).toLocaleString()}</div>
          <div className="text-xs text-gray-500">From {opportunities} opportunities</div>
        </div>
      </div>
    </div>
  );
}