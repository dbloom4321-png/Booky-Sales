import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Video, Mail, Globe, Check, AlertCircle, Settings, Users, Shield, UserPlus, Edit, Trash2, Crown, User, Bell, Signature, Calendar, Clock, Plus, Search, ExternalLink, Zap, Database, Building } from "lucide-react";

interface AccountSettingsPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings", campaignInfo?: any, cadenceData?: any, reportsView?: any) => void;
  onGoBack?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  status: "active" | "pending" | "inactive";
  lastActive: string;
  territory?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  meetingReminders: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  systemAlerts: boolean;
}

interface CRMIntegration {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: "crm" | "sales" | "marketing" | "analytics" | "productivity";
  connected: boolean;
  popular: boolean;
  features: string[];
}

interface Provider {
  id: string;
  name: string;
  description: string;
}

export function AccountSettingsPage({ onNavigate, onGoBack }: AccountSettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [addIntegrationDialogOpen, setAddIntegrationDialogOpen] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [userToDelete, setUserToDelete] = useState<TeamMember | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "manager" | "user">("user");
  const [newUserTerritory, setNewUserTerritory] = useState("");

  // Configuration dialog states
  const [emailConfigOpen, setEmailConfigOpen] = useState(false);
  const [calendarConfigOpen, setCalendarConfigOpen] = useState(false);
  const [videoConfigOpen, setVideoConfigOpen] = useState(false);

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: "John",
    lastName: "Doe",
    title: "Sales Director",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York"
  });

  // Email Signature
  const [emailSignature, setEmailSignature] = useState(`Best regards,
John Doe
Sales Director
Booky
john.doe@company.com
+1 (555) 123-4567`);

  // Seat Management
  const [seatSettings, setSeatSettings] = useState({
    totalSeats: 10,
    usedSeats: 4, // Current team members count
    planType: "Professional"
  });

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    meetingReminders: true,
    campaignUpdates: true,
    weeklyReports: false,
    systemAlerts: true
  });

  // Sending Settings
  const [sendingSettings, setSendingSettings] = useState({
    dailyLimitsEnabled: true,
    emailsPerDay: 50,
    calendarInvitesPerDay: 25,
    excludeCompanyOnAcceptance: true,
    delaySettings: {
      minDelay: 30, // seconds - recommended minimum for human-like behavior
      maxDelay: 120, // seconds - recommended maximum for efficient sending
      randomize: true
    }
  });

  // Integration Settings with provider selection
  const [integrations, setIntegrations] = useState({
    emailProvider: "gmail",
    calendarProvider: "google-calendar",
    videoProvider: "zoom",
    salesforceConnected: true,
    hubspotConnected: false
  });

  // Available providers for each integration type (icons removed)
  const emailProviders: Provider[] = [
    {
      id: "gmail",
      name: "Gmail",
      description: "Google's email service with robust API integration"
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Microsoft Outlook with Exchange integration"
    }
  ];

  const calendarProviders: Provider[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Google's calendar service with seamless scheduling"
    },
    {
      id: "outlook-calendar",
      name: "Outlook Calendar",
      description: "Microsoft Outlook Calendar with Exchange sync"
    }
  ];

  const videoProviders: Provider[] = [
    {
      id: "zoom",
      name: "Zoom",
      description: "Industry-leading video conferencing platform"
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Microsoft's collaboration and video platform"
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description: "Google's video conferencing solution"
    }
  ];

  // Helper functions to get current provider details
  const getCurrentEmailProvider = () => emailProviders.find(p => p.id === integrations.emailProvider);
  const getCurrentCalendarProvider = () => calendarProviders.find(p => p.id === integrations.calendarProvider);
  const getCurrentVideoProvider = () => videoProviders.find(p => p.id === integrations.videoProvider);

  // CRM Integrations with simplified data structure
  const [crmIntegrations, setCrmIntegrations] = useState<CRMIntegration[]>([
    {
      id: "salesforce",
      name: "Salesforce",
      description: "",
      logo: "SF",
      category: "crm",
      connected: true,
      popular: true,
      features: []
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "",
      logo: "HS",
      category: "crm",
      connected: false,
      popular: true,
      features: []
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      description: "",
      logo: "PD",
      category: "sales",
      connected: false,
      popular: true,
      features: []
    },
    {
      id: "zendesk",
      name: "Zendesk Sell",
      description: "",
      logo: "ZS",
      category: "sales",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "monday",
      name: "Monday.com",
      description: "",
      logo: "M",
      category: "productivity",
      connected: false,
      popular: true,
      features: []
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "",
      logo: "AT",
      category: "productivity",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "notion",
      name: "Notion",
      description: "",
      logo: "N",
      category: "productivity",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "zoho",
      name: "Zoho CRM",
      description: "",
      logo: "Z",
      category: "crm",
      connected: false,
      popular: true,
      features: []
    },
    {
      id: "freshsales",
      name: "Freshsales",
      description: "",
      logo: "FS",
      category: "sales",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "copper",
      name: "Copper",
      description: "",
      logo: "C",
      category: "crm",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "activecampaign",
      name: "ActiveCampaign",
      description: "",
      logo: "AC",
      category: "marketing",
      connected: false,
      popular: false,
      features: []
    },
    {
      id: "close",
      name: "Close",
      description: "",
      logo: "CL",
      category: "sales",
      connected: false,
      popular: false,
      features: []
    }
  ]);

  // Team Members Data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "admin",
      status: "active",
      lastActive: "2024-08-01T10:30:00",
      territory: "West Coast"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      role: "manager",
      status: "active",
      lastActive: "2024-08-01T09:15:00",
      territory: "East Coast"
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike.c@company.com",
      role: "user",
      status: "active",
      lastActive: "2024-07-31T16:45:00",
      territory: "Midwest"
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      role: "user",
      status: "pending",
      lastActive: "",
      territory: "Southwest"
    }
  ]);

  const territories = ["West Coast", "East Coast", "Midwest", "Southwest", "International"];
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Phoenix", label: "Arizona Time (AZ)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" }
  ];

  // Get current user info
  const currentUser = teamMembers.find(member => member.email === "john.doe@company.com") || teamMembers[0];
  const isCurrentUserAdmin = currentUser?.role === "admin";

  // Calculate available seats
  const availableSeats = seatSettings.totalSeats - teamMembers.length;

  const connectedIntegrations = crmIntegrations.filter(integration => integration.connected);
  const availableIntegrations = crmIntegrations.filter(integration => !integration.connected);

  const handleToggleIntegration = (integrationId: string) => {
    setCrmIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, connected: !integration.connected }
        : integration
    ));
  };

  const handleAddIntegration = () => {
    if (selectedIntegrationId) {
      handleToggleIntegration(selectedIntegrationId);
      setSelectedIntegrationId("");
      setAddIntegrationDialogOpen(false);
    }
  };

  const getSelectedIntegration = () => {
    return availableIntegrations.find(integration => integration.id === selectedIntegrationId);
  };

  // Provider change handlers
  const handleEmailProviderChange = (providerId: string) => {
    setIntegrations(prev => ({ ...prev, emailProvider: providerId }));
    setEmailConfigOpen(false);
  };

  const handleCalendarProviderChange = (providerId: string) => {
    setIntegrations(prev => ({ ...prev, calendarProvider: providerId }));
    setCalendarConfigOpen(false);
  };

  const handleVideoProviderChange = (providerId: string) => {
    setIntegrations(prev => ({ ...prev, videoProvider: providerId }));
    setVideoConfigOpen(false);
  };

  const getRoleBadge = (role: "admin" | "manager" | "user") => {
    const styles = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      manager: "bg-blue-100 text-blue-800 border-blue-200",
      user: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    const icons = {
      admin: Crown,
      manager: Shield,
      user: User
    };
    
    const Icon = icons[role];
    
    return (
      <Badge variant="outline" className={styles[role]}>
        <Icon className="h-3 w-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: "active" | "pending" | "inactive") => {
    const styles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-600"
    };
    
    return (
      <Badge className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      crm: "bg-blue-100 text-blue-800",
      sales: "bg-green-100 text-green-800", 
      marketing: "bg-purple-100 text-purple-800",
      analytics: "bg-orange-100 text-orange-800",
      productivity: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge variant="outline" className={styles[category] || styles.productivity}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const handleInviteUser = () => {
    if (availableSeats <= 0) {
      alert("No available seats. Please upgrade your plan to add more team members.");
      return;
    }

    const newUser: TeamMember = {
      id: Date.now().toString(),
      name: newUserEmail.split('@')[0],
      email: newUserEmail,
      role: newUserRole,
      status: "pending",
      lastActive: "",
      territory: newUserTerritory
    };
    
    setTeamMembers(prev => [...prev, newUser]);
    setInviteDialogOpen(false);
    setNewUserEmail("");
    setNewUserRole("user");
    setNewUserTerritory("");
  };

  const handleEditUser = (user: TeamMember) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleSaveEditUser = () => {
    if (selectedUser) {
      setTeamMembers(prev => prev.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setEditUserDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = (user: TeamMember) => {
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setTeamMembers(prev => prev.filter(user => user.id !== userToDelete.id));
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const formatLastActive = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="mb-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, team, and integrations</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team & Access
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileSettings.firstName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileSettings.lastName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={profileSettings.title}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select value={profileSettings.timezone} onValueChange={(value) => setProfileSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signature className="h-5 w-5 text-blue-600" />
                  Email Signature
                </CardTitle>
                <CardDescription>
                  Customize your email signature for outbound messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="signature">Signature Content</Label>
                  <Textarea
                    id="signature"
                    value={emailSignature}
                    onChange={(e) => setEmailSignature(e.target.value)}
                    rows={6}
                    className="resize-none"
                    placeholder="Enter your email signature..."
                  />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="whitespace-pre-line text-sm text-gray-700">
                    {emailSignature}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sending Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Sending Settings
                </CardTitle>
                <CardDescription>
                  Configure daily limits and sending delays for emails and calendar invites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily Limits Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Daily Sending Limits</h4>
                      <p className="text-sm text-blue-700">Prevent hitting provider rate limits and maintain deliverability</p>
                    </div>
                  </div>
                  <Switch
                    checked={sendingSettings.dailyLimitsEnabled}
                    onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, dailyLimitsEnabled: checked }))}
                  />
                </div>

                {/* Daily Limits Configuration */}
                {sendingSettings.dailyLimitsEnabled && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Daily Sending Limits</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailsPerDay">Emails per Day</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="emailsPerDay"
                            type="number"
                            min="0"
                            max="500"
                            value={sendingSettings.emailsPerDay}
                            onChange={(e) => setSendingSettings(prev => ({
                              ...prev,
                              emailsPerDay: parseInt(e.target.value) || 0
                            }))}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">/ day</span>
                        </div>
                        <p className="text-xs text-gray-500">Range: 0-500 (0 = unlimited)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calendarInvitesPerDay">Calendar Invites per Day</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="calendarInvitesPerDay"
                            type="number"
                            min="0"
                            max="500"
                            value={sendingSettings.calendarInvitesPerDay}
                            onChange={(e) => setSendingSettings(prev => ({
                              ...prev,
                              calendarInvitesPerDay: parseInt(e.target.value) || 0
                            }))}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">/ day</span>
                        </div>
                        <p className="text-xs text-gray-500">Range: 0-500 (0 = unlimited)</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Company Exclusion Setting */}
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Building className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900">Company Exclusion</h4>
                      <p className="text-sm text-orange-700">Automatically exclude companies from future outreach when someone accepts a meeting</p>
                    </div>
                  </div>
                  <Switch
                    checked={sendingSettings.excludeCompanyOnAcceptance}
                    onCheckedChange={(checked) => setSendingSettings(prev => ({ ...prev, excludeCompanyOnAcceptance: checked }))}
                  />
                </div>

                <Separator />

                {/* Delay Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium text-gray-900">Sending Delays</h4>
                  </div>
                  <p className="text-sm text-gray-600">Add delays between sends to improve deliverability and avoid spam filters</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minDelay">Minimum Delay</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="minDelay"
                          type="number"
                          min="5"
                          max="300"
                          value={sendingSettings.delaySettings.minDelay}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 5;
                            setSendingSettings(prev => ({
                              ...prev,
                              delaySettings: { 
                                ...prev.delaySettings, 
                                minDelay: value,
                                maxDelay: Math.max(value, prev.delaySettings.maxDelay)
                              }
                            }));
                          }}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-500">seconds</span>
                      </div>
                      <p className="text-xs text-gray-500">Range: 5-300 seconds</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDelay">Maximum Delay</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="maxDelay"
                          type="number"
                          min="5"
                          max="300"
                          value={sendingSettings.delaySettings.maxDelay}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 5;
                            setSendingSettings(prev => ({
                              ...prev,
                              delaySettings: { 
                                ...prev.delaySettings, 
                                maxDelay: Math.max(value, prev.delaySettings.minDelay)
                              }
                            }));
                          }}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-500">seconds</span>
                      </div>
                      <p className="text-xs text-gray-500">Range: 5-300 seconds (5 minutes)</p>
                    </div>
                  </div>

                  {/* Randomization Toggle */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 rounded">
                        <Zap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-purple-900">Randomize Delays</h5>
                        <p className="text-sm text-purple-700">Vary send times to appear more human-like</p>
                      </div>
                    </div>
                    <Switch
                      checked={sendingSettings.delaySettings.randomize}
                      onCheckedChange={(checked) => setSendingSettings(prev => ({
                        ...prev,
                        delaySettings: { ...prev.delaySettings, randomize: checked }
                      }))}
                    />
                  </div>

                  {/* Delay Preview */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <h5 className="font-medium text-gray-900 mb-2">Current Settings Preview</h5>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Delay Range:</span> {sendingSettings.delaySettings.minDelay}s - {sendingSettings.delaySettings.maxDelay}s
                      </p>
                      <p>
                        <span className="font-medium">Randomization:</span> {sendingSettings.delaySettings.randomize ? 'Enabled' : 'Disabled'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {sendingSettings.delaySettings.randomize 
                          ? `Each send will be delayed by a random amount between ${sendingSettings.delaySettings.minDelay} and ${sendingSettings.delaySettings.maxDelay} seconds`
                          : `Each send will be delayed by exactly ${sendingSettings.delaySettings.minDelay} seconds`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Save the settings - could integrate with backend here
                      alert("Sending settings saved successfully!");
                    }}
                  >
                    Save Sending Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team & Access Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Seat Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Seat Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage your team seat allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total Seats</p>
                        <p className="text-2xl font-semibold text-blue-900">{seatSettings.totalSeats}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Used Seats</p>
                        <p className="text-2xl font-semibold text-green-900">{teamMembers.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Plus className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-700">Available Seats</p>
                        <p className="text-2xl font-semibold text-purple-900">{availableSeats}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{seatSettings.planType} Plan</p>
                    <p className="text-sm text-gray-600">
                      {availableSeats > 0 
                        ? `${availableSeats} seat${availableSeats === 1 ? '' : 's'} available for new team members`
                        : "All seats are currently occupied. Upgrade to add more team members."
                      }
                    </p>
                  </div>
                  {availableSeats <= 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // In a real app, this would redirect to billing/upgrade page
                        alert("Redirecting to plan upgrade page...\n\nThis would typically open your billing dashboard or contact sales.");
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage team access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Team Directory</h4>
                      <p className="text-sm text-gray-600">View and manage team member access</p>
                    </div>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={availableSeats <= 0}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite User {availableSeats > 0 && `(${availableSeats} available)`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite New Team Member</DialogTitle>
                          <DialogDescription>
                            Send an invitation to join your Booky workspace
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="colleague@company.com"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select value={newUserRole} onValueChange={(value: "admin" | "manager" | "user") => setNewUserRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User - Basic access</SelectItem>
                                <SelectItem value="manager">Manager - Team management</SelectItem>
                                <SelectItem value="admin">Admin - Full access</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invite-territory">Territory (Optional)</Label>
                            <Select value={newUserTerritory} onValueChange={setNewUserTerritory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select territory" />
                              </SelectTrigger>
                              <SelectContent>
                                {territories.map((territory) => (
                                  <SelectItem key={territory} value={territory}>
                                    {territory}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteUser} disabled={!newUserEmail || availableSeats <= 0}>
                            {availableSeats <= 0 ? "No Seats Available" : "Send Invitation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Edit User Dialog */}
                    <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team Member</DialogTitle>
                          <DialogDescription>
                            Update team member information and permissions
                          </DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={selectedUser.name}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email Address</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={selectedUser.email}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-role">Role</Label>
                              <Select 
                                value={selectedUser.role} 
                                onValueChange={(value: "admin" | "manager" | "user") => 
                                  setSelectedUser(prev => prev ? { ...prev, role: value } : null)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User - Basic access</SelectItem>
                                  <SelectItem value="manager">Manager - Team management</SelectItem>
                                  <SelectItem value="admin">Admin - Full access</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-territory">Territory</Label>
                              <Select 
                                value={selectedUser.territory || ""} 
                                onValueChange={(value) => 
                                  setSelectedUser(prev => prev ? { ...prev, territory: value } : null)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select territory" />
                                </SelectTrigger>
                                <SelectContent>
                                  {territories.map((territory) => (
                                    <SelectItem key={territory} value={territory}>
                                      {territory}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveEditUser}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete User Confirmation Dialog */}
                    <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Remove Team Member
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove this team member? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        {userToDelete && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium text-red-900">{userToDelete.name}</p>
                                <p className="text-sm text-red-700">{userToDelete.email}</p>
                                <div className="mt-1">
                                  {getRoleBadge(userToDelete.role)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <p className="font-medium text-yellow-900">What happens next:</p>
                          </div>
                          <ul className="text-sm text-yellow-800 space-y-1 ml-6">
                            <li>• Access to Booky will be immediately revoked</li>
                            <li>• One seat will be freed up for new team members</li>
                            <li>• All data and campaign history will be preserved</li>
                          </ul>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={confirmDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove Team Member
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Team Members Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Territory
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Active
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {getRoleBadge(member.role)}
                              </td>
                              <td className="px-4 py-4">
                                {getStatusBadge(member.status)}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                {member.territory || "—"}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                {formatLastActive(member.lastActive)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => handleEditUser(member)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {member.id !== "1" && isCurrentUserAdmin && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleDeleteUser(member)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Core Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Core Integrations
                </CardTitle>
                <CardDescription>
                  Connect your essential tools for email, calendar, and video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Provider */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Mail className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email Provider</h4>
                      <p className="text-sm text-gray-600">{getCurrentEmailProvider()?.name} connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Dialog open={emailConfigOpen} onOpenChange={setEmailConfigOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure Email Provider</DialogTitle>
                          <DialogDescription>
                            Choose your email provider for sending campaigns and outreach
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {emailProviders.map((provider) => (
                              <div
                                key={provider.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  integrations.emailProvider === provider.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleEmailProviderChange(provider.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                                    <p className="text-sm text-gray-600">{provider.description}</p>
                                  </div>
                                  {integrations.emailProvider === provider.id && (
                                    <Check className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEmailConfigOpen(false)}>
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Calendar Provider */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Calendar Provider</h4>
                      <p className="text-sm text-gray-600">{getCurrentCalendarProvider()?.name} connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Dialog open={calendarConfigOpen} onOpenChange={setCalendarConfigOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure Calendar Provider</DialogTitle>
                          <DialogDescription>
                            Choose your calendar provider for meeting scheduling and invites
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {calendarProviders.map((provider) => (
                              <div
                                key={provider.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  integrations.calendarProvider === provider.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleCalendarProviderChange(provider.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                                    <p className="text-sm text-gray-600">{provider.description}</p>
                                  </div>
                                  {integrations.calendarProvider === provider.id && (
                                    <Check className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setCalendarConfigOpen(false)}>
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Video Provider */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Video className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Video Provider</h4>
                      <p className="text-sm text-gray-600">{getCurrentVideoProvider()?.name} connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Dialog open={videoConfigOpen} onOpenChange={setVideoConfigOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure Video Provider</DialogTitle>
                          <DialogDescription>
                            Choose your video conferencing platform for meeting links
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {videoProviders.map((provider) => (
                              <div
                                key={provider.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  integrations.videoProvider === provider.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleVideoProviderChange(provider.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                                    <p className="text-sm text-gray-600">{provider.description}</p>
                                  </div>
                                  {integrations.videoProvider === provider.id && (
                                    <Check className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setVideoConfigOpen(false)}>
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CRM Integrations - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  CRM & Productivity Integrations
                </CardTitle>
                <CardDescription>
                  Connect your CRM and productivity tools to sync data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Connected Integrations */}
                  {connectedIntegrations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Connected</h4>
                      <div className="space-y-2">
                        {connectedIntegrations.map((integration) => (
                          <div key={integration.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white border border-green-300 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-medium text-green-700">
                                  {integration.logo}
                                </span>
                              </div>
                              <div>
                                <h5 className="font-medium text-green-900">{integration.name}</h5>
                                {getCategoryBadge(integration.category)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleIntegration(integration.id)}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Integration Button */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Add Integrations</h4>
                      <Dialog open={addIntegrationDialogOpen} onOpenChange={setAddIntegrationDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Integration</DialogTitle>
                            <DialogDescription>
                              Select an integration to connect to your Booky account
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Select Integration</Label>
                              <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an integration..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableIntegrations.map((integration) => (
                                    <SelectItem key={integration.id} value={integration.id}>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                          {integration.logo}
                                        </span>
                                        <span className="font-medium text-gray-900">{integration.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedIntegrationId && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="font-semibold text-blue-900 mb-2 text-lg">
                                  {getSelectedIntegration()?.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  {getCategoryBadge(getSelectedIntegration()?.category || "productivity")}
                                  <span className="text-sm text-blue-700">Ready to connect</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setAddIntegrationDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAddIntegration} 
                              disabled={!selectedIntegrationId}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Connect Integration
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Connect additional CRM and productivity tools to streamline your workflow and sync data across platforms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">Campaign Updates</h5>
                        <p className="text-sm text-gray-600">Get notified when campaigns start, pause, or complete</p>
                      </div>
                      <Switch
                        checked={notifications.campaignUpdates}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, campaignUpdates: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">Meeting Reminders</h5>
                        <p className="text-sm text-gray-600">Receive reminders before scheduled meetings</p>
                      </div>
                      <Switch
                        checked={notifications.meetingReminders}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, meetingReminders: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">Weekly Reports</h5>
                        <p className="text-sm text-gray-600">Weekly summary of your performance and metrics</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">System Alerts</h5>
                        <p className="text-sm text-gray-600">Important system updates and maintenance notifications</p>
                      </div>
                      <Switch
                        checked={notifications.systemAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemAlerts: checked }))}
                      />
                    </div>
                  </div>
                </div>



                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Save notification settings - could integrate with backend here
                      alert("Notification settings saved successfully!");
                    }}
                  >
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}