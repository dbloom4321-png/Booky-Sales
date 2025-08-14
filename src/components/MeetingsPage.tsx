import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronDown, ChevronUp, Search, Mail, X, Check, Clock, ArrowLeft, Tag, User, Building, Calendar, Clock as ClockIcon, UserX, UserCheck, AlertCircle, Plus, Users, BarChart3 } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "meeting" | "follow-up" | "outreach" | "custom";
  isSystem?: boolean;
  dateCreated: string;
  lastModified: string;
}

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

interface MeetingsPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings" | "reports" | "templates", campaignInfo?: any, cadenceData?: any, reportsView?: "management-reports" | "meeting-links" | "dashboard") => void;
  onGoBack: () => void;
  emailTemplates: EmailTemplate[];
  cadences: CadenceData[];
}

interface Meeting {
  id: string;
  prospectName: string;
  email: string;
  dateTime: string;
  campaign: string;
  status: "accepted" | "tentative" | "declined" | "held" | "no-show";
  replied: boolean;
  lastReplied?: string;
  title?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  optedOut?: boolean;
  optOutDate?: string;
}

interface FilterState {
  status: ("accepted" | "tentative" | "declined" | "held" | "no-show")[];
  dateRange: "this-week" | "next-30-days" | "last-30-days" | "all";
  campaign: string;
  replied: "all" | "yes" | "no";
  sortBy: "soonest" | "name" | "last-replied";
}

type SortField = "prospectName" | "dateTime" | "campaign" | "status" | "replied";
type SortDirection = "asc" | "desc";

