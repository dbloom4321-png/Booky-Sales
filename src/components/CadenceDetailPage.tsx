import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { ArrowLeft, Mail, Calendar, CheckCircle, StopCircle, RotateCcw, Play, Pause, Settings, Users, TrendingUp, Clock, Target, Edit, Save, X } from "lucide-react";

interface CadenceDetailPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "edit-cadence" | "prospect-upload" | "account-settings" | "meetings", campaignInfo?: any, cadenceData?: any, reportsView?: any) => void;
  cadenceData: {
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
  };
}

interface CadenceStep {
  id: string;
  type: "email" | "calendar" | "stop";
  title: string;
  description: string;
  delay: string;
  enabled: boolean;
  icon: any;
  badgeColor: string;
  // Extended properties for editing
  delayAmount?: number;
  delayUnit?: "hours" | "days" | "weeks";
  emailSubject?: string;
  emailBody?: string;
  emailTemplate?: string;
  calendarTitle?: string;
  calendarDuration?: number;
  calendarDescription?: string;
  calendarTemplate?: string;
  timeSlots?: string;
  includeConferenceBridge?: boolean;
  meetingLocation?: string;
}

export function CadenceDetailPage({ onNavigate, cadenceData }: CadenceDetailPageProps) {
  const [editStepModalOpen, setEditStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<CadenceStep | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState<number>(-1);

  // Define steps based on the cadence type
  const getStepsForCadence = () => {
    if (cadenceData.name === "RevOps Campaign") {
      return [
        {
          id: "step-1",
          type: "email" as const,
          title: "Initial Email",
          description: "First outreach email introducing the value proposition",
          delay: "Immediate",
          enabled: true,
          icon: Mail,
          badgeColor: "bg-blue-100 text-blue-800",
          delayAmount: 0,
          delayUnit: "hours" as const,
          emailSubject: "Quick question about [Company] revenue operations",
          emailBody: "Hi [First Name],\n\nI noticed you're the [Title] at [Company] and wanted to reach out with a quick question.\n\nWe've been helping similar companies in [Industry] increase their meeting booking rates by 300% through automated calendar scheduling.\n\nWould you be open to a brief 15-minute call this week to discuss how this could impact [Company]'s revenue operations?\n\nBest regards,\n[Your Name]",
          emailTemplate: "standard-intro",
          calendarTitle: "",
          calendarDuration: 30,
          calendarDescription: "",
          timeSlots: "9-5",
          includeConferenceBridge: true,
          meetingLocation: ""
        },
        {
          id: "step-2",
          type: "calendar" as const,
          title: "Calendar Invite",
          description: "Send calendar invite for initial meeting",
          delay: "1 day after email",
          enabled: true,
          icon: Calendar,
          badgeColor: "bg-green-100 text-green-800",
          delayAmount: 1,
          delayUnit: "days" as const,
          emailSubject: "",
          emailBody: "",
          calendarTitle: "Revenue Operations Discussion - [Company]",
          calendarDuration: 30,
          calendarDescription: "Brief discussion about automated calendar scheduling and its impact on revenue operations at [Company].\n\nAgenda:\n• Current challenges with meeting scheduling\n• How automated calendar invites increase booking rates\n• Specific strategies for [Company]\n• Next steps",
          calendarTemplate: "discovery-call",
          timeSlots: "9-5",
          includeConferenceBridge: true,
          meetingLocation: ""
        },
        {
          id: "step-3",
          type: "stop" as const,
          title: "Stop Sequence",
          description: "End of cadence sequence",
          delay: "7 days after calendar invite",
          enabled: true,
          icon: StopCircle,
          badgeColor: "bg-red-100 text-red-800",
          delayAmount: 7,
          delayUnit: "days" as const
        }
      ];
    }
    
    if (cadenceData.name === "No Show Follow-up") {
      return [
        {
          id: "step-1",
          type: "email" as const,
          title: "Apology & Reschedule Email",
          description: "Sorry we missed you on [meeting date]. No biggie! I've updated the invite to a month out - please propose a new time if that doesn't work for you.",
          delay: "Immediate after no-show",
          enabled: true,
          icon: Mail,
          badgeColor: "bg-orange-100 text-orange-800",
          delayAmount: 0,
          delayUnit: "hours" as const,
          emailSubject: "Sorry we missed each other - let's reschedule!",
          emailBody: "Hi [First Name],\n\nSorry we missed you on [Meeting Date] - no biggie!\n\nI've updated our meeting invite to [New Date] (a month out) to give us both more flexibility.\n\nIf that doesn't work for you, please just hit reply and propose a new time that works better.\n\nLooking forward to connecting!\n\nBest regards,\n[Your Name]",
          emailTemplate: "no-show-recovery",
          calendarTitle: "",
          calendarDuration: 30,
          calendarDescription: "",
          timeSlots: "9-5",
          includeConferenceBridge: true,
          meetingLocation: ""
        },
        {
          id: "step-2",
          type: "calendar" as const,
          title: "New Calendar Invite",
          description: "Send updated calendar invite rescheduled to 1 month from original date",
          delay: "1 hour after apology email",
          enabled: true,
          icon: Calendar,
          badgeColor: "bg-blue-100 text-blue-800",
          delayAmount: 1,
          delayUnit: "hours" as const,
          emailSubject: "",
          emailBody: "",
          calendarTitle: "Rescheduled Meeting - [Company]",
          calendarDuration: 30,
          calendarDescription: "Rescheduled meeting to discuss automated calendar scheduling solutions.\n\nWe'll cover:\n• How to increase meeting booking rates\n• Specific strategies for your industry\n• Implementation timeline and next steps",
          calendarTemplate: "reschedule",
          timeSlots: "flexible",
          includeConferenceBridge: true,
          meetingLocation: ""
        },
        {
          id: "step-3",
          type: "stop" as const,
          title: "Stop Sequence",
          description: "End of no-show follow-up sequence",
          delay: "30 days after new invite",
          enabled: true,
          icon: StopCircle,
          badgeColor: "bg-red-100 text-red-800",
          delayAmount: 30,
          delayUnit: "days" as const
        }
      ];
    }
    
    // Default steps for other cadences
    return [
      {
        id: "step-1",
        type: "email" as const,
        title: "Initial Email",
        description: "First outreach email introducing the value proposition",
        delay: "Immediate",
        enabled: true,
        icon: Mail,
        badgeColor: "bg-blue-100 text-blue-800",
        delayAmount: 0,
        delayUnit: "hours" as const,
        emailSubject: "Quick question about [Company] growth",
        emailBody: "Hi [First Name],\n\nI noticed you're the [Title] at [Company] and wanted to reach out with a quick question.\n\nWe've been helping similar companies increase their meeting booking rates by 300% through automated calendar scheduling.\n\nWould you be open to a brief 15-minute call this week to discuss how this could impact [Company]?\n\nBest regards,\n[Your Name]",
        emailTemplate: "standard-intro",
        calendarTitle: "",
        calendarDuration: 30,
        calendarDescription: "",
        timeSlots: "9-5",
        includeConferenceBridge: true,
        meetingLocation: ""
      },
      {
        id: "step-2",
        type: "calendar" as const,
        title: "Calendar Invite",
        description: "Send calendar invite for initial meeting",
        delay: "1 day after email",
        enabled: true,
        icon: Calendar,
        badgeColor: "bg-green-100 text-green-800",
        delayAmount: 1,
        delayUnit: "days" as const,
        emailSubject: "",
        emailBody: "",
        calendarTitle: "Discovery Call - [Company]",
        calendarDuration: 30,
        calendarDescription: "Initial discovery call to discuss automated calendar scheduling solutions.\n\nAgenda:\n• Current challenges\n• Solution overview\n• Next steps",
        calendarTemplate: "discovery-call",
        timeSlots: "9-5",
        includeConferenceBridge: true,
        meetingLocation: ""
      },
      {
        id: "step-3",
        type: "email" as const,
        title: "Follow-up Email",
        description: "Follow-up email if no response to initial invite",
        delay: "3 days after calendar invite",
        enabled: true,
        icon: Mail,
        badgeColor: "bg-purple-100 text-purple-800",
        delayAmount: 3,
        delayUnit: "days" as const,
        emailSubject: "Following up on our meeting invite",
        emailBody: "Hi [First Name],\n\nI wanted to follow up on the meeting invite I sent a few days ago.\n\nI understand calendars can get busy, so I wanted to make sure you saw the opportunity to discuss how we can help [Company] increase meeting booking rates.\n\nIf the current time doesn't work, I'm happy to find a better slot that fits your schedule.\n\nBest regards,\n[Your Name]",
        emailTemplate: "follow-up",
        calendarTitle: "",
        calendarDuration: 30,
        calendarDescription: "",
        timeSlots: "9-5",
        includeConferenceBridge: true,
        meetingLocation: ""
      },
      {
        id: "step-4",
        type: "email" as const,
        title: "Confirmation Email",
        description: "Meeting confirmation email (sent if meeting is accepted)",
        delay: "When meeting accepted",
        enabled: true,
        icon: CheckCircle,
        badgeColor: "bg-emerald-100 text-emerald-800",
        delayAmount: 0,
        delayUnit: "hours" as const,
        emailSubject: "Looking forward to our meeting tomorrow",
        emailBody: "Hi [First Name],\n\nThank you for accepting our meeting invitation! I'm looking forward to our conversation tomorrow at [Time].\n\nDuring our 30-minute discussion, we'll cover:\n• How companies like yours are increasing meeting booking rates by 300%\n• Specific strategies for automating your outbound calendar process\n• Next steps for implementing this at [Company]\n\nSee you soon!\n\nBest regards,\n[Your Name]",
        emailTemplate: "confirmation",
        calendarTitle: "",
        calendarDuration: 30,
        calendarDescription: "",
        timeSlots: "9-5",
        includeConferenceBridge: true,
        meetingLocation: ""
      },
      {
        id: "step-5",
        type: "stop" as const,
        title: "Stop Sequence",
        description: "End of cadence sequence",
        delay: "7 days after last step",
        enabled: true,
        icon: StopCircle,
        badgeColor: "bg-red-100 text-red-800",
        delayAmount: 7,
        delayUnit: "days" as const
      }
    ];
  };

  const [cadenceSteps, setCadenceSteps] = useState<CadenceStep[]>(getStepsForCadence());

  const handleEditStep = (step: CadenceStep, index: number) => {
    setEditingStep({ ...step });
    setEditingStepIndex(index);
    setEditStepModalOpen(true);
  };

  const handleSaveStep = () => {
    if (editingStep && editingStepIndex >= 0) {
      const updatedSteps = [...cadenceSteps];
      
      // Update delay display based on amount and unit
      const delayDisplay = editingStep.delayAmount === 0 ? 
        "Immediate" : 
        `${editingStep.delayAmount} ${editingStep.delayUnit}${editingStep.delayAmount !== 1 ? 's' : ''} after ${editingStepIndex === 0 ? 'start' : 'previous step'}`;
      
      updatedSteps[editingStepIndex] = {
        ...editingStep,
        delay: delayDisplay
      };
      
      setCadenceSteps(updatedSteps);
      setEditStepModalOpen(false);
      setEditingStep(null);
      setEditingStepIndex(-1);
    }
  };

  const handleCancelEdit = () => {
    setEditStepModalOpen(false);
    setEditingStep(null);
    setEditingStepIndex(-1);
  };

  const updateEditingStep = (field: keyof CadenceStep, value: any) => {
    if (editingStep) {
      setEditingStep({ ...editingStep, [field]: value });
    }
  };

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

  const calculateBookingPercentage = (bookedCount: number, prospectCount: number) => {
    if (prospectCount === 0) return 0;
    return Math.round((bookedCount / prospectCount) * 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  // Template helper functions
  const getEmailSubjectPlaceholder = (template?: string) => {
    switch (template) {
      case "standard-intro":
        return "Quick question about [Company] growth opportunities";
      case "value-proposition":
        return "Help [Company] increase meeting booking rates by 300%";
      case "case-study":
        return "Case study: How [Similar Company] increased meetings by 300%";
      case "problem-solving":
        return "Solving [Company]'s meeting scheduling challenges";
      case "social-proof":
        return "How companies like [Company] are increasing meeting rates";
      case "curiosity-gap":
        return "The strategy [Similar Company] used to triple their meetings";
      case "referral-style":
        return "[Mutual Connection] suggested we connect";
      case "follow-up":
        return "Following up on our meeting invite";
      case "confirmation":
        return "Looking forward to our meeting tomorrow";
      case "no-show-recovery":
        return "Sorry we missed each other - let's reschedule!";
      default:
        return "Enter email subject line...";
    }
  };

  const getEmailBodyPlaceholder = (template?: string) => {
    switch (template) {
      case "standard-intro":
        return `Hi [First Name],

I noticed you're the [Title] at [Company] and wanted to reach out with a quick question.

We've been helping similar companies in [Industry] increase their meeting booking rates by 300% through automated calendar scheduling.

Would you be open to a brief 15-minute call this week to discuss how this could impact [Company]?

Best regards,
[Your Name]`;
      case "value-proposition":
        return `Hi [First Name],

I thought you might be interested in a use case we did with [Similar Company] using our automated calendar scheduling platform.

By automating their outbound calendar invites, they increased first meetings by over 300% while keeping a 35% conversion rate to second meetings.

If this sounds interesting to you, I've sent you an invite for [Date], but if the time doesn't work for you please propose a different time.

Thanks,
[Your Name]`;
      case "case-study":
        return `Hi [First Name],

I wanted to share a quick case study that might interest you.

[Similar Company] was struggling with low meeting booking rates from their outbound efforts. After implementing our automated calendar scheduling solution, they saw a 300% increase in first meetings within 60 days.

Would you be interested in a brief call to discuss how this could work for [Company]?

Best regards,
[Your Name]`;
      case "problem-solving":
        return `Hi [First Name],

I've been researching [Company] and noticed you might be facing some challenges with meeting scheduling and prospect engagement.

We specialize in helping companies like yours solve this exact problem. Our clients typically see a 3x increase in meeting booking rates within the first month.

Would you be open to a quick call to discuss your current challenges and how we might help?

Best regards,
[Your Name]`;
      case "social-proof":
        return `Hi [First Name],

Companies in [Industry] are increasingly using automated calendar scheduling to improve their sales processes.

We've helped organizations like [Similar Company] and [Another Company] increase their meeting booking rates by an average of 300%.

I'd love to share some specific strategies that could work for [Company]. Are you free for a brief call this week?

Best regards,
[Your Name]`;
      case "curiosity-gap":
        return `Hi [First Name],

There's a strategy that [Similar Company] used to triple their meeting booking rates in just 60 days.

It's not what most people would expect, and it's actually quite simple to implement.

Would you be curious to learn what they did? I'd be happy to share the details on a quick call.

Best regards,
[Your Name]`;
      case "referral-style":
        return `Hi [First Name],

[Mutual Connection] mentioned that [Company] might be interested in improving your meeting booking rates.

We've been helping companies in [Industry] automate their calendar scheduling process, with most seeing a 300% increase in booked meetings.

[Mutual Connection] thought this might be relevant for your team. Would you be open to a brief conversation?

Best regards,
[Your Name]`;
      case "follow-up":
        return `Hi [First Name],

I wanted to follow up on the meeting invite I sent a few days ago.

I understand calendars can get busy, so I wanted to make sure you saw the opportunity to discuss how we can help [Company] increase meeting booking rates.

If the current time doesn't work, I'm happy to find a better slot that fits your schedule.

Best regards,
[Your Name]`;
      case "confirmation":
        return `Hi [First Name],

Thank you for accepting our meeting invitation! I'm looking forward to our conversation on [Date] at [Time].

During our 30-minute discussion, we'll cover:
• How companies like yours are increasing meeting booking rates by 300%
• Specific strategies for automating your outbound calendar process  
• Next steps for implementing this at [Company]

See you soon!

Best regards,
[Your Name]`;
      case "no-show-recovery":
        return `Hi [First Name],

Sorry we missed you on [Meeting Date] - no biggie!

I've updated our meeting invite to [New Date] (a month out) to give us both more flexibility.

If that doesn't work for you, please just hit reply and propose a new time that works better.

Looking forward to connecting!

Best regards,
[Your Name]`;
      default:
        return "Enter your email content here...\n\nUse variables like [First Name], [Company], [Title] for personalization.";
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("cadences")}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{cadenceData.name}</h1>
                {getStatusBadge(cadenceData.statusType, cadenceData.status)}
              </div>
              <p className="text-sm text-gray-600">
                {cadenceData.name === "No Show Follow-up" ? 
                  `${cadenceData.steps} steps • Automated no-show recovery • Created ${formatDate(cadenceData.dateCreated)}` : 
                  `${cadenceData.steps} steps • Created ${formatDate(cadenceData.dateCreated)}`
                }
                {cadenceData.dateFinished && ` • Completed ${formatDate(cadenceData.dateFinished)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700"
              onClick={() => onNavigate("edit-cadence", undefined, cadenceData)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Cadence
            </Button>
            {cadenceData.statusType === "active" ? (
              <Button variant="outline" size="sm" className="text-amber-700 border-amber-200 hover:bg-amber-50">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                <Play className="h-4 w-4 mr-2" />
                Restart
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clone
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Prospects</p>
                  <p className="text-2xl font-semibold text-gray-900">{cadenceData.prospectCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Meetings Booked</p>
                  <p className="text-2xl font-semibold text-gray-900">{cadenceData.bookedCount}</p>
                  <p className="text-xs text-gray-500">{cadenceData.bookedMeetings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Booking Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {calculateBookingPercentage(cadenceData.bookedCount, cadenceData.prospectCount)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {cadenceData.bookedCount}/{cadenceData.prospectCount} prospects
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-2xl font-semibold text-gray-900">Good</p>
                  <p className="text-xs text-gray-500">Above average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cadence Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Cadence Steps
            </CardTitle>
            <p className="text-gray-600">
              {cadenceData.name === "No Show Follow-up" ? 
                `Automated ${cadenceSteps.length}-step recovery sequence for meeting no-shows` : 
                `Sequence of ${cadenceSteps.length} steps in this cadence`
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cadenceSteps.map((step, index) => (
                <div key={step.id}>
                  <div 
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => handleEditStep(step, index)}
                  >
                    {/* Step Icon and Number */}
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step.type === "email" ? "bg-blue-100" :
                        step.type === "calendar" ? "bg-green-100" :
                        step.type === "stop" ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        <step.icon className={`h-5 w-5 ${
                          step.type === "email" ? "text-blue-600" :
                          step.type === "calendar" ? "text-green-600" :
                          step.type === "stop" ? "text-red-600" : "text-gray-600"
                        }`} />
                      </div>
                      {index < cadenceSteps.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">
                            Step {index + 1}: {step.title}
                          </h3>
                          <Badge className={step.badgeColor}>
                            {index + 1}
                          </Badge>
                          {step.type === "stop" && (
                            <Badge variant="outline" className="text-red-600">
                              Final Step
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {step.delay}
                          </div>
                          {step.enabled ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Disabled
                            </Badge>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {step.description}
                      </p>

                      {/* Template Preview */}
                      {step.type === "email" && step.emailSubject && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-700 mb-2">📧 Email Template Preview:</p>
                          <div className="text-xs text-blue-600 space-y-1">
                            <p><strong>Subject:</strong> {step.emailSubject}</p>
                            <div className="mt-2 space-y-1 text-xs max-h-20 overflow-y-auto">
                              <p className="whitespace-pre-line">{step.emailBody?.substring(0, 200)}...</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {step.type === "calendar" && step.calendarTitle && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs font-medium text-green-700 mb-2">📅 Calendar Template Preview:</p>
                          <div className="text-xs text-green-600 space-y-1">
                            <p><strong>Title:</strong> {step.calendarTitle}</p>
                            <p><strong>Duration:</strong> {step.calendarDuration} minutes</p>
                            <div className="mt-2 space-y-1 text-xs max-h-20 overflow-y-auto">
                              <p className="whitespace-pre-line">{step.calendarDescription?.substring(0, 150)}...</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            step.type === "email" ? "bg-blue-400" :
                            step.type === "calendar" ? "bg-green-400" :
                            "bg-red-400"
                          }`}></div>
                          {step.type === "email" ? "Email" : 
                           step.type === "calendar" ? "Calendar Invite" : 
                           "Stop Sequence"}
                        </span>
                        <span>•</span>
                        <span>Trigger: {step.delay}</span>
                        {step.type !== "stop" && (
                          <>
                            <span>•</span>
                            <span>Template: {
                              step.emailTemplate ? 
                                step.emailTemplate.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                              step.calendarTemplate ?
                                step.calendarTemplate.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                              "Standard"
                            }</span>
                          </>
                        )}
                        <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          Click to edit →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Step Modal */}
      <Dialog open={editStepModalOpen} onOpenChange={setEditStepModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Step {editingStepIndex + 1}: {editingStep?.title}
            </DialogTitle>
            <DialogDescription>
              Modify the settings and content for this cadence step
            </DialogDescription>
          </DialogHeader>

          {editingStep && (
            <div className="space-y-6">
              {/* Step Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stepTitle">Step Title</Label>
                  <Input
                    id="stepTitle"
                    value={editingStep.title}
                    onChange={(e) => updateEditingStep('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Step Type</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                    <editingStep.icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium capitalize">{editingStep.type}</span>
                    <Badge variant="outline" className="ml-auto">
                      {editingStep.type === "email" ? "Email" : 
                       editingStep.type === "calendar" ? "Calendar Invite" : 
                       "Stop Sequence"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              {editingStep.type === "email" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Email Template</h4>
                  <div className="space-y-2">
                    <Label htmlFor="emailTemplate">Template Type</Label>
                    <Select 
                      value={editingStep.emailTemplate || "standard-intro"} 
                      onValueChange={(value) => updateEditingStep('emailTemplate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard-intro">Standard Introduction</SelectItem>
                        <SelectItem value="value-proposition">Value Proposition</SelectItem>
                        <SelectItem value="case-study">Case Study Focus</SelectItem>
                        <SelectItem value="problem-solving">Problem Solving</SelectItem>
                        <SelectItem value="social-proof">Social Proof</SelectItem>
                        <SelectItem value="curiosity-gap">Curiosity Gap</SelectItem>
                        <SelectItem value="referral-style">Referral Style</SelectItem>
                        <SelectItem value="follow-up">Follow-up Email</SelectItem>
                        <SelectItem value="confirmation">Meeting Confirmation</SelectItem>
                        <SelectItem value="no-show-recovery">No-Show Recovery</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {editingStep.type === "calendar" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Calendar Template</h4>
                  <div className="space-y-2">
                    <Label htmlFor="calendarTemplate">Template Type</Label>
                    <Select 
                      value={editingStep.calendarTemplate || "standard-intro"} 
                      onValueChange={(value) => updateEditingStep('calendarTemplate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard-intro">Standard Introduction Meeting</SelectItem>
                        <SelectItem value="discovery-call">Discovery Call</SelectItem>
                        <SelectItem value="product-demo">Product Demo</SelectItem>
                        <SelectItem value="strategy-session">Strategy Session</SelectItem>
                        <SelectItem value="follow-up-meeting">Follow-up Meeting</SelectItem>
                        <SelectItem value="reschedule">Reschedule Meeting</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="stepDescription">Description</Label>
                <Textarea
                  id="stepDescription"
                  value={editingStep.description}
                  onChange={(e) => updateEditingStep('description', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Timing */}
              {editingStep.type !== "stop" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Timing</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delayAmount">Delay Amount</Label>
                      <Input
                        id="delayAmount"
                        type="number"
                        min="0"
                        value={editingStep.delayAmount || 0}
                        onChange={(e) => updateEditingStep('delayAmount', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delayUnit">Delay Unit</Label>
                      <Select 
                        value={editingStep.delayUnit} 
                        onValueChange={(value) => updateEditingStep('delayUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Step Enabled</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Switch
                          checked={editingStep.enabled}
                          onCheckedChange={(checked) => updateEditingStep('enabled', checked)}
                        />
                        <span className="text-sm text-gray-600">
                          {editingStep.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Content */}
              {editingStep.type === "email" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Email Content</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Subject Line</Label>
                      <Input
                        id="emailSubject"
                        value={editingStep.emailSubject || ""}
                        onChange={(e) => updateEditingStep('emailSubject', e.target.value)}
                        placeholder={getEmailSubjectPlaceholder(editingStep.emailTemplate)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Email Body</Label>
                      <Textarea
                        id="emailBody"
                        value={editingStep.emailBody || ""}
                        onChange={(e) => updateEditingStep('emailBody', e.target.value)}
                        placeholder={getEmailBodyPlaceholder(editingStep.emailTemplate)}
                        rows={12}
                      />
                      {(editingStep.emailTemplate && editingStep.emailTemplate !== "custom") && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              updateEditingStep('emailSubject', getEmailSubjectPlaceholder(editingStep.emailTemplate));
                              updateEditingStep('emailBody', getEmailBodyPlaceholder(editingStep.emailTemplate));
                            }}
                          >
                            Load Template Content
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Use variables like [First Name], [Company], [Title], [Meeting Date] for personalization
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Content */}
              {editingStep.type === "calendar" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Calendar Invite Settings</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calendarTitle">Meeting Title</Label>
                        <Input
                          id="calendarTitle"
                          value={editingStep.calendarTitle || ""}
                          onChange={(e) => updateEditingStep('calendarTitle', e.target.value)}
                          placeholder="Enter meeting title..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calendarDuration">Duration (minutes)</Label>
                        <Select 
                          value={editingStep.calendarDuration?.toString()} 
                          onValueChange={(value) => updateEditingStep('calendarDuration', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeSlots">Available Time Slots</Label>
                      <Select 
                        value={editingStep.timeSlots} 
                        onValueChange={(value) => updateEditingStep('timeSlots', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
                          <SelectItem value="morning">Morning only (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">After lunch (1 PM - 5 PM)</SelectItem>
                          <SelectItem value="lunch">Lunch time (11 AM - 2 PM)</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calendarDescription">Meeting Description</Label>
                      <Textarea
                        id="calendarDescription"
                        value={editingStep.calendarDescription || ""}
                        onChange={(e) => updateEditingStep('calendarDescription', e.target.value)}
                        rows={4}
                        placeholder="Enter meeting description and agenda..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingStep.includeConferenceBridge}
                          onCheckedChange={(checked) => updateEditingStep('includeConferenceBridge', checked)}
                        />
                        <Label>Include conference bridge link</Label>
                      </div>

                      {!editingStep.includeConferenceBridge && (
                        <div className="space-y-2">
                          <Label htmlFor="meetingLocation">Meeting Location</Label>
                          <Input
                            id="meetingLocation"
                            value={editingStep.meetingLocation || ""}
                            onChange={(e) => updateEditingStep('meetingLocation', e.target.value)}
                            placeholder="Enter physical address, restaurant, or leave blank..."
                          />
                          <p className="text-xs text-gray-500">
                            Can be a physical address, restaurant, or left blank for flexibility
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveStep}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}