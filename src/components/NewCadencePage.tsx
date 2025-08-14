import { useState, forwardRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Slider } from "./ui/slider";
import { ArrowLeft, Calendar, Mail, RotateCcw, StopCircle, CheckCircle, Trash2, Plus, ChevronUp, ChevronDown, Copy, Settings, Clock, Users, Shield, Lock, Video, MapPin, CalendarIcon, Tag, User, Building } from "lucide-react";

interface CadenceData {
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

interface NewCadencePageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "edit-cadence" | "clone-cadence" | "prospect-upload", campaignInfo?: Partial<{ prospectCount: number; campaignName: string; status: "active" | "paused" | "completed" }>, cadenceData?: any, reportsView?: any) => void;
  editingCadence?: CadenceData;
  onSaveCadence: (cadenceData: Omit<CadenceData, 'id'>) => CadenceData;
  onUpdateCadence?: (id: number, updates: Partial<CadenceData>) => void;
}

interface CadenceStep {
  id: string;
  type: "email" | "calendar" | "stop";
  title: string;
  icon: any;
  badge: string;
  badgeColor: string;
  enabled: boolean;
  data: any;
}

export function NewCadencePage({ onNavigate, editingCadence, onSaveCadence, onUpdateCadence }: NewCadencePageProps) {
  const [cadenceName, setCadenceName] = useState(editingCadence?.name || "");
  const [emailTemplate, setEmailTemplate] = useState("standard-intro");
  const [customEmailSubject, setCustomEmailSubject] = useState("Quick chat about increasing first meetings by 300% at {{company}}?");
  const [customEmailBody, setCustomEmailBody] = useState("");
  const [calendarTemplate, setCalendarTemplate] = useState("standard-intro");
  const [customCalendarDescription, setCustomCalendarDescription] = useState("");
  const [customCalendarTitle, setCustomCalendarTitle] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [timeSlot, setTimeSlot] = useState("business-hours");
  const [followupEmailTemplate, setFollowupEmailTemplate] = useState("value-proposition-follow-up");
  const [customFollowupEmailSubject, setCustomFollowupEmailSubject] = useState("Follow-up: {{company}} and 300% meeting increase opportunity");
  const [customFollowupEmailBody, setCustomFollowupEmailBody] = useState("");
  const [confirmationEmailTemplate, setConfirmationEmailTemplate] = useState("standard-confirmation");
  const [customConfirmationEmailSubject, setCustomConfirmationEmailSubject] = useState("Looking forward to our meeting on {{meeting_date}}");
  const [customConfirmationEmailBody, setCustomConfirmationEmailBody] = useState("");

  const [steps, setSteps] = useState<CadenceStep[]>([
    {
      id: "step-1",
      type: "email",
      title: "Initial Email",
      icon: Mail,
      badge: "1",
      badgeColor: "bg-blue-100 text-blue-800",
      enabled: true,
      data: {}
    },
    {
      id: "step-2", 
      type: "calendar",
      title: "Initial Calendar\nInvite",
      icon: Calendar,
      badge: "2",
      badgeColor: "bg-green-100 text-green-800",
      enabled: true,
      data: {}
    },
    {
      id: "step-3",
      type: "email", 
      title: "Follow-up Email",
      icon: Mail,
      badge: "3",
      badgeColor: "bg-purple-100 text-purple-800",
      enabled: true,
      data: {}
    },
    {
      id: "step-4",
      type: "email",
      title: "Confirmation Email\n(if meeting accepted)",
      icon: CheckCircle,
      badge: "4", 
      badgeColor: "bg-emerald-100 text-emerald-800",
      enabled: true,
      data: {}
    },
    {
      id: "step-5",
      type: "stop",
      title: "Stop Sequence",
      icon: StopCircle,
      badge: "5",
      badgeColor: "bg-red-100 text-red-800",
      enabled: true,
      data: {}
    }
  ]);

  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [selectedStepType, setSelectedStepType] = useState<"email" | "calendar">("email");
  const [stepToAddAfter, setStepToAddAfter] = useState<string>("");

  // Cadence Settings State
  const [calendarInvitesPerDay, setCalendarInvitesPerDay] = useState(25);
  const [meetingDuration, setMeetingDuration] = useState("30");
  const [fillTimeSlots, setFillTimeSlots] = useState(false);
  const [allowOverlapping, setAllowOverlapping] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00"); // 9:00 AM
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00"); // 5:00 PM
  const [emailDelay, setEmailDelay] = useState("immediate");
  const [calendarDelay, setCalendarDelay] = useState("immediate");
  const [randomizeTimings, setRandomizeTimings] = useState(true);
  const [spamPrevention, setSpamPrevention] = useState({
    addRandomDelay: true,
    limitDailyVolume: true,
    warmupDomain: false,
    trackOpens: true,
    throttleEmails: true,
    respectUnsubscribes: true
  });

  // Conference Bridge Settings
  const [includeConferenceBridge, setIncludeConferenceBridge] = useState(true);

  // Meeting Date Settings - for when the meeting should be scheduled
  const [meetingDateOption, setMeetingDateOption] = useState("1-week");

  // Send Time Settings
  const [sendTimePreference, setSendTimePreference] = useState("morning");
  const [fillFullDay, setFillFullDay] = useState(false);
  
  // Meeting Time of Day Settings - for calendar invites
  const [meetingTimeOfDay, setMeetingTimeOfDay] = useState("anytime");

  // Stop Sequence Conditions
  const [stopConditions, setStopConditions] = useState({
    prospectReplies: true,
    meetingAccepted: true,
    meetingDeclined: false,
    unsubscribed: true,
    bounced: true
  });

  // Company Exclusion Settings
  const [excludeCompanyOnAcceptance, setExcludeCompanyOnAcceptance] = useState(true);

  // Custom Date Selection State
  const [meetingSetDate, setMeetingSetDate] = useState("1-week");
  const [customMeetingDate, setCustomMeetingDate] = useState<Date | undefined>();
  const [meetingDatePickerOpen, setMeetingDatePickerOpen] = useState(false);
  const [customEmailDelayDate, setCustomEmailDelayDate] = useState<Date | undefined>();
  const [emailDelayPickerOpen, setEmailDelayPickerOpen] = useState(false);
  const [customCalendarDelayDate, setCustomCalendarDelayDate] = useState<Date | undefined>();
  const [customCalendarDelayTime, setCustomCalendarDelayTime] = useState("09:00"); // 9:00 AM
  const [calendarDelayPickerOpen, setCalendarDelayPickerOpen] = useState(false);
  
  // Custom Meeting Date Calendar State
  const [customMeetingCalendarOpen, setCustomMeetingCalendarOpen] = useState(false);
  const [selectedCustomMeetingDate, setSelectedCustomMeetingDate] = useState<Date | undefined>();
  
  // Get the user's connected conference bridge from account settings
  const getConnectedConferenceBridge = () => {
    // This would typically come from global state or props
    // For now, we'll simulate the connected integration
    return {
      name: "Zoom",
      provider: "zoom",
      connected: true
    };
  };

  const connectedBridge = getConnectedConferenceBridge();

  // Meeting date options for calendar invites
  const meetingDateOptions = [
    { value: "3-days", label: "3 business days from now" },
    { value: "2-weeks", label: "2 weeks from now (M-F)" },
    { value: "3-weeks", label: "3 weeks from now (M-F)" },
    { value: "1-month", label: "1 month from now (M-F)" },
    { value: "3-months", label: "3 months from now (M-F)" },
    { value: "first-of-year", label: "First of next year" },
    { value: "custom", label: "Custom date" },
  ];

  // Send time options
  const sendTimeOptions = [
    { value: "morning", label: "Morning (8-11 AM)" },
    { value: "lunch", label: "Lunch time (11 AM-2 PM)" },
    { value: "afternoon", label: "Afternoon (2-5 PM)" },
    { value: "evening", label: "Evening (5-8 PM)" },
  ];

  // Meeting time of day options for calendar invites
  const meetingTimeOfDayOptions = [
    { value: "anytime", label: "Anytime" },
    { value: "morning", label: "Morning (8-11 AM)" },
    { value: "lunch", label: "Lunch time (11 AM-2 PM)" },
    { value: "afternoon", label: "Afternoon (2-5 PM)" },
  ];

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Time conversion utilities
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertTo24Hour = (time12: string) => {
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (ampm === 'AM' && hour === 12) {
      hour = 0;
    } else if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const hour24 = i.toString().padStart(2, '0');
      const time24 = `${hour24}:00`;
      const time12 = convertTo12Hour(time24);
      times.push({ value: time24, label: time12 });
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Handle meeting set date change
  const handleMeetingSetDateChange = (value: string) => {
    setMeetingSetDate(value);
    if (value !== "custom") {
      setCustomMeetingDate(undefined);
      setSelectedCustomMeetingDate(undefined);
    }
  };

  // Handle meeting date option change
  const handleMeetingDateOptionChange = (value: string) => {
    setMeetingDateOption(value);
    if (value === "custom") {
      setCustomMeetingCalendarOpen(true);
    } else {
      setSelectedCustomMeetingDate(undefined);
    }
  };

  // Handle custom meeting date selection
  const handleCustomMeetingDateSelect = (date: Date | undefined) => {
    setSelectedCustomMeetingDate(date);
    setCustomMeetingCalendarOpen(false);
  };

  // Check if a date is in the past
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle email delay change
  const handleEmailDelayChange = (value: string) => {
    setEmailDelay(value);
    if (value !== "custom") {
      setCustomEmailDelayDate(undefined);
    }
  };

  // Handle calendar delay change
  const handleCalendarDelayChange = (value: string) => {
    setCalendarDelay(value);
    if (value === "custom") {
      setCalendarDelayPickerOpen(true);
    } else {
      setCustomCalendarDelayDate(undefined);
      setCustomCalendarDelayTime("09:00"); // Reset to 9:00 AM
    }
  };

  // Handle custom calendar delay date/time selection
  const handleCustomCalendarDelaySelect = (date: Date | undefined) => {
    setCustomCalendarDelayDate(date);
    if (date) {
      // Keep the popover open to allow time selection
      // Don't close it here
    }
  };

  const handleCustomCalendarDelayTimeChange = (time: string) => {
    setCustomCalendarDelayTime(time);
  };

  const handleCalendarDelayConfirm = () => {
    setCalendarDelayPickerOpen(false);
  };

  const handleSaveTemplate = () => {
    // Handle saving the cadence as a template
    const templateData = {
      id: editingCadence?.id,
      name: cadenceName,
      steps: steps,
      settings: {
        calendarInvitesPerDay,
        meetingDuration,
        meetingDateOption,
        meetingTimeOfDay,
        sendTimePreference,
        fillFullDay,
        fillTimeSlots,
        allowOverlapping,
        workingHours: { start: workingHoursStart, end: workingHoursEnd },
        delays: { email: emailDelay, calendar: calendarDelay },
        randomizeTimings,
        spamPrevention,
        stopConditions,
        excludeCompanyOnAcceptance,
        conferenceBridge: {
          include: includeConferenceBridge,
          provider: connectedBridge.provider
        }
      },
      templates: {
        email: emailTemplate,
        calendar: calendarTemplate,
        followup: followupEmailTemplate,
        confirmation: confirmationEmailTemplate
      },
      customContent: {
        emailSubject: customEmailSubject,
        emailBody: customEmailBody,
        calendarTitle: customCalendarTitle,
        calendarDescription: customCalendarDescription,
        followupEmailSubject: customFollowupEmailSubject,
        followupEmailBody: customFollowupEmailBody,
        confirmationEmailSubject: customConfirmationEmailSubject,
        confirmationEmailBody: customConfirmationEmailBody,
        meetingLocation: meetingLocation,
        timeSlot: timeSlot,
        meetingTimeOfDay: meetingTimeOfDay
      },
      customDates: {
        meetingSetDate: meetingSetDate === "custom" ? customMeetingDate : null,
        emailDelay: emailDelay === "custom" ? customEmailDelayDate : null,
        calendarDelay: calendarDelay === "custom" ? customCalendarDelayDate : null,
        followupEmailDelay: followupEmailDelay === "custom" ? customFollowupEmailDate : null
      }
    };
    
    console.log(editingCadence ? "Updating cadence..." : "Saving cadence template...", templateData);
    
    // Check if this is a clone operation (if the name starts with "(Clone)")
    const isClone = editingCadence && editingCadence.name.startsWith("(Clone)");
    
    if (isClone || !editingCadence) {
      // Creating a new cadence (either brand new or clone)
      const newCadenceData = {
        name: cadenceName,
        steps: steps.length,
        assigned: "You",
        bookedMeetings: "0 booked, 0 tentative",
        bookedCount: 0,
        prospectCount: 0,
        status: "Active",
        statusType: "active" as const,
        dateCreated: new Date().toISOString().split('T')[0],
        dateFinished: null,
      };
      
      const savedCadence = onSaveCadence(newCadenceData);
      alert(isClone ? "Cadence cloned successfully with all settings!" : "Cadence created successfully with all settings!");
      onNavigate("cadences");
    } else {
      // Updating existing cadence
      if (onUpdateCadence) {
        onUpdateCadence(editingCadence.id, {
          name: cadenceName,
          steps: steps.length,
        });
      }
      alert("Cadence updated successfully!");
      onNavigate("cadence-detail", undefined, editingCadence);
    }
  };

  const handleNextToProspects = () => {
    // First save the cadence, then navigate to prospect upload
    const newCadenceData = {
      name: cadenceName,
      steps: steps.length,
      assigned: "You",
      bookedMeetings: "0 booked, 0 tentative",
      bookedCount: 0,
      prospectCount: 0,
      status: "Active",
      statusType: "active" as const,
      dateCreated: new Date().toISOString().split('T')[0],
      dateFinished: null,
    };
    
    const savedCadence = onSaveCadence(newCadenceData);
    console.log("Cadence saved before proceeding to prospects:", savedCadence);
    
    // Navigate to prospect upload page with cadence settings
    onNavigate("prospect-upload", undefined, { 
      ...savedCadence, 
      settings: { calendarInvitesPerDay }
    });
  };

  const handleCancel = () => {
    // Check if this is a clone operation (if the name starts with "(Clone)")
    const isClone = editingCadence && editingCadence.name.startsWith("(Clone)");
    
    if (isClone || !editingCadence) {
      onNavigate("cadences");
    } else {
      // For editing existing cadences, go back to the cadence detail
      onNavigate("cadence-detail", undefined, editingCadence);
    }
  };

  // Calendar delay options
  const calendarDelayOptions = [
    { value: "immediate", label: "Send now" },
    { value: "5-minutes", label: "Delay 5 minutes" },
    { value: "1-hour", label: "Delay 1 hour" },
    { value: "custom", label: "Custom" },
  ];

  // Email delay options
  const emailDelayOptions = [
    { value: "immediate", label: "Send immediately" },
    { value: "3-days", label: "3 days" },
    { value: "1-week", label: "1 week" },
    { value: "custom", label: "Custom" },
  ];

  // Follow-up email delay state
  const [followupEmailDelay, setFollowupEmailDelay] = useState("3-days");
  const [customFollowupEmailDate, setCustomFollowupEmailDate] = useState<Date | undefined>();
  const [followupEmailDelayPickerOpen, setFollowupEmailDelayPickerOpen] = useState(false);

  // Dynamic tags state
  const [showEmailTagsDropdown, setShowEmailTagsDropdown] = useState(false);
  const [showEmailSubjectTagsDropdown, setShowEmailSubjectTagsDropdown] = useState(false);
  const [showCalendarTitleTagsDropdown, setShowCalendarTitleTagsDropdown] = useState(false);
  const [showCalendarDescTagsDropdown, setShowCalendarDescTagsDropdown] = useState(false);
  const [showFollowupTagsDropdown, setShowFollowupTagsDropdown] = useState(false);
  const [showFollowupSubjectTagsDropdown, setShowFollowupSubjectTagsDropdown] = useState(false);
  const [showConfirmationTagsDropdown, setShowConfirmationTagsDropdown] = useState(false);
  const [showConfirmationSubjectTagsDropdown, setShowConfirmationSubjectTagsDropdown] = useState(false);

  // Dynamic tags configuration
  const dynamicTags = [
    { 
      tag: "{{first_name}}", 
      description: "Prospect's first name",
      icon: User,
      category: "Personal"
    },
    { 
      tag: "{{last_name}}", 
      description: "Prospect's last name",
      icon: User,
      category: "Personal"
    },
    { 
      tag: "{{full_name}}", 
      description: "Prospect's full name",
      icon: User,
      category: "Personal"
    },
    { 
      tag: "{{title}}", 
      description: "Prospect's job title",
      icon: User,
      category: "Professional"
    },
    { 
      tag: "{{company}}", 
      description: "Prospect's company name",
      icon: Building,
      category: "Professional"
    },
    { 
      tag: "{{email}}", 
      description: "Prospect's email address",
      icon: Mail,
      category: "Contact"
    },
    { 
      tag: "{{meeting_date}}", 
      description: "Meeting date (formatted)",
      icon: Calendar,
      category: "Meeting"
    },
    { 
      tag: "{{meeting_time}}", 
      description: "Meeting time",
      icon: Clock,
      category: "Meeting"
    },
    { 
      tag: "{{campaign}}", 
      description: "Campaign name",
      icon: Tag,
      category: "Campaign"
    },
    { 
      tag: "{{sender_name}}", 
      description: "Your name",
      icon: User,
      category: "Sender"
    }
  ];

  const handleFollowupEmailDelayChange = (value: string) => {
    setFollowupEmailDelay(value);
    if (value !== "custom") {
      setCustomFollowupEmailDate(undefined);
    }
  };

  // Template change handlers
  const handleEmailTemplateChange = (value: string) => {
    setEmailTemplate(value);
    if (value === "custom") {
      setCustomEmailSubject("");
      setCustomEmailBody("");
    } else {
      setCustomEmailSubject(getEmailSubjectContent());
      setCustomEmailBody(getEmailBodyContent());
    }
  };

  const handleFollowupEmailTemplateChange = (value: string) => {
    setFollowupEmailTemplate(value);
    if (value === "custom") {
      setCustomFollowupEmailSubject("");
      setCustomFollowupEmailBody("");
    } else {
      setCustomFollowupEmailSubject(getFollowupEmailSubjectContent());
      setCustomFollowupEmailBody(getFollowupEmailBodyContent());
    }
  };

  const handleConfirmationEmailTemplateChange = (value: string) => {
    setConfirmationEmailTemplate(value);
    if (value === "custom") {
      setCustomConfirmationEmailSubject("");
      setCustomConfirmationEmailBody("");
    } else {
      setCustomConfirmationEmailSubject(getConfirmationEmailSubjectContent());
      setCustomConfirmationEmailBody(getConfirmationEmailBodyContent());
    }
  };

  // Dynamic tags insertion functions
  const insertTagIntoEmailSubject = (tag: string) => {
    const input = document.getElementById('email-subject') as HTMLInputElement;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = customEmailSubject.substring(0, start) + tag + customEmailSubject.substring(end);
      setCustomEmailSubject(newValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomEmailSubject(customEmailSubject + tag);
    }
    setShowEmailSubjectTagsDropdown(false);
  };

  const insertTagIntoEmailBody = (tag: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = customEmailBody.substring(0, start) + tag + customEmailBody.substring(end);
      setCustomEmailBody(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomEmailBody(customEmailBody + tag);
    }
    setShowEmailTagsDropdown(false);
  };

  const insertTagIntoCalendarTitle = (tag: string) => {
    const input = document.getElementById('calendar-title') as HTMLInputElement;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = customCalendarTitle.substring(0, start) + tag + customCalendarTitle.substring(end);
      setCustomCalendarTitle(newValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomCalendarTitle(customCalendarTitle + tag);
    }
    setShowCalendarTitleTagsDropdown(false);
  };

  const insertTagIntoCalendarDescription = (tag: string) => {
    const textarea = document.getElementById('calendar-description') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = customCalendarDescription.substring(0, start) + tag + customCalendarDescription.substring(end);
      setCustomCalendarDescription(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomCalendarDescription(customCalendarDescription + tag);
    }
    setShowCalendarDescTagsDropdown(false);
  };

  const insertTagIntoFollowupEmailSubject = (tag: string) => {
    const input = document.getElementById('followup-email-subject') as HTMLInputElement;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = customFollowupEmailSubject.substring(0, start) + tag + customFollowupEmailSubject.substring(end);
      setCustomFollowupEmailSubject(newValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomFollowupEmailSubject(customFollowupEmailSubject + tag);
    }
    setShowFollowupSubjectTagsDropdown(false);
  };

  const insertTagIntoFollowupEmail = (tag: string) => {
    const textarea = document.getElementById('followup-email-body') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = customFollowupEmailBody.substring(0, start) + tag + customFollowupEmailBody.substring(end);
      setCustomFollowupEmailBody(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomFollowupEmailBody(customFollowupEmailBody + tag);
    }
    setShowFollowupTagsDropdown(false);
  };

  const insertTagIntoConfirmationEmailSubject = (tag: string) => {
    const input = document.getElementById('confirmation-email-subject') as HTMLInputElement;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = customConfirmationEmailSubject.substring(0, start) + tag + customConfirmationEmailSubject.substring(end);
      setCustomConfirmationEmailSubject(newValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomConfirmationEmailSubject(customConfirmationEmailSubject + tag);
    }
    setShowConfirmationSubjectTagsDropdown(false);
  };

  const insertTagIntoConfirmationEmail = (tag: string) => {
    const textarea = document.getElementById('confirmation-email-body') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = customConfirmationEmailBody.substring(0, start) + tag + customConfirmationEmailBody.substring(end);
      setCustomConfirmationEmailBody(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setCustomConfirmationEmailBody(customConfirmationEmailBody + tag);
    }
    setShowConfirmationTagsDropdown(false);
  };

  // Dynamic tags dropdown component
  const DynamicTagsDropdown = ({ onTagSelect }: { onTagSelect: (tag: string) => void }) => (
    <div className="w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
          Dynamic Tags
        </div>
        {["Personal", "Professional", "Contact", "Meeting", "Campaign", "Sender"].map(category => {
          const categoryTags = dynamicTags.filter(tag => tag.category === category);
          return (
            <div key={category} className="mb-3">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 px-2">
                {category}
              </div>
              {categoryTags.map(({ tag, description, icon: Icon }) => (
                <button
                  key={tag}
                  className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center gap-2"
                  onClick={() => onTagSelect(tag)}
                >
                  <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs text-blue-600 truncate">
                      {tag}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const getEmailSubjectContent = () => {
    return "Quick chat about increasing first meetings by 300% at {{company}}?";
  };

  const getEmailBodyContent = () => {
    return `Hi {{first_name}},

I thought you might be interested in a use case we did with Zoominfo using Booky. By automating their outbound calendar invites, they increased first meetings by over 300% while keeping a 35% conversion rate to second meetings.

If this sounds interesting to you. I've sent you an invite for the {{meeting_date}}, but if the time doesn't work for you please propose a different time.

Thanks,
{{sender_name}}`;
  };

  const getCalendarDescriptionContent = () => {
    return `Hi {{first_name}},

I thought you might be interested in talking about how we helped Zoominfo increase their first meetings by 300%. By using Booky to automate their outbound calendar invites, they increased first meetings by over 300% while keeping a 35% conversion rate to second meetings.

If this sounds interesting but this time doesn't work for you please propose a different time.

Thanks,
{{sender_name}}`;
  };

  const getCalendarTitleContent = () => {
    return "Booky and {{company}} Discussion on Increasing First Meetings";
  };

  const getFollowupEmailSubjectContent = () => {
    return "Follow-up: {{company}} and 300% meeting increase opportunity";
  };

  const getFollowupEmailBodyContent = () => {
    return `Hi {{first_name}},

I wanted to follow up on my previous email about how we helped Zoominfo increase their first meetings by 300% using Booky.

I know you're probably busy, but I thought this might be worth a quick 30-minute conversation. We've been helping companies automate their outbound calendar invites with some pretty impressive results.

I've sent over an invite for the {{meeting_date}}, but if the time doesn't work for you please propose a different time.

Thanks,
{{sender_name}}`;
  };

  const getConfirmationEmailSubjectContent = () => {
    return "Looking forward to our meeting on {{meeting_date}}";
  };

  const getConfirmationEmailBodyContent = () => {
    return `Hi {{first_name}},

Great! I'm looking forward to our meeting on {{meeting_date}} at {{meeting_time}}.

During our 30-minute conversation, we'll discuss:
• How Booky helped Zoominfo increase first meetings by 300%
• Specific strategies for automating your outbound calendar invites
• How this could work for {{company}}

If anything comes up and you need to reschedule, just let me know.

Thanks,
{{sender_name}}`;
  };

  const handleDeleteStep = (stepId: string) => {
    const stepToDelete = steps.find(step => step.id === stepId);
    if (stepToDelete?.type === "stop") {
      return; // Prevent deletion of stop sequence
    }
    
    const newSteps = steps.filter(step => step.id !== stepId);
    // Re-number all step badges
    newSteps.forEach((step, index) => {
      step.badge = (index + 1).toString();
    });
    setSteps(newSteps);
  };

  const handleAddStep = (afterStepId: string) => {
    const stepAfter = steps.find(step => step.id === afterStepId);
    if (stepAfter?.type === "stop") {
      return; // Prevent adding steps after stop sequence
    }
    setStepToAddAfter(afterStepId);
    setAddStepDialogOpen(true);
  };

  const handleCreateStep = () => {
    const afterIndex = steps.findIndex(step => step.id === stepToAddAfter);
    const stopIndex = steps.findIndex(step => step.type === "stop");
    
    // Ensure new steps are added before the stop sequence
    let insertIndex = afterIndex + 1;
    if (insertIndex > stopIndex) {
      insertIndex = stopIndex;
    }
    
    const newStep: CadenceStep = {
      id: `step-${Date.now()}`,
      type: selectedStepType,
      title: selectedStepType === "email" ? "New Email Step" : "New Calendar Invite",
      icon: selectedStepType === "email" ? Mail : Calendar,
      badge: (insertIndex + 1).toString(),
      badgeColor: selectedStepType === "email" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800",
      enabled: true,
      data: {
        // Initialize with default data for calendar steps
        ...(selectedStepType === "calendar" && {
          meetingDateOption: "1-week",
          meetingTimeOfDay: "anytime",
          meetingDuration: "30",
          includeConferenceBridge: true,
          allowOverlapping: false
        })
      }
    };
    
    const newSteps = [...steps];
    newSteps.splice(insertIndex, 0, newStep);
    
    // Re-number all step badges
    newSteps.forEach((step, index) => {
      step.badge = (index + 1).toString();
    });
    
    setSteps(newSteps);
    
    setAddStepDialogOpen(false);
    setSelectedStepType("email");
    setStepToAddAfter("");
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;
    
    const stepToMove = steps[currentIndex];
    if (stepToMove.type === "stop") {
      return; // Prevent moving stop sequence
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    // Prevent moving a step to the position of the stop sequence
    const targetStep = steps[newIndex];
    if (targetStep.type === "stop") return;
    
    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(currentIndex, 1);
    newSteps.splice(newIndex, 0, movedStep);
    
    // Re-number all step badges
    newSteps.forEach((step, index) => {
      step.badge = (index + 1).toString();
    });
    
    setSteps(newSteps);
  };

  const handleCloneStep = (stepId: string) => {
    const stepToClone = steps.find(step => step.id === stepId);
    if (!stepToClone || stepToClone.type === "stop") {
      return; // Prevent cloning of stop sequence
    }
    
    const clonedStep: CadenceStep = {
      ...stepToClone,
      id: `step-${Date.now()}`,
      title: `${stepToClone.title} (Copy)`
    };
    
    const originalIndex = steps.findIndex(step => step.id === stepId);
    const stopIndex = steps.findIndex(step => step.type === "stop");
    
    // Ensure cloned step is inserted before the stop sequence
    let insertIndex = originalIndex + 1;
    if (insertIndex > stopIndex) {
      insertIndex = stopIndex;
    }
    
    const newSteps = [...steps];
    newSteps.splice(insertIndex, 0, clonedStep);
    
    // Re-number all step badges
    newSteps.forEach((step, index) => {
      step.badge = (index + 1).toString();
    });
    
    setSteps(newSteps);
  };

  // Create a forwardRef Button component for tooltips
  const TooltipButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button> & { children: React.ReactNode }>(
    ({ children, ...props }, ref) => (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    )
  );
  TooltipButton.displayName = "TooltipButton";

  const StepActionButtons = ({ step, isFirst, isLast }: { step: CadenceStep, isFirst?: boolean, isLast?: boolean }) => {
    const isStopSequence = step.type === "stop";
    
    if (isStopSequence) {
      return (
        <TooltipProvider>
          <div className="flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 p-0 flex items-center justify-center">
                  <div className="h-4 w-4 rounded bg-gray-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded bg-gray-400"></div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop sequence is locked as final step</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-accent hover:text-accent-foreground rounded-md transition-all" onClick={() => handleDeleteStep(step.id)}>
              <Trash2 className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete step</p>
            </TooltipContent>
          </Tooltip>
          
          {!isLast && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-accent hover:text-accent-foreground rounded-md transition-all" onClick={() => handleAddStep(step.id)}>
                <Plus className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add step after</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-accent hover:text-accent-foreground rounded-md transition-all" onClick={() => handleCloneStep(step.id)}>
              <Copy className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Clone step</p>
            </TooltipContent>
          </Tooltip>
          
          {!isFirst && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-accent hover:text-accent-foreground rounded-md transition-all" onClick={() => handleMoveStep(step.id, 'up')}>
                <ChevronUp className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Move up</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {!isLast && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-accent hover:text-accent-foreground rounded-md transition-all" onClick={() => handleMoveStep(step.id, 'down')}>
                <ChevronDown className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Move down</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingCadence && editingCadence.name.startsWith("(Clone)") 
                  ? "Clone Cadence" 
                  : editingCadence 
                    ? "Edit Cadence" 
                    : "Create New Cadence"
                }
              </h1>
              <p className="text-gray-600">
                {editingCadence && editingCadence.name.startsWith("(Clone)")
                  ? "Create a copy of your cadence with all settings preserved"
                  : editingCadence
                    ? "Update your cadence settings and templates"
                    : "Set up your automated email and calendar invite sequence"
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingCadence && !editingCadence.name.startsWith("(Clone)") ? "Update Cadence" : "Save Cadence"}
            </Button>
            {(!editingCadence || editingCadence.name.startsWith("(Clone)")) && (
              <Button onClick={handleNextToProspects} className="bg-blue-600 hover:bg-blue-700">
                Next: Add Prospects
              </Button>
            )}
          </div>
        </div>

        {/* Cadence Name */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadence Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cadence Name
                </label>
                <Input
                  value={cadenceName}
                  onChange={(e) => setCadenceName(e.target.value)}
                  placeholder="Enter cadence name"
                  className="max-w-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadence Steps</CardTitle>
            <p className="text-sm text-gray-600">
              Configure your email and calendar invite sequence. Each step will execute automatically with your specified delays.
            </p>
            {editingCadence && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Editing Mode:</strong> All step configuration options are available, including meeting date selection, duration, and timing options for calendar invites. Your existing settings have been preserved.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isFirst = index === 0;
                const isLast = index === steps.length - 1;
                const isStopSequence = step.type === "stop";
                
                return (
                  <div key={step.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${step.badgeColor}`}>
                        {step.badge}
                      </div>
                      <div className="flex items-center gap-2">
                        <StepIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900 whitespace-pre-line">{step.title}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      {step.type === "email" && step.id === "step-1" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Template
                            </label>
                            <Select value={emailTemplate} onValueChange={handleEmailTemplateChange}>
                              <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <SelectValue placeholder="Select email template" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                                <SelectItem value="standard-intro" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Standard Introduction</span>
                                </SelectItem>
                                <SelectItem value="value-proposition" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Value Proposition</span>
                                </SelectItem>
                                <SelectItem value="case-study" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Case Study Focus</span>
                                </SelectItem>
                                <SelectItem value="custom" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Custom Template</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subject Line
                            </label>
                            <div className="relative">
                              <Input
                                id="email-subject"
                                value={customEmailSubject}
                                onChange={(e) => setCustomEmailSubject(e.target.value)}
                                placeholder="Enter email subject line"
                                className="pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showEmailSubjectTagsDropdown} onOpenChange={setShowEmailSubjectTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoEmailSubject} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Body
                            </label>
                            <div className="relative">
                              <Textarea
                                id="email-body"
                                value={customEmailBody || (emailTemplate !== "custom" ? getEmailBodyContent() : "")}
                                onChange={(e) => setCustomEmailBody(e.target.value)}
                                placeholder="Enter email content"
                                className="min-h-[120px] pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showEmailTagsDropdown} onOpenChange={setShowEmailTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoEmailBody} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Delay
                              </label>
                              <Select value={emailDelay} onValueChange={handleEmailDelayChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {emailDelayOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {emailDelay === "custom" && (
                                <Popover open={emailDelayPickerOpen} onOpenChange={setEmailDelayPickerOpen}>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {formatDate(customEmailDelayDate)}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={customEmailDelayDate}
                                      onSelect={setCustomEmailDelayDate}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Send Time
                              </label>
                              <Select value={sendTimePreference} onValueChange={setSendTimePreference}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sendTimeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {step.type === "calendar" && (
                        <div className="space-y-4">
                          {/* Calendar Step Header */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Calendar Invite Configuration</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              Configure meeting details, timing, and scheduling options for this calendar invite step.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Calendar Template
                            </label>
                            <Select value={calendarTemplate} onValueChange={setCalendarTemplate}>
                              <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <SelectValue placeholder="Select calendar template" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                                <SelectItem value="standard-intro" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Standard Meeting</span>
                                </SelectItem>
                                <SelectItem value="discovery-call" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Discovery Call</span>
                                </SelectItem>
                                <SelectItem value="demo" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Demo Meeting</span>
                                </SelectItem>
                                <SelectItem value="custom" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                  <span className="font-medium">Custom Template</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Meeting Title
                            </label>
                            <div className="relative">
                              <Input
                                id="calendar-title"
                                value={customCalendarTitle || getCalendarTitleContent()}
                                onChange={(e) => setCustomCalendarTitle(e.target.value)}
                                placeholder="Enter meeting title"
                                className="pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showCalendarTitleTagsDropdown} onOpenChange={setShowCalendarTitleTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoCalendarTitle} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Meeting Description
                            </label>
                            <div className="relative">
                              <Textarea
                                id="calendar-description"
                                value={customCalendarDescription || getCalendarDescriptionContent()}
                                onChange={(e) => setCustomCalendarDescription(e.target.value)}
                                placeholder="Enter meeting description"
                                className="min-h-[120px] pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showCalendarDescTagsDropdown} onOpenChange={setShowCalendarDescTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoCalendarDescription} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Meeting Duration
                              </label>
                              <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time of Day
                              </label>
                              <Select value={meetingTimeOfDay} onValueChange={setMeetingTimeOfDay}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {meetingTimeOfDayOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Calendar Delay
                              </label>
                              <Select value={calendarDelay} onValueChange={handleCalendarDelayChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {calendarDelayOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {calendarDelay === "custom" && (
                                <div className="mt-2">
                                  <Popover open={calendarDelayPickerOpen} onOpenChange={setCalendarDelayPickerOpen}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start text-left">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customCalendarDelayDate ? 
                                          `${formatDate(customCalendarDelayDate)} at ${convertTo12Hour(customCalendarDelayTime)}` : 
                                          "Select date and time"
                                        }
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <div className="p-4 space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Date
                                          </label>
                                          <CalendarComponent
                                            mode="single"
                                            selected={customCalendarDelayDate}
                                            onSelect={handleCustomCalendarDelaySelect}
                                            disabled={isDateDisabled}
                                            initialFocus
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Time
                                          </label>
                                          <Select 
                                            value={customCalendarDelayTime} 
                                            onValueChange={handleCustomCalendarDelayTimeChange}
                                          >
                                            <SelectTrigger>
                                              <SelectValue>
                                                {customCalendarDelayTime ? convertTo12Hour(customCalendarDelayTime) : "Select time"}
                                              </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                              {timeOptions.map(({ value, label }) => (
                                                <SelectItem key={value} value={value}>
                                                  {label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setCalendarDelayPickerOpen(false)}
                                          >
                                            Cancel
                                          </Button>
                                          <Button 
                                            size="sm"
                                            onClick={handleCalendarDelayConfirm}
                                            disabled={!customCalendarDelayDate}
                                          >
                                            Confirm
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              )}
                            </div>
                            
                            <div></div>
                          </div>

                          {/* Meeting Date Configuration - Highlighted Section */}
                          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="h-4 w-4 text-blue-600" />
                              <label className="block text-sm font-medium text-blue-800">
                                Meeting Date Selection
                              </label>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">Choose when the calendar invite should be scheduled for (future meeting date)</p>
                            <Select value={meetingDateOption} onValueChange={handleMeetingDateOptionChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {meetingDateOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {meetingDateOption === "custom" && selectedCustomMeetingDate && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-blue-900">Selected Date</p>
                                    <p className="text-sm text-blue-700">{formatDate(selectedCustomMeetingDate)}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCustomMeetingCalendarOpen(true)}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Change Date
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {meetingDateOption === "custom" && !selectedCustomMeetingDate && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-amber-900">No Date Selected</p>
                                    <p className="text-sm text-amber-700">Please select a custom meeting date</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCustomMeetingCalendarOpen(true)}
                                    className="text-amber-600 border-amber-300 hover:bg-amber-100"
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Select Date
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* End of Meeting Date Configuration */}

                          {/* Meeting Options */}
                          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Video className="h-4 w-4 text-purple-600" />
                              <h4 className="text-sm font-medium text-purple-800">Meeting Options</h4>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`conference-bridge-${step.id}`}
                                  checked={includeConferenceBridge}
                                  onCheckedChange={setIncludeConferenceBridge}
                                />
                                <label htmlFor={`conference-bridge-${step.id}`} className="text-sm font-medium text-purple-700 cursor-pointer">
                                  Include conference bridge ({connectedBridge.name})
                                </label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`allow-overlapping-${step.id}`}
                                  checked={allowOverlapping}
                                  onCheckedChange={setAllowOverlapping}
                                />
                                <label htmlFor={`allow-overlapping-${step.id}`} className="text-sm font-medium text-purple-700 cursor-pointer">
                                  Allow overlapping meetings (multiple meetings at the same time)
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {step.type === "email" && step.id === "step-3" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Follow-up Email Template
                            </label>
                            <Select value={followupEmailTemplate} onValueChange={handleFollowupEmailTemplateChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="value-proposition-follow-up">Value Proposition Follow-up</SelectItem>
                                <SelectItem value="case-study-follow-up">Case Study Follow-up</SelectItem>
                                <SelectItem value="social-proof">Social Proof</SelectItem>
                                <SelectItem value="custom">Custom Template</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subject Line
                            </label>
                            <div className="relative">
                              <Input
                                id="followup-email-subject"
                                value={customFollowupEmailSubject}
                                onChange={(e) => setCustomFollowupEmailSubject(e.target.value)}
                                placeholder="Enter follow-up email subject line"
                                className="pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showFollowupSubjectTagsDropdown} onOpenChange={setShowFollowupSubjectTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoFollowupEmailSubject} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Body
                            </label>
                            <div className="relative">
                              <Textarea
                                id="followup-email-body"
                                value={customFollowupEmailBody || (followupEmailTemplate !== "custom" ? getFollowupEmailBodyContent() : "")}
                                onChange={(e) => setCustomFollowupEmailBody(e.target.value)}
                                placeholder="Enter follow-up email content"
                                className="min-h-[120px] pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showFollowupTagsDropdown} onOpenChange={setShowFollowupTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoFollowupEmail} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Follow-up Delay
                            </label>
                            <Select value={followupEmailDelay} onValueChange={handleFollowupEmailDelayChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {emailDelayOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {followupEmailDelay === "custom" && (
                              <Popover open={followupEmailDelayPickerOpen} onOpenChange={setFollowupEmailDelayPickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formatDate(customFollowupEmailDate)}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={customFollowupEmailDate}
                                    onSelect={setCustomFollowupEmailDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {step.type === "email" && step.id === "step-4" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirmation Email Template
                            </label>
                            <Select value={confirmationEmailTemplate} onValueChange={handleConfirmationEmailTemplateChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard-confirmation">Standard Confirmation</SelectItem>
                                <SelectItem value="agenda-confirmation">Agenda Confirmation</SelectItem>
                                <SelectItem value="prep-confirmation">Meeting Prep</SelectItem>
                                <SelectItem value="custom">Custom Template</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subject Line
                            </label>
                            <div className="relative">
                              <Input
                                id="confirmation-email-subject"
                                value={customConfirmationEmailSubject}
                                onChange={(e) => setCustomConfirmationEmailSubject(e.target.value)}
                                placeholder="Enter confirmation email subject line"
                                className="pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showConfirmationSubjectTagsDropdown} onOpenChange={setShowConfirmationSubjectTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoConfirmationEmailSubject} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Body
                            </label>
                            <div className="relative">
                              <Textarea
                                id="confirmation-email-body"
                                value={customConfirmationEmailBody || (confirmationEmailTemplate !== "custom" ? getConfirmationEmailBodyContent() : "")}
                                onChange={(e) => setCustomConfirmationEmailBody(e.target.value)}
                                placeholder="Enter confirmation email content"
                                className="min-h-[120px] pr-10"
                              />
                              <TooltipProvider>
                                <Popover open={showConfirmationTagsDropdown} onOpenChange={setShowConfirmationTagsDropdown}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <Plus className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Dynamic Tags</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <DynamicTagsDropdown onTagSelect={insertTagIntoConfirmationEmail} />
                                  </PopoverContent>
                                </Popover>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isStopSequence && (
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600 mb-3">
                            Configure when the cadence should automatically stop for prospects.
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Stop Sequence When:
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stop-prospect-replies"
                                  checked={stopConditions.prospectReplies}
                                  onCheckedChange={(checked) => 
                                    setStopConditions(prev => ({ ...prev, prospectReplies: !!checked }))
                                  }
                                />
                                <label htmlFor="stop-prospect-replies" className="text-sm text-gray-700 cursor-pointer">
                                  Prospect replies to any email
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stop-meeting-accepted"
                                  checked={stopConditions.meetingAccepted}
                                  onCheckedChange={(checked) => 
                                    setStopConditions(prev => ({ ...prev, meetingAccepted: !!checked }))
                                  }
                                />
                                <label htmlFor="stop-meeting-accepted" className="text-sm text-gray-700 cursor-pointer">
                                  Calendar invite is accepted
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stop-meeting-declined"
                                  checked={stopConditions.meetingDeclined}
                                  onCheckedChange={(checked) => 
                                    setStopConditions(prev => ({ ...prev, meetingDeclined: !!checked }))
                                  }
                                />
                                <label htmlFor="stop-meeting-declined" className="text-sm text-gray-700 cursor-pointer">
                                  Calendar invite is declined
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stop-unsubscribed"
                                  checked={stopConditions.unsubscribed}
                                  onCheckedChange={(checked) => 
                                    setStopConditions(prev => ({ ...prev, unsubscribed: !!checked }))
                                  }
                                />
                                <label htmlFor="stop-unsubscribed" className="text-sm text-gray-700 cursor-pointer">
                                  Prospect unsubscribes
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stop-bounced"
                                  checked={stopConditions.bounced}
                                  onCheckedChange={(checked) => 
                                    setStopConditions(prev => ({ ...prev, bounced: !!checked }))
                                  }
                                />
                                <label htmlFor="stop-bounced" className="text-sm text-gray-700 cursor-pointer">
                                  Email bounces (invalid email)
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <StepActionButtons step={step} isFirst={isFirst} isLast={isLast} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cadence Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadence Settings</CardTitle>
            <p className="text-sm text-gray-600">
              Configure sending limits, timing, and spam prevention measures.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calendar Invites per day: {calendarInvitesPerDay}
                  </label>

                  <Slider
                    value={[calendarInvitesPerDay]}
                    onValueChange={(value) => setCalendarInvitesPerDay(value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours Start
                    </label>
                    <Select value={workingHoursStart} onValueChange={setWorkingHoursStart}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time">
                          {workingHoursStart ? convertTo12Hour(workingHoursStart) : "Select start time"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours End
                    </label>
                    <Select value={workingHoursEnd} onValueChange={setWorkingHoursEnd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time">
                          {workingHoursEnd ? convertTo12Hour(workingHoursEnd) : "Select end time"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fill-full-day"
                    checked={fillFullDay}
                    onCheckedChange={setFillFullDay}
                  />
                  <label htmlFor="fill-full-day" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Fill full day (maximize daily prospect outreach)
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Spam Prevention & Throttling
                  </h4>
                  <div className="space-y-2">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="random-delay" className="text-sm font-medium text-green-800">
                          Smart Random Delays
                        </label>
                        <Checkbox
                          id="random-delay"
                          checked={spamPrevention.addRandomDelay}
                          onCheckedChange={(checked) => 
                            setSpamPrevention(prev => ({ ...prev, addRandomDelay: !!checked }))
                          }
                        />
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <p><strong>Micro delays:</strong> 30-120 seconds between individual sends</p>
                        <p><strong>Macro limits:</strong> Maximum 25 invites per hour per account</p>
                        <p><strong>Randomization:</strong> Varies timing to appear human-like and avoid detection patterns</p>
                      </div>
                    </div>
                    

                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="limit-volume"
                        checked={spamPrevention.limitDailyVolume}
                        onCheckedChange={(checked) => 
                          setSpamPrevention(prev => ({ ...prev, limitDailyVolume: !!checked }))
                        }
                      />
                      <label htmlFor="limit-volume" className="text-sm text-gray-700 cursor-pointer">
                        Limit daily volume
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="throttle-emails"
                        checked={spamPrevention.throttleEmails}
                        onCheckedChange={(checked) => 
                          setSpamPrevention(prev => ({ ...prev, throttleEmails: !!checked }))
                        }
                      />
                      <label htmlFor="throttle-emails" className="text-sm text-gray-700 cursor-pointer">
                        Throttle email sending (prevent bursts)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="warmup-domain"
                        checked={spamPrevention.warmupDomain}
                        onCheckedChange={(checked) => 
                          setSpamPrevention(prev => ({ ...prev, warmupDomain: !!checked }))
                        }
                      />
                      <label htmlFor="warmup-domain" className="text-sm text-gray-700 cursor-pointer">
                        Domain warm-up mode (gradual volume increase)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="track-opens"
                        checked={spamPrevention.trackOpens}
                        onCheckedChange={(checked) => 
                          setSpamPrevention(prev => ({ ...prev, trackOpens: !!checked }))
                        }
                      />
                      <label htmlFor="track-opens" className="text-sm text-gray-700 cursor-pointer">
                        Track email opens
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="respect-unsubscribes"
                        checked={spamPrevention.respectUnsubscribes}
                        onCheckedChange={(checked) => 
                          setSpamPrevention(prev => ({ ...prev, respectUnsubscribes: !!checked }))
                        }
                      />
                      <label htmlFor="respect-unsubscribes" className="text-sm text-gray-700 cursor-pointer">
                        Respect unsubscribe requests
                      </label>
                    </div>
                  </div>
                </div>

                {/* Company Exclusion Setting */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-orange-900">Company Exclusion</h4>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">Automatically exclude companies from future outreach when someone accepts a meeting</p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exclude-company-acceptance"
                      checked={excludeCompanyOnAcceptance}
                      onCheckedChange={(checked) => setExcludeCompanyOnAcceptance(checked as boolean)}
                    />
                    <label htmlFor="exclude-company-acceptance" className="text-sm text-orange-800">
                      Exclude entire company when meeting is accepted
                    </label>
                  </div>
                  <p className="text-xs text-orange-600 mt-2 ml-6">
                    When enabled, all prospects from the same company will be automatically excluded from future cadences if any colleague accepts a meeting
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button onClick={handleSaveTemplate}>
              {editingCadence && !editingCadence.name.startsWith("(Clone)") ? "Update Cadence" : "Save Cadence"}
            </Button>
            {(!editingCadence || editingCadence.name.startsWith("(Clone)")) && (
              <Button onClick={handleNextToProspects} className="bg-blue-600 hover:bg-blue-700">
                Next: Add Prospects
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
            <DialogDescription>
              Choose the type of step you want to add to your cadence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step Type
              </label>
              <Select value={selectedStepType} onValueChange={setSelectedStepType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="calendar">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Calendar Invite
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStepDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStep}>
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Meeting Date Calendar Dialog */}
      <Dialog open={customMeetingCalendarOpen} onOpenChange={setCustomMeetingCalendarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Custom Meeting Date</DialogTitle>
            <DialogDescription>
              Choose a specific date for when the meeting should be scheduled. Past dates are disabled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            <CalendarComponent
              mode="single"
              selected={selectedCustomMeetingDate}
              onSelect={handleCustomMeetingDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {selectedCustomMeetingDate 
              ? `Selected: ${formatDate(selectedCustomMeetingDate)}`
              : "No date selected"
            }
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomMeetingCalendarOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setCustomMeetingCalendarOpen(false)}
              disabled={!selectedCustomMeetingDate}
            >
              Confirm Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}