import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  ArrowLeft, 
  Download, 
  BarChart3,
  Settings,
  UserCheck,
  Calendar as CalendarIcon,
  Users2,
  PersonStanding,
  Eye,
  Copy,
  Plus,
  User,
  Edit2,
  Save,
  Trash2,
  Send,
  RefreshCw,
  Bell
} from "lucide-react";

interface ReportsPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "reports" | "account-settings" | "meetings", campaignInfo?: any, cadenceData?: any, reportsView?: "management-reports" | "meeting-links" | "dashboard") => void;
  onGoBack?: () => void;
  initialView?: "management-reports" | "meeting-links" | "dashboard";
  cadences?: any[];
  campaignData?: any;
}

interface IndividualReportFrequency {
  weekly: boolean;
  monthly: boolean;
  quarterly: boolean;
}

interface ManagementEmail {
  id: number;
  email: string;
  name: string;
  title: string;
  frequencies: IndividualReportFrequency;
}

interface RepPerformance {
  name: string;
  email: string;
  invitesSent: number;
  meetings: number;
  secondMeetings: number;
  opportunities: number;
  pipelineValue: number;
  rank: number;
}

export function ReportsPage({ onNavigate, onGoBack, initialView, cadences = [], campaignData }: ReportsPageProps) {
  // Both meeting-links and management-reports should ALWAYS show the same unified management interface
  // Only "dashboard" should show the analytics view
  const shouldShowManagement = initialView === "meeting-links" || initialView === "management-reports";
  const [activeView, setActiveView] = useState<"analytics" | "management">(
    shouldShowManagement ? "management" : "analytics"
  );
  const [timeFrame, setTimeFrame] = useState<"week" | "month" | "quarter">("month");

  // Rep performance data
  const repPerformanceData: RepPerformance[] = [
    {
      name: "You",
      email: "you@company.com",
      invitesSent: 259,
      meetings: 15,
      secondMeetings: 8,
      opportunities: 4,
      pipelineValue: 100000,
      rank: 1
    },
    {
      name: "Sarah M.",
      email: "sarah.martinez@company.com",
      invitesSent: 167,
      meetings: 7,
      secondMeetings: 3,
      opportunities: 2,
      pipelineValue: 45000,
      rank: 2
    },
    {
      name: "Mike R.",
      email: "mike.rodriguez@company.com",
      invitesSent: 98,
      meetings: 4,
      secondMeetings: 1,
      opportunities: 1,
      pipelineValue: 15000,
      rank: 3
    }
  ];

  // Management reporting state
  const [managementEmails, setManagementEmails] = useState<ManagementEmail[]>([
    { 
      id: 1, 
      email: "ceo@company.com", 
      name: "Sarah Johnson", 
      title: "CEO",
      frequencies: { weekly: false, monthly: true, quarterly: true }
    },
    { 
      id: 2, 
      email: "vp.sales@company.com", 
      name: "Mike Chen", 
      title: "VP of Sales",
      frequencies: { weekly: true, monthly: true, quarterly: true }
    }
  ]);

  const [selectedRecipientId, setSelectedRecipientId] = useState<number | "new">(managementEmails[0]?.id || "new");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFrequencies, setNewFrequencies] = useState<IndividualReportFrequency>({
    weekly: false,
    monthly: true,
    quarterly: false
  });
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update view whenever initialView changes - ensure both meeting-links and management-reports show management view
  useEffect(() => {
    const shouldShowMgmt = initialView === "meeting-links" || initialView === "management-reports";
    setActiveView(shouldShowMgmt ? "management" : "analytics");
  }, [initialView]);

  // Handle navigation to Analytics Dashboard
  const handleAnalyticsNavigation = () => {
    setActiveView("analytics");
    onNavigate("reports", undefined, undefined, "dashboard");
  };

  // Handle navigation to Management Reports (this covers both meeting-links and management-reports)
  const handleManagementNavigation = () => {
    setActiveView("management");
    onNavigate("reports", undefined, undefined, "management-reports");
  };

  // Handle navigation to Meeting Links specifically  
  const handleMeetingLinksNavigation = () => {
    setActiveView("management");
    onNavigate("reports", undefined, undefined, "meeting-links");
  };

  const getRankBadge = (rank: number) => {
    const styles = {
      1: "bg-yellow-100 text-yellow-800 border-yellow-300",
      2: "bg-gray-100 text-gray-700 border-gray-300", 
      3: "bg-orange-100 text-orange-700 border-orange-300"
    };
    const icons = { 1: "🥇", 2: "🥈", 3: "🥉" };
    
    if (rank <= 3) {
      return (
        <Badge className={`${styles[rank as keyof typeof styles]} border`}>
          {icons[rank as keyof typeof icons]} #{rank}
        </Badge>
      );
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Report link copied to clipboard!");
  };

  const handleShowPreview = (rep: string, type: "individual" | "team" = "individual") => {
    alert(`Preview for ${rep} ${type} report would open here`);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getSelectedRecipient = (): ManagementEmail | null => {
    if (selectedRecipientId === "new") return null;
    return managementEmails.find(r => r.id === selectedRecipientId) || null;
  };

  const handleAddNewRecipient = () => {
    setEmailValidationError("");
    
    if (!newEmail.trim()) {
      setEmailValidationError("Email address is required");
      return;
    }
    
    if (!newName.trim()) {
      setEmailValidationError("Name is required");
      return;
    }
    
    if (!validateEmail(newEmail)) {
      setEmailValidationError("Please enter a valid email address");
      return;
    }
    
    if (managementEmails.some(email => email.email.toLowerCase() === newEmail.toLowerCase())) {
      setEmailValidationError("This email address is already added");
      return;
    }
    
    const newId = Math.max(...managementEmails.map(e => e.id), 0) + 1;
    const newRecipient: ManagementEmail = {
      id: newId,
      email: newEmail.trim(),
      name: newName.trim(),
      title: newTitle.trim() || "Manager",
      frequencies: { ...newFrequencies }
    };
    
    setManagementEmails(prev => [...prev, newRecipient]);
    setSelectedRecipientId(newId);
    setNewEmail("");
    setNewName("");
    setNewTitle("");
    setNewFrequencies({ weekly: false, monthly: true, quarterly: false });
    setEmailValidationError("");
    setHasUnsavedChanges(false);
  };

  const handleDeleteSelectedRecipient = () => {
    if (selectedRecipientId === "new") return;
    
    setManagementEmails(prev => prev.filter(email => email.id !== selectedRecipientId));
    const remainingRecipients = managementEmails.filter(email => email.id !== selectedRecipientId);
    setSelectedRecipientId(remainingRecipients.length > 0 ? remainingRecipients[0].id : "new");
    setHasUnsavedChanges(false);
  };

  const handleUpdateRecipientFrequency = (frequency: keyof IndividualReportFrequency, checked: boolean) => {
    if (selectedRecipientId === "new") {
      setNewFrequencies(prev => ({
        ...prev,
        [frequency]: checked
      }));
    } else {
      setManagementEmails(prev => prev.map(recipient => 
        recipient.id === selectedRecipientId 
          ? { ...recipient, frequencies: { ...recipient.frequencies, [frequency]: checked } }
          : recipient
      ));
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveChanges = () => {
    setHasUnsavedChanges(false);
    alert("Changes saved successfully!");
  };

  const handleTestSend = async () => {
    setIsTestingSend(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingSend(false);
    alert("Test management report sent successfully!");
  };

  const getTotalActiveRecipients = () => {
    return managementEmails.filter(recipient => 
      Object.values(recipient.frequencies).some(Boolean)
    ).length;
  };

  const getRecipientActiveSchedules = (frequencies: IndividualReportFrequency) => {
    const activeSchedules = [];
    if (frequencies.weekly) activeSchedules.push("Weekly");
    if (frequencies.monthly) activeSchedules.push("Monthly");
    if (frequencies.quarterly) activeSchedules.push("Quarterly");
    return activeSchedules;
  };

  // Mock data for upcoming campaigns/meetings
  const getFilteredUpcomingCampaigns = (rep?: string) => {
    const mockCount = rep === "You" ? 2 : rep === "Sarah M." ? 1 : 1;
    return { length: mockCount };
  };

  const getFilteredUpcomingMeetings = (rep?: string) => {
    const mockCount = rep === "You" ? 3 : rep === "Sarah M." ? 1 : 1;
    return { length: mockCount };
  };

  const upcomingMeetings = { length: 5 }; // Mock team meetings count

  const selectedRecipient = getSelectedRecipient();

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-semibold text-gray-900">Reports & Insights</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant={initialView === "dashboard" ? "default" : "outline"}
              size="sm" 
              className={initialView === "dashboard" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700"}
              onClick={handleAnalyticsNavigation}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics Dashboard
            </Button>
            <Button 
              variant={(initialView === "management-reports" || initialView === "meeting-links") ? "default" : "outline"}
              size="sm" 
              className={(initialView === "management-reports" || initialView === "meeting-links") ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700"}
              onClick={handleManagementNavigation}
            >
              <Settings className="h-4 w-4 mr-2" />
              Management Reports
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700"
              onClick={() => {
                // Generate and download CSV report
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Rep Name,Invites Sent,Meetings Held,Second Meetings,Opportunities,Pipeline Value\n" +
                  repPerformanceData.map(rep => 
                    `${rep.name},${rep.invitesSent},${rep.meetings},${rep.secondMeetings},${rep.opportunities},${rep.pipelineValue.toLocaleString()}`
                  ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `booky-performance-report-${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 h-[calc(100vh-88px)] overflow-y-auto">
        {/* Analytics Dashboard */}
        {activeView === "analytics" && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Analytics Dashboard</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track your cadence performance and conversion metrics in real-time
              </p>
            </div>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(() => {
                // Calculate time frame multiplier
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
                const totalProspects = cadences.reduce((sum, cadence) => sum + cadence.prospectCount, 0);
                const totalBookedMeetings = cadences.reduce((sum, cadence) => sum + cadence.bookedCount, 0);
                const activeCadences = cadences.filter(cadence => cadence.statusType === "active").length;
                
                const adjustedProspects = Math.floor(totalProspects * multiplier);
                const adjustedMeetings = Math.floor(totalBookedMeetings * multiplier);
                const bookRate = adjustedProspects > 0 ? ((adjustedMeetings / adjustedProspects) * 100).toFixed(1) + "%" : "0%";
                
                const metrics = [
                  {
                    value: adjustedMeetings.toString(),
                    label: "Meetings Booked",
                    icon: CalendarIcon,
                    color: "bg-green-500",
                    bgColor: "bg-green-50"
                  },
                  {
                    value: bookRate,
                    label: "Book Rate",
                    icon: BarChart3,
                    color: "bg-blue-500",
                    bgColor: "bg-blue-50"
                  },
                  {
                    value: activeCadences.toString(),
                    label: "Active Cadences",
                    icon: Users2,
                    color: "bg-purple-500",
                    bgColor: "bg-purple-50"
                  }
                ];
                
                return metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${metric.color} text-white`} />
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {metric.value}
                      </div>
                      <div className="text-lg text-gray-600 font-medium">
                        {metric.label}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Performance Chart */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="text-center flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Conversion Funnel</h3>
                  <p className="text-gray-600">Track your pipeline from initial outreach to opportunities</p>
                </div>
                <div className="flex-shrink-0">
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
              </div>
              
              {(() => {
                // Calculate time frame multiplier
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
                const totalProspects = cadences.reduce((sum, cadence) => sum + cadence.prospectCount, 0);
                const totalBookedMeetings = cadences.reduce((sum, cadence) => sum + cadence.bookedCount, 0);
                
                const adjustedProspects = Math.floor(totalProspects * multiplier);
                const adjustedMeetings = Math.floor(totalBookedMeetings * multiplier);
                const secondMeetings = Math.floor(adjustedMeetings * 0.46);
                const opportunities = Math.floor(secondMeetings * 0.58);
                
                const funnelData = [
                  {
                    stage: "Invites Sent",
                    value: adjustedProspects,
                    color: "#3b82f6",
                    bgColor: "#eff6ff",
                    icon: Users2
                  },
                  {
                    stage: "Meetings Booked",
                    value: adjustedMeetings,
                    color: "#10b981",
                    bgColor: "#ecfdf5",
                    icon: CalendarIcon
                  },
                  {
                    stage: "Second Meetings",
                    value: secondMeetings,
                    color: "#8b5cf6",
                    bgColor: "#f5f3ff",
                    icon: Users2
                  },
                  {
                    stage: "Opportunities",
                    value: opportunities,
                    color: "#f59e0b",
                    bgColor: "#fffbeb",
                    icon: BarChart3
                  }
                ];
                
                return (
                  <div className="flex items-center justify-center space-x-12">
                    {funnelData.map((stage, index) => {
                      const Icon = stage.icon;
                      const prevStage = funnelData[index - 1];
                      const conversionRate = prevStage ? ((stage.value / prevStage.value) * 100).toFixed(1) : null;
                      
                      return (
                        <div key={stage.stage} className="flex items-center">
                          <div className="text-center">
                            <div 
                              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                              style={{ backgroundColor: stage.bgColor }}
                            >
                              <Icon className="h-8 w-8" style={{ color: stage.color }} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{stage.value}</div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">{stage.stage}</div>
                            {conversionRate && (
                              <div className="text-sm text-green-600 font-medium">
                                {conversionRate}% conversion
                              </div>
                            )}
                          </div>
                          {index < funnelData.length - 1 && (
                            <div className="flex flex-col items-center mx-8">
                              <ArrowLeft className="h-6 w-6 text-gray-400 rotate-90 mb-2" />
                              <div className="w-0.5 h-8 bg-gray-200"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            
            {/* Cadence Performance Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Cadence Performance</h3>
                <p className="text-gray-600 mt-1">Detailed performance metrics for each cadence</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Cadence Name</th>
                      <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Prospects</th>
                      <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Meetings</th>
                      <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Book Rate</th>
                      <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cadences.map((cadence, index) => {
                      const bookRate = cadence.prospectCount > 0 ? ((cadence.bookedCount / cadence.prospectCount) * 100).toFixed(1) + "%" : "0%";
                      return (
                        <tr key={cadence.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-6 font-semibold text-gray-900">{cadence.name}</td>
                          <td className="p-6 text-gray-700">{cadence.prospectCount}</td>
                          <td className="p-6 text-gray-700">{cadence.bookedCount}</td>
                          <td className="p-6 text-gray-700 font-medium">{bookRate}</td>
                          <td className="p-6">
                            <Badge 
                              variant={cadence.statusType === "active" ? "default" : "secondary"}
                              className={`${
                                cadence.statusType === "active" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              } font-medium px-3 py-1 rounded-full`}
                            >
                              {cadence.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Management Reports - UNIFIED interface for both meeting-links AND management-reports */}
        {activeView === "management" && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Management Reports
              </CardTitle>
              <p className="text-sm text-gray-600">Configure automated reports and generate meeting report links for management and team discussions</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meeting Report Links Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  Meeting Report Links
                </h3>
                <p className="text-sm text-gray-600 mb-6">Generate shareable report links for management meetings and sales huddles (separate from your Calendar & Meetings)</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <PersonStanding className="h-4 w-4 text-green-600" />
                      Individual Rep Reports (1-on-1s)
                    </h4>
                    <div className="space-y-3">
                      {repPerformanceData.map((rep) => (
                        <div key={rep.name} className="p-3 border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <PersonStanding className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-gray-900 text-sm">{rep.name}</span>
                              {getRankBadge(rep.rank)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowPreview(rep.name, "individual")}
                                className="h-7 px-2 text-green-600"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(`https://booky.app/reports/individual/${rep.name.toLowerCase().replace(' ', '-')}`)}
                                className="h-7 px-2 text-blue-600"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Link
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>• Performance metrics with conversion rates & no-shows</p>
                            <p>• Historical activity and success tracking</p>
                            <p>• Upcoming campaigns ({getFilteredUpcomingCampaigns(rep.name).length} planned)</p>
                            <p>• Next 30 days meetings ({getFilteredUpcomingMeetings(rep.name).length} scheduled)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-purple-600" />
                      Team Reports (Sales Huddles)
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users2 className="h-3 w-3 text-purple-600" />
                            <span className="font-medium text-gray-900 text-sm">Weekly Sales Huddle</span>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">Team</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowPreview("Team", "team")}
                              className="h-7 px-2 text-green-600"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink("https://booky.app/reports/team/weekly-huddle")}
                              className="h-7 px-2 text-blue-600"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• Team performance overview with trend indicators</p>
                          <p>• Clickable team member navigation</p>
                          <p>• This week's meetings across team ({upcomingMeetings.length} scheduled)</p>
                          <p>• Condensed format perfect for sales huddles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2 text-sm flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Report Features
                    </h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Individual Reports:</strong> Detailed performance metrics for 1-on-1 meetings</p>
                      <p><strong>Team Reports:</strong> Comprehensive team overview for sales huddles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Report Recipients Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Automated Report Recipients</h4>
                  <div className="flex items-center gap-2">
                    {getTotalActiveRecipients() > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        <Bell className="h-3 w-3 mr-1" />
                        {getTotalActiveRecipients()} Active
                      </Badge>
                    )}
                    <Button
                      onClick={() => setSelectedRecipientId("new")}
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipient
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Recipient to Edit
                    </Label>
                    <Select
                      value={selectedRecipientId.toString()}
                      onValueChange={(value) => {
                        setSelectedRecipientId(value === "new" ? "new" : parseInt(value));
                        setHasUnsavedChanges(false);
                        setEmailValidationError("");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a recipient..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-600" />
                            Add New Recipient
                          </div>
                        </SelectItem>
                        {managementEmails.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{recipient.name}</div>
                                <div className="text-xs text-gray-500">{recipient.title} • {recipient.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Editing Area */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {selectedRecipientId === "new" ? (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Plus className="h-4 w-4 text-blue-600" />
                          Add New Recipient
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label htmlFor="newName" className="text-sm font-medium text-gray-700">Name *</Label>
                            <Input
                              id="newName"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              placeholder="John Doe"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newEmail" className="text-sm font-medium text-gray-700">Email *</Label>
                            <Input
                              id="newEmail"
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="john.doe@company.com"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newTitle" className="text-sm font-medium text-gray-700">Title</Label>
                            <Input
                              id="newTitle"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="e.g., VP Sales"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Report Frequencies</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                              <Checkbox
                                id="newWeekly"
                                checked={newFrequencies.weekly}
                                onCheckedChange={(checked) => handleUpdateRecipientFrequency("weekly", checked as boolean)}
                              />
                              <label htmlFor="newWeekly" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Weekly Reports
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                              <Checkbox
                                id="newMonthly"
                                checked={newFrequencies.monthly}
                                onCheckedChange={(checked) => handleUpdateRecipientFrequency("monthly", checked as boolean)}
                              />
                              <label htmlFor="newMonthly" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Monthly Reports
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                              <Checkbox
                                id="newQuarterly"
                                checked={newFrequencies.quarterly}
                                onCheckedChange={(checked) => handleUpdateRecipientFrequency("quarterly", checked as boolean)}
                              />
                              <label htmlFor="newQuarterly" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Quarterly Reports
                              </label>
                            </div>
                          </div>
                        </div>

                        {emailValidationError && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {emailValidationError}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={handleAddNewRecipient}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Recipient
                          </Button>
                        </div>
                      </div>
                    ) : (
                      selectedRecipient && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                              <Edit2 className="h-4 w-4 text-blue-600" />
                              Edit {selectedRecipient.name}
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDeleteSelectedRecipient}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>

                          <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                            <div className="font-medium text-gray-900">{selectedRecipient.name}</div>
                            <div className="text-sm text-gray-600">{selectedRecipient.email}</div>
                            <div className="text-xs text-gray-500">{selectedRecipient.title}</div>
                          </div>

                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Report Frequencies</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <Checkbox
                                  id={`weekly-${selectedRecipient.id}`}
                                  checked={selectedRecipient.frequencies.weekly}
                                  onCheckedChange={(checked) => 
                                    handleUpdateRecipientFrequency("weekly", checked as boolean)
                                  }
                                />
                                <label htmlFor={`weekly-${selectedRecipient.id}`} className="text-sm text-gray-700 cursor-pointer">
                                  Weekly Reports
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <Checkbox
                                  id={`monthly-${selectedRecipient.id}`}
                                  checked={selectedRecipient.frequencies.monthly}
                                  onCheckedChange={(checked) => 
                                    handleUpdateRecipientFrequency("monthly", checked as boolean)
                                  }
                                />
                                <label htmlFor={`monthly-${selectedRecipient.id}`} className="text-sm text-gray-700 cursor-pointer">
                                  Monthly Reports
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                                <Checkbox
                                  id={`quarterly-${selectedRecipient.id}`}
                                  checked={selectedRecipient.frequencies.quarterly}
                                  onCheckedChange={(checked) => 
                                    handleUpdateRecipientFrequency("quarterly", checked as boolean)
                                  }
                                />
                                <label htmlFor={`quarterly-${selectedRecipient.id}`} className="text-sm text-gray-700 cursor-pointer">
                                  Quarterly Reports
                                </label>
                              </div>
                            </div>
                          </div>

                          {hasUnsavedChanges && (
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={handleSaveChanges}
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Test Send Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Test Report Delivery
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Send a test management report to verify email delivery and formatting.
                      </p>
                      <Button
                        onClick={handleTestSend}
                        disabled={isTestingSend}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {isTestingSend ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {isTestingSend ? "Sending..." : "Send Test Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}