export function MeetingsPage({ onNavigate, onGoBack, emailTemplates, cadences }: MeetingsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [emailTemplate, setEmailTemplate] = useState("standard-confirmation");
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");
  const [sortField, setSortField] = useState<SortField>("dateTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showSubjectTagsDropdown, setShowSubjectTagsDropdown] = useState(false);
  const [showBodyTagsDropdown, setShowBodyTagsDropdown] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState<Set<string>>(new Set());
  const [showAddToCadenceModal, setShowAddToCadenceModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: ["accepted", "tentative", "declined", "held", "no-show"],
    dateRange: "all",
    campaign: "all",
    replied: "all",
    sortBy: "soonest"
  });

  // Dynamic tags configuration (removed campaign)
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
      icon: ClockIcon,
      category: "Meeting"
    },
    { 
      tag: "{{sender_name}}", 
      description: "Your name",
      icon: User,
      category: "Sender"
    }
  ];

  // Enhanced mock data for meetings with current dates and all status types
  const meetings: Meeting[] = [
    // This week meetings (August 3-9, 2025)
    {
      id: "1",
      prospectName: "Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@techcorp.com",
      title: "VP of Sales",
      company: "TechCorp Solutions",
      dateTime: "2025-08-04T14:00:00", // Monday this week
      campaign: "Q3 Enterprise Outreach",
      status: "accepted",
      replied: true,
      lastReplied: "2025-08-01T10:30:00",
      optedOut: false
    },
    {
      id: "2",
      prospectName: "Mike Chen",
      firstName: "Mike",
      lastName: "Chen",
      email: "mike.chen@startup.io",
      title: "Head of Growth",
      company: "StartupIO Inc",
      dateTime: "2025-08-05T11:30:00", // Tuesday this week
      campaign: "SaaS Growth Campaign",
      status: "tentative",
      replied: false,
      optedOut: false
    },
    {
      id: "3",
      prospectName: "Emily Rodriguez",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.r@bigtech.com",
      title: "Director of Marketing",
      company: "BigTech Corp",
      dateTime: "2025-08-07T15:30:00", // Thursday this week
      campaign: "Q3 Enterprise Outreach",
      status: "accepted",
      replied: true,
      lastReplied: "2025-08-02T09:15:00",
      optedOut: true,
      optOutDate: "2025-08-05"
    },
    {
      id: "4",
      prospectName: "David Park",
      firstName: "David",
      lastName: "Park",
      email: "david.park@fintech.com",
      title: "CTO",
      company: "FinTech Innovations",
      dateTime: "2025-08-08T16:00:00", // Friday this week
      campaign: "Financial Services Outreach",
      status: "declined",
      replied: true,
      lastReplied: "2025-08-04T12:20:00",
      optedOut: false
    },
    
    // Next 30 days meetings (August - September 2025)
    {
      id: "5",
      prospectName: "Lisa Thompson",
      firstName: "Lisa",
      lastName: "Thompson",
      email: "lisa.t@retailcorp.com",
      title: "Chief Revenue Officer",
      company: "RetailCorp",
      dateTime: "2025-08-11T10:00:00", // Next Monday
      campaign: "Retail Expansion",
      status: "accepted",
      replied: false,
      optedOut: false
    },
    {
      id: "6",
      prospectName: "James Wilson",
      firstName: "James",
      lastName: "Wilson",
      email: "j.wilson@healthcare.org",
      title: "VP of Operations",
      company: "Healthcare Systems Inc",
      dateTime: "2025-08-13T14:30:00", // Next Wednesday
      campaign: "Healthcare Initiative",
      status: "tentative",
      replied: true,
      lastReplied: "2025-08-01T16:45:00",
      optedOut: false
    },
    {
      id: "7",
      prospectName: "Maria Garcia",
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@consulting.com",
      title: "Senior Partner",
      company: "Elite Consulting Group",
      dateTime: "2025-08-20T13:00:00", // Later in August
      campaign: "Professional Services",
      status: "accepted",
      replied: true,
      lastReplied: "2025-08-02T11:30:00",
      optedOut: false
    },
    {
      id: "14",
      prospectName: "Alex Martinez",
      firstName: "Alex",
      lastName: "Martinez",
      email: "a.martinez@globalbank.com",
      title: "SVP Technology",
      company: "Global Bank Corp",
      dateTime: "2025-08-25T11:00:00", // End of August
      campaign: "Financial Services Outreach",
      status: "accepted",
      replied: false,
      optedOut: false
    },
    {
      id: "15",
      prospectName: "Sophie Chen",
      firstName: "Sophie",
      lastName: "Chen",
      email: "sophie.chen@innovate.co",
      title: "Product Manager",
      company: "Innovate Solutions",
      dateTime: "2025-09-02T14:00:00", // Early September
      campaign: "SaaS Growth Campaign",
      status: "tentative",
      replied: true,
      lastReplied: "2025-08-01T16:30:00",
      optedOut: false
    },

    // Past meetings with "held" and "no-show" statuses (July 2025)
    {
      id: "8",
      prospectName: "Thomas Miller",
      firstName: "Thomas",
      lastName: "Miller",
      email: "t.miller@startup.com",
      title: "CEO",
      company: "Innovative Startup Inc",
      dateTime: "2025-07-28T10:00:00", // Last Monday
      campaign: "SaaS Growth Campaign",
      status: "no-show",
      replied: false,
      optedOut: false
    },
    {
      id: "9",
      prospectName: "Laura Davis",
      firstName: "Laura",
      lastName: "Davis",
      email: "l.davis@enterprise.org",
      title: "VP of Technology",
      company: "Enterprise Corp",
      dateTime: "2025-07-29T14:30:00", // Last Tuesday
      campaign: "Q3 Enterprise Outreach",
      status: "held",
      replied: true,
      lastReplied: "2025-07-30T09:20:00",
      optedOut: false
    },
    {
      id: "10",
      prospectName: "Michael Johnson",
      firstName: "Michael",
      lastName: "Johnson",
      email: "m.johnson@techfirm.com",
      title: "Head of Operations",
      company: "TechFirm Solutions",
      dateTime: "2025-07-31T09:00:00", // Last Thursday
      campaign: "Financial Services Outreach",
      status: "held",
      replied: false,
      optedOut: true,
      optOutDate: "2025-08-01"
    },
    {
      id: "11",
      prospectName: "Jennifer Wilson",
      firstName: "Jennifer",
      lastName: "Wilson",
      email: "j.wilson@consulting.co",
      title: "Partner",
      company: "Wilson Consulting Group",
      dateTime: "2025-07-25T11:00:00", // Earlier in July
      campaign: "Professional Services",
      status: "no-show",
      replied: true,
      lastReplied: "2025-07-23T13:45:00",
      optedOut: false
    },
    {
      id: "12",
      prospectName: "Ryan Thompson",
      firstName: "Ryan",
      lastName: "Thompson",
      email: "r.thompson@healthtech.io",
      title: "CTO",
      company: "HealthTech Innovations",
      dateTime: "2025-07-15T15:30:00", // Mid July
      campaign: "Healthcare Initiative",
      status: "held",
      replied: true,
      lastReplied: "2025-07-16T10:15:00",
      optedOut: false
    },
    {
      id: "13",
      prospectName: "Amanda Foster",
      firstName: "Amanda",
      lastName: "Foster",
      email: "a.foster@retailgroup.com",
      title: "Marketing Director",
      company: "Retail Group Inc",
      dateTime: "2025-07-10T10:00:00", // Early July
      campaign: "Retail Expansion",
      status: "no-show",
      replied: false,
      optedOut: false
    }
  ];

  const campaigns = [
    "Q3 Enterprise Outreach",
    "SaaS Growth Campaign", 
    "Professional Services",
    "Financial Services Outreach",
    "Retail Expansion",
    "Healthcare Initiative"
  ];

  const dateRangeOptions = [
    { value: "this-week", label: "This Week" },
    { value: "next-30-days", label: "Next 30 Days" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "all", label: "All" }
  ];

  const repliedOptions = [
    { value: "all", label: "All" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ];

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    };
  };

  const formatLastReplied = (dateTime?: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedMeetings = () => {
    return [...meetings].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "prospectName":
          aValue = a.prospectName.toLowerCase();
          bValue = b.prospectName.toLowerCase();
          break;
        case "dateTime":
          aValue = new Date(a.dateTime);
          bValue = new Date(b.dateTime);
          break;
        case "campaign":
          aValue = a.campaign.toLowerCase();
          bValue = b.campaign.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "replied":
          aValue = a.replied ? 1 : 0;
          bValue = b.replied ? 1 : 0;
          break;
        default:
          aValue = a.prospectName.toLowerCase();
          bValue = b.prospectName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredAndSortedMeetings = getSortedMeetings()
    .filter(meeting => {
      // Status filter
      if (!filters.status.includes(meeting.status)) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = meeting.prospectName.toLowerCase().includes(searchLower);
        const matchesEmail = meeting.email.toLowerCase().includes(searchLower);
        const matchesTitle = meeting.title?.toLowerCase().includes(searchLower) || false;
        const matchesCompany = meeting.company?.toLowerCase().includes(searchLower) || false;
        
        if (!matchesName && !matchesEmail && !matchesTitle && !matchesCompany) {
          return false;
        }
      }
      
      // Campaign filter
      if (filters.campaign !== "all" && meeting.campaign !== filters.campaign) return false;
      
      // Replied filter
      if (filters.replied === "yes" && !meeting.replied) return false;
      if (filters.replied === "no" && meeting.replied) return false;
      
      // Date range filter
      if (filters.dateRange !== "all") {
        const meetingDate = new Date(meeting.dateTime);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filters.dateRange) {
          case "this-week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            return meetingDate >= weekStart && meetingDate <= weekEnd;
            
          case "next-30-days":
            const next30Days = new Date(today);
            next30Days.setDate(today.getDate() + 30);
            next30Days.setHours(23, 59, 59, 999);
            return meetingDate >= today && meetingDate <= next30Days;
            
          case "last-30-days":
            const last30Days = new Date(today);
            last30Days.setDate(today.getDate() - 30);
            return meetingDate >= last30Days && meetingDate < today;
            
          default:
            return true;
        }
      }
      
      return true;
    });

  const toggleStatusFilter = (status: "accepted" | "tentative" | "declined" | "held" | "no-show") => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleWriteEmail = (meeting: Meeting) => {
    if (meeting.optedOut) {
      alert("This prospect has opted out and cannot be emailed.");
      return;
    }
    
    setSelectedMeeting(meeting);
    setEmailModalOpen(true);
    
    // Auto-select appropriate template based on meeting status
    let selectedTemplate = "standard-confirmation";
    if (meeting.status === "tentative") {
      selectedTemplate = "tentative-confirmation";
    } else if (meeting.status === "declined") {
      selectedTemplate = "declined-follow-up";
    } else if (meeting.status === "no-show") {
      selectedTemplate = "no-show-follow-up";
    } else if (meeting.status === "held") {
      selectedTemplate = "thank-you";
    }
    setEmailTemplate(selectedTemplate);
    
    // Load template content into editable fields
    const template = emailTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setEditableSubject(template.subject);
      setEditableBody(template.body);
    } else {
      setEditableSubject("");
      setEditableBody("");
    }
  };

  const getEmailContent = () => {
    try {
      let subject = editableSubject || "";
      let body = editableBody || "";
      
      if (selectedMeeting) {
        const { date, time } = formatDateTime(selectedMeeting.dateTime);
        
        const replacements: Record<string, string> = {
          "{{first_name}}": selectedMeeting.firstName || selectedMeeting.prospectName.split(" ")[0] || selectedMeeting.prospectName || "",
          "{{last_name}}": selectedMeeting.lastName || selectedMeeting.prospectName.split(" ").pop() || "",
          "{{full_name}}": selectedMeeting.prospectName || "",
          "{{title}}": selectedMeeting.title || "their role",
          "{{company}}": selectedMeeting.company || "their company",
          "{{email}}": selectedMeeting.email || "",
          "{{meeting_date}}": date || "",
          "{{meeting_time}}": time || "",
          "{{sender_name}}": "David"
        };
        
        Object.entries(replacements).forEach(([tag, value]) => {
          const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedTag, 'g');
          subject = subject.replace(regex, String(value || ""));
          body = body.replace(regex, String(value || ""));
        });
      }
      
      return { subject: subject || "", body: body || "" };
    } catch (error) {
      console.error('Error in getEmailContent:', error);
      return { subject: "", body: "" };
    }
  };

  const handleSendEmail = () => {
    try {
      if (!selectedMeeting) {
        alert("No meeting selected. Please try again.");
        return;
      }

      if (selectedMeeting.optedOut) {
        alert("This prospect has opted out and cannot be emailed.");
        return;
      }

      const { subject, body } = getEmailContent();
      
      if (!subject?.trim() || !body?.trim()) {
        alert("Please fill in both subject and body before sending.");
        return;
      }
      
      console.log("Sending email to:", selectedMeeting.email);
      console.log("Subject:", subject);
      console.log("Body:", body);
      
      alert(`Email sent to ${selectedMeeting.prospectName}!`);
      setEmailModalOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error preparing email. Please try again.");
    }
  };

  const insertTagIntoSubject = (tag: string) => {
    try {
      const input = document.getElementById('email-subject') as HTMLInputElement;
      if (input && document.activeElement === input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentValue = editableSubject || "";
        const newValue = currentValue.substring(0, start) + tag + currentValue.substring(end);
        setEditableSubject(newValue);
        
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
      } else {
        setEditableSubject((prev) => (prev || "") + tag);
      }
    } catch (error) {
      console.error('Error inserting tag into subject:', error);
    }
  };

  const insertTagIntoBody = (tag: string) => {
    try {
      const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
      if (textarea && document.activeElement === textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const currentValue = editableBody || "";
        const newValue = currentValue.substring(0, start) + tag + currentValue.substring(end);
        setEditableBody(newValue);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
      } else {
        setEditableBody((prev) => (prev || "") + tag);
      }
    } catch (error) {
      console.error('Error inserting tag into body:', error);
    }
  };

  const handleTemplateChange = (newTemplate: string) => {
    setEmailTemplate(newTemplate);
    
    const template = emailTemplates.find(t => t.id === newTemplate);
    if (template) {
      setEditableSubject(template.subject);
      setEditableBody(template.body);
    }
  };

  const resetToTemplate = () => {
    const template = emailTemplates.find(t => t.id === emailTemplate);
    if (template) {
      setEditableSubject(template.subject);
      setEditableBody(template.body);
    }
  };

  // Handle meeting selection - exclude opted out meetings
  const handleMeetingSelect = (meetingId: string, isSelected: boolean) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting?.optedOut) {
      // Prevent selection of opted out meetings
      return;
    }
    
    const newSelection = new Set(selectedMeetings);
    if (isSelected) {
      newSelection.add(meetingId);
    } else {
      newSelection.delete(meetingId);
    }
    setSelectedMeetings(newSelection);
  };

  // Handle select all meetings - only selectable meetings
  const handleSelectAll = () => {
    const selectableMeetings = filteredAndSortedMeetings.filter(meeting => !meeting.optedOut);
    const selectableMeetingIds = new Set(selectableMeetings.map(meeting => meeting.id));
    
    // If all selectable meetings are already selected, deselect them
    const allSelectableSelected = selectableMeetings.every(meeting => selectedMeetings.has(meeting.id));
    
    if (allSelectableSelected) {
      setSelectedMeetings(new Set());
    } else {
      setSelectedMeetings(selectableMeetingIds);
    }
  };

  // Handle adding selected meetings to cadence
  const handleAddToCadence = () => {
    if (selectedMeetings.size === 0) {
      alert("Please select at least one meeting to add to a cadence.");
      return;
    }
    setShowAddToCadenceModal(true);
  };

  // Handle bulk email for selected meetings
  const handleBulkEmail = () => {
    if (selectedMeetings.size === 0) {
      alert("Please select at least one meeting to send emails.");
      return;
    }
    
    const selectedMeetingsList = filteredAndSortedMeetings.filter(meeting => 
      selectedMeetings.has(meeting.id) && !meeting.optedOut
    );
    
    alert(`Sending emails to ${selectedMeetingsList.length} selected prospects:\n${selectedMeetingsList.map(m => m.prospectName).join(', ')}`);
    setSelectedMeetings(new Set());
  };

  // Handle saving selected prospects to new cadence
  const handleSaveToNewCadence = () => {
    const selectedMeetingsList = filteredAndSortedMeetings.filter(meeting => 
      selectedMeetings.has(meeting.id) && !meeting.optedOut
    );
    
    // In a real app, this would create a new cadence with these prospects
    alert(`Creating new cadence with ${selectedMeetingsList.length} selected prospects:\n${selectedMeetingsList.map(m => m.prospectName).join(', ')}`);
    
    setShowAddToCadenceModal(false);
    setSelectedMeetings(new Set());
    onNavigate("new-cadence");
  };

  // Handle adding to existing cadence
  const handleAddToExistingCadence = (cadenceId: number) => {
    const selectedMeetingsList = filteredAndSortedMeetings.filter(meeting => 
      selectedMeetings.has(meeting.id) && !meeting.optedOut
    );
    
    const cadence = cadences.find(c => c.id === cadenceId);
    if (cadence) {
      // In a real app, this would add the prospects to the existing cadence
      alert(`Adding ${selectedMeetingsList.length} selected prospects to "${cadence.name}" cadence:\n${selectedMeetingsList.map(m => m.prospectName).join(', ')}`);
      
      setShowAddToCadenceModal(false);
      setSelectedMeetings(new Set());
    }
  };

  // Get count of selected meetings (only selectable ones)
  const selectableMeetings = filteredAndSortedMeetings.filter(meeting => !meeting.optedOut);
  const selectedCount = selectedMeetings.size;
  const allSelectableSelected = selectableMeetings.length > 0 && selectableMeetings.every(meeting => selectedMeetings.has(meeting.id));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close status dropdown
      if (showStatusDropdown && !target.closest('[data-dropdown="status"]')) {
        setShowStatusDropdown(false);
      }
      
      // Close campaign dropdown
      if (showCampaignDropdown && !target.closest('[data-dropdown="campaign"]')) {
        setShowCampaignDropdown(false);
      }
      
      // Close subject tags dropdown
      if (showSubjectTagsDropdown && !target.closest('[data-dropdown="subject-tags"]')) {
        setShowSubjectTagsDropdown(false);
      }
      
      // Close body tags dropdown
      if (showBodyTagsDropdown && !target.closest('[data-dropdown="body-tags"]')) {
        setShowBodyTagsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown, showCampaignDropdown, showSubjectTagsDropdown, showBodyTagsDropdown]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {children}
      <div className="flex flex-col">
        <ChevronUp 
          className={`h-3 w-3 ${
            sortField === field && sortDirection === "asc" 
              ? "text-blue-600" 
              : "text-gray-300"
          }`} 
        />
        <ChevronDown 
          className={`h-3 w-3 -mt-1 ${
            sortField === field && sortDirection === "desc" 
              ? "text-blue-600" 
              : "text-gray-300"
          }`} 
        />
      </div>
    </button>
  );

  const getStatusBadge = (status: string, optedOut?: boolean) => {
    if (optedOut) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <UserX className="h-3 w-3 mr-1" />
          Opted Out
        </span>
      );
    }
    
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Accepted
          </span>
        );
      case "tentative":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Tentative
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Declined
          </span>
        );
      case "held":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Held
          </span>
        );
      case "no-show":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            No Show
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Meetings</h1>
              <p className="text-sm text-gray-600">Manage your scheduled calendar invites</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-500">
                {filteredAndSortedMeetings.length} of {meetings.length} meetings
              </div>
              {selectedCount > 0 && (
                <div className="text-blue-600">
                  {selectedCount} selected
                </div>
              )}
            </div>
            {selectedCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEmail}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email {selectedCount}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCadence}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Add {selectedCount} to Cadence
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("templates")}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 relative z-30">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Status Filter */}
          <div className="relative" data-dropdown="status">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Status ({filters.status.length})
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("accepted")}
                      onChange={() => toggleStatusFilter("accepted")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Accepted</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("tentative")}
                      onChange={() => toggleStatusFilter("tentative")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Tentative</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("declined")}
                      onChange={() => toggleStatusFilter("declined")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Declined</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("held")}
                      onChange={() => toggleStatusFilter("held")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Held</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("no-show")}
                      onChange={() => toggleStatusFilter("no-show")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">No Show</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Campaign Filter */}
          <div className="relative" data-dropdown="campaign">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCampaignDropdown(!showCampaignDropdown)}
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Campaign: {filters.campaign === "all" ? "All" : filters.campaign}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showCampaignDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div 
                    className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, campaign: "all" }));
                      setShowCampaignDropdown(false);
                    }}
                  >
                    All Campaigns
                  </div>
                  {campaigns.map(campaign => (
                    <div
                      key={campaign}
                      className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, campaign }));
                        setShowCampaignDropdown(false);
                      }}
                    >
                      {campaign}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Replied Filter */}
          <select
            value={filters.replied}
            onChange={(e) => setFilters(prev => ({ ...prev, replied: e.target.value as any }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {repliedOptions.map(option => (
              <option key={option.value} value={option.value}>Replied: {option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>Select</span>
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="prospectName">Prospect</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="dateTime">Date & Time</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="campaign">Campaign</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="status">Status</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="replied">Replied?</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedMeetings.map((meeting) => {
                  const { date, time } = formatDateTime(meeting.dateTime);
                  return (
                    <tr 
                      key={meeting.id} 
                      className={`transition-colors relative ${
                        meeting.optedOut 
                          ? 'bg-red-50 hover:bg-red-100 text-red-900' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedMeetings.has(meeting.id)}
                          onChange={(e) => handleMeetingSelect(meeting.id, e.target.checked)}
                          disabled={meeting.optedOut}
                          className={`w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${
                            meeting.optedOut ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${meeting.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                            {meeting.prospectName}
                          </div>
                          <div className={`text-sm ${meeting.optedOut ? 'text-red-700' : 'text-gray-500'}`}>
                            {meeting.email}
                          </div>
                          {meeting.title && meeting.company && (
                            <div className={`text-xs ${meeting.optedOut ? 'text-red-600' : 'text-gray-400'}`}>
                              {meeting.title} at {meeting.company}
                            </div>
                          )}
                          {meeting.optedOut && meeting.optOutDate && (
                            <div className="text-xs text-red-600 mt-1">
                              Opted out: {formatDate(meeting.optOutDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${meeting.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                            {date}
                          </div>
                          <div className={`text-sm ${meeting.optedOut ? 'text-red-700' : 'text-gray-500'}`}>
                            {time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${meeting.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                          {meeting.campaign}
                        </div>
                      </td>
                      <td className="px-6 py-4 relative z-10">
                        {getStatusBadge(meeting.status, meeting.optedOut)}
                      </td>
                      <td className="px-6 py-4">
                        {meeting.replied ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              meeting.optedOut ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              <Check className="w-3 h-3 mr-1" />
                              Yes
                            </span>
                            {meeting.lastReplied && (
                              <span className={`text-xs ${meeting.optedOut ? 'text-red-600' : 'text-gray-500'}`}>
                                {formatLastReplied(meeting.lastReplied)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.optedOut ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <X className="w-3 h-3 mr-1" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {meeting.optedOut ? (
                          <div className="text-xs text-red-600 font-medium">
                            Unsubscribed
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWriteEmail(meeting)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add to Cadence Modal */}
      <Dialog open={showAddToCadenceModal} onOpenChange={setShowAddToCadenceModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {selectedCount} Selected Prospects to Cadence</DialogTitle>
            <DialogDescription>
              Choose an existing cadence or create a new one for your selected prospects.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create New Cadence Option */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create New Cadence</h3>
                    <p className="text-sm text-gray-600">Start fresh with a new cadence workflow</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveToNewCadence}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create New
                </Button>
              </div>
            </div>

            {/* Existing Cadences */}
            {cadences.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">Add to Existing Cadence</h3>
                  <span className="text-sm text-gray-500">({cadences.filter(c => c.statusType === "active").length} available)</span>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cadences
                    .filter(cadence => cadence.statusType === "active") // Only show active cadences
                    .map((cadence) => {
                      // Calculate booking percentage
                      const bookingPercentage = cadence.prospectCount > 0 
                        ? Math.round((cadence.bookedCount / cadence.prospectCount) * 100)
                        : 0;

                      return (
                        <div 
                          key={cadence.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{cadence.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    {cadence.steps} steps
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {cadence.prospectCount} prospects
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {bookingPercentage}% booked
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(cadence.dateCreated).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline"
                              onClick={() => handleAddToExistingCadence(cadence.id)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Add to This
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Empty state if no active cadences */}
            {cadences.filter(c => c.statusType === "active").length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No Active Cadences</h3>
                <p className="text-sm text-gray-600">
                  You don't have any active cadences. Create your first one to get started.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToCadenceModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedMeeting?.prospectName}</DialogTitle>
            <DialogDescription>
              Compose and send a personalized email for this meeting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Template</label>
              <div className="flex gap-2">
                <Select value={emailTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetToTemplate}
                  className="px-3"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Subject Line</label>
                <div className="relative" data-dropdown="subject-tags">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubjectTagsDropdown(!showSubjectTagsDropdown)}
                    className="text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    Insert Tag
                  </Button>
                  {showSubjectTagsDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {dynamicTags.map((tagInfo, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => {
                              insertTagIntoSubject(tagInfo.tag);
                              setShowSubjectTagsDropdown(false);
                            }}
                          >
                            <tagInfo.icon className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-blue-600">{tagInfo.tag}</div>
                              <div className="text-xs text-gray-500">{tagInfo.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Input
                id="email-subject"
                value={editableSubject}
                onChange={(e) => setEditableSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="font-medium"
              />
            </div>

            {/* Email Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Email Body</label>
                <div className="relative" data-dropdown="body-tags">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBodyTagsDropdown(!showBodyTagsDropdown)}
                    className="text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    Insert Tag
                  </Button>
                  {showBodyTagsDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {dynamicTags.map((tagInfo, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => {
                              insertTagIntoBody(tagInfo.tag);
                              setShowBodyTagsDropdown(false);
                            }}
                          >
                            <tagInfo.icon className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-blue-600">{tagInfo.tag}</div>
                              <div className="text-xs text-gray-500">{tagInfo.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Textarea
                id="email-body"
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                placeholder="Enter email content..."
                rows={12}
                className="resize-none"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preview</label>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Subject: </span>
                    <span className="text-sm text-gray-900">{getEmailContent().subject}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-sm text-gray-900 whitespace-pre-line">
                      {getEmailContent().body}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}