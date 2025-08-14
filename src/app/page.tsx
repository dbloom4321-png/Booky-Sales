'use client';

import { useState, useEffect } from "react";
import { LoginScreen } from "../components/LoginScreen";
import { Sidebar } from "../components/Sidebar";
import { DashboardContent } from "../components/DashboardContent";
import { CampaignDetail } from "../components/CampaignDetail";
import { CadencesPage } from "../components/CadencesPage";
import { CadenceDetailPage } from "../components/CadenceDetailPage";
import { NewCadencePage } from "../components/NewCadencePage";
import { ProspectUploadPage } from "../components/ProspectUploadPage";
import { ProspectsPage } from "../components/ProspectsPage";
import { AccountSettingsPage } from "../components/AccountSettingsPage";
import { MeetingsPage } from "../components/MeetingsPage";
import { ReportsPage } from "../components/ReportsPage";
import { TemplatesPage } from "../components/TemplatesPage";
import { SupportPage } from "../components/SupportPage";

type ViewType = "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "edit-cadence" | "clone-cadence" | "prospect-upload" | "prospects" | "account-settings" | "meetings" | "reports" | "templates" | "support";

interface CampaignData {
  prospectCount: number;
  campaignName: string;
  status: "active" | "paused" | "completed";
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
  settings?: {
    calendarInvitesPerDay?: number;
    [key: string]: any;
  };
}

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

interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

interface NavigationHistoryEntry {
  view: ViewType;
  campaignInfo?: Partial<CampaignData>;
  cadenceData?: CadenceData;
  reportsView?: "management-reports" | "meeting-links" | "dashboard";
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryEntry[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    prospectCount: 150,
    campaignName: "Q3 FinTech Blitz",
    status: "active"
  });
  const [selectedCadence, setSelectedCadence] = useState<CadenceData | null>(null);
  
  // Cadences state management
  const [cadences, setCadences] = useState<CadenceData[]>([
    {
      id: 1,
      name: "Q3 FinTech Blitz",
      steps: 5,
      assigned: "You",
      bookedMeetings: "5 booked, 4 tentative",
      bookedCount: 5,
      prospectCount: 150,
      status: "Active",
      statusType: "active" as const,
      dateCreated: "2024-07-15",
      dateFinished: null,
    },
    {
      id: 2,
      name: "RevOps Campaign",
      steps: 3,
      assigned: "You",
      bookedMeetings: "3 booked, 2 tentative",
      bookedCount: 3,
      prospectCount: 75,
      status: "Active",
      statusType: "active" as const,
      dateCreated: "2024-07-22",
      dateFinished: null,
    },
    {
      id: 3,
      name: "DreamForce Conference",
      steps: 4,
      assigned: "You",
      bookedMeetings: "1 booked, 2 tentative",
      bookedCount: 1,
      prospectCount: 45,
      status: "Completed",
      statusType: "completed" as const,
      dateCreated: "2024-06-10",
      dateFinished: "2024-07-30",
    },
    {
      id: 4,
      name: "No Show Follow-up",
      steps: 3,
      assigned: "You",
      bookedMeetings: "2 booked, 1 tentative",
      bookedCount: 2,
      prospectCount: 28,
      status: "Active",
      statusType: "active" as const,
      dateCreated: "2025-01-28",
      dateFinished: null,
    },
    {
      id: 5,
      name: "Declined Meeting Follow-up",
      steps: 4,
      assigned: "You",
      bookedMeetings: "1 booked, 0 tentative",
      bookedCount: 1,
      prospectCount: 12,
      status: "Active",
      statusType: "active" as const,
      dateCreated: "2025-01-15",
      dateFinished: null,
    },
  ]);

  // Email templates state management
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: "custom-template",
      name: "Custom Template",
      subject: "",
      body: "",
      category: "custom",
      isSystem: false,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "standard-confirmation",
      name: "Standard Confirmation",
      subject: "Looking forward to our meeting on {{meeting_date}}",
      body: "Hi {{first_name}},\n\nThank you for accepting our meeting invitation! I'm looking forward to our conversation on {{meeting_date}} at {{meeting_time}}.\n\nDuring our 30-minute discussion, we'll cover:\n• How companies like {{company}} are increasing meeting booking rates by 300%\n• Specific strategies for automating your outbound calendar process\n• Next steps for implementing this at {{company}}\n\nIf anything comes up and you need to reschedule, just let me know.\n\nBest regards,\n{{sender_name}}",
      category: "meeting",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "tentative-confirmation",
      name: "Tentative Confirmation",
      subject: "Hi {{first_name}} - let's confirm our {{meeting_date}} meeting",
      body: "Hi {{first_name}},\n\nI notice you're still tentative about our meeting on {{meeting_date}} at {{meeting_time}}. I completely understand - calendars can be tricky!\n\nAs the {{title}} at {{company}}, I'd love to confirm this time works for you. During our 30-minute conversation, we'll discuss:\n• How companies like {{company}} are increasing meeting booking rates by 300%\n• Specific strategies that could work for your team\n• A quick assessment of your current outbound process\n\nIf this time doesn't work, I'm happy to find a better slot. Just let me know what works best for your schedule.\n\nLooking forward to connecting!\n\nBest regards,\n{{sender_name}}",
      category: "meeting",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "declined-follow-up",
      name: "Declined Meeting Follow-up",
      subject: "Hi {{first_name}} - exploring alternatives that might work better",
      body: "Hi {{first_name}},\n\nI completely understand that the timing wasn't right for our previously scheduled meeting. These things happen!\n\nAs the {{title}} at {{company}}, I imagine you're juggling quite a few priorities. Rather than suggesting another meeting right away, I thought I'd share a few quick insights that might be valuable for your team:\n\n• How companies like {{company}} are streamlining their outbound processes\n• A 5-minute assessment that could identify immediate opportunities\n• Industry benchmarks specific to your sector\n\nWould any of these be helpful to explore when the timing is better for you? No pressure at all - just wanted to keep the door open for future conversations.\n\nBest regards,\n{{sender_name}}\n\nP.S. If there's someone else on your team who handles these initiatives, I'm happy to connect with them instead.",
      category: "follow-up",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "no-show-follow-up",
      name: "No Show Follow-up",
      subject: "Hi {{first_name}} - missed you today, let's reschedule",
      body: "Hi {{first_name}},\n\nI noticed we missed each other for our scheduled meeting today at {{meeting_time}}. No worries at all - these things happen!\n\nI had some great insights prepared specifically for {{company}} that I think you'd find valuable:\n\n• Industry benchmarks for companies similar to yours\n• A quick assessment framework you could implement immediately\n• How other {{title}}s are solving similar challenges\n\nWould you like to reschedule for later this week or next? I'm flexible with timing and can work around your schedule.\n\nBest regards,\n{{sender_name}}",
      category: "follow-up",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "general-follow-up",
      name: "General Follow-up",
      subject: "Following up on our {{meeting_date}} meeting",
      body: "Hi {{first_name}},\n\nI wanted to follow up on our conversation from {{meeting_date}}. It was great learning more about {{company}} and the challenges you're facing.\n\nAs promised, I've attached some resources that should be helpful:\n\n• Industry benchmark report for your sector\n• Implementation guide for the strategies we discussed\n• Contact information for the specialist I mentioned\n\nI'm here if you have any questions or would like to discuss next steps. Feel free to reach out anytime.\n\nBest regards,\n{{sender_name}}",
      category: "follow-up",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "thank-you",
      name: "Thank You",
      subject: "Thank you for your time, {{first_name}}",
      body: "Hi {{first_name}},\n\nThank you for taking the time to meet with me today. I really enjoyed our conversation about {{company}} and your goals for the upcoming quarter.\n\nKey takeaways from our discussion:\n• Your current process and where you see opportunities\n• The timeline you're working with\n• Next steps we discussed\n\nI'll follow up with the additional information we talked about by end of week. In the meantime, please don't hesitate to reach out if any questions come up.\n\nLooking forward to continuing our conversation!\n\nBest regards,\n{{sender_name}}",
      category: "follow-up",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    },
    {
      id: "cold-outreach",
      name: "Cold Outreach",
      subject: "Quick question about {{company}}'s outbound process",
      body: "Hi {{first_name}},\n\nI hope this email finds you well. I came across {{company}} and was impressed by your growth in the {{industry}} space.\n\nI'm reaching out because I've been helping similar companies streamline their outbound processes and thought you might be interested in a quick conversation about:\n\n• How companies like {{company}} are increasing meeting booking rates by 300%\n• Specific automation strategies that could save your team 10+ hours per week\n• Industry benchmarks for outbound performance\n\nWould you be open to a brief 15-minute call this week to explore how this might apply to {{company}}?\n\nBest regards,\n{{sender_name}}",
      category: "outreach",
      isSystem: true,
      dateCreated: "2024-01-01",
      lastModified: "2024-01-01"
    }
  ]);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        // Only access localStorage on the client side
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('booky_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('booky_user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading time
    setTimeout(checkExistingSession, 1000);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate against a backend
    const userData: User = {
      email,
      name: email.split('@')[0] || 'User',
      isAuthenticated: true
    };

    setUser(userData);
    
    // Save to localStorage for persistence (in production, use secure storage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('booky_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('booky_user');
    }
    setCurrentView("dashboard");
    setNavigationHistory([]);
  };

  const [reportsInitialView, setReportsInitialView] = useState<"management-reports" | "meeting-links" | "dashboard" | undefined>(undefined);

  const navigateTo = (view: ViewType, campaignInfo?: Partial<CampaignData>, cadenceData?: CadenceData, reportsView?: "management-reports" | "meeting-links" | "dashboard") => {
    // For reports view, check if we're navigating to the same report subview
    if (view === "reports" && currentView === "reports" && reportsInitialView === reportsView) {
      // Same destination within reports, do nothing
      return;
    }

    // For non-reports views, check if it's the same destination
    const isSameDestination = 
      currentView === view && 
      view !== "reports";

    // If it's the same destination (except for reports), do nothing
    if (isSameDestination) {
      return;
    }

    // Add current state to history before navigating (only if it's different from the target)
    if (currentView !== view) {
      const currentEntry: NavigationHistoryEntry = {
        view: currentView,
        campaignInfo: campaignData,
        cadenceData: selectedCadence || undefined,
        reportsView: reportsInitialView
      };
      
      setNavigationHistory(prev => {
        // Don't add duplicate entries
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.view === currentEntry.view) {
          return prev;
        }
        return [...prev, currentEntry];
      });
    }

    setCurrentView(view);
    if (campaignInfo) {
      setCampaignData(prev => ({ ...prev, ...campaignInfo }));
    }
    if (cadenceData) {
      setSelectedCadence(cadenceData);
    }
    
    // Always update reports initial view when navigating to reports
    if (view === "reports" && reportsView) {
      setReportsInitialView(reportsView);
    } else if (view !== "reports") {
      setReportsInitialView(undefined);
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const lastEntry = navigationHistory[navigationHistory.length - 1];
      
      // Remove the last entry from history
      setNavigationHistory(prev => prev.slice(0, -1));
      
      // Navigate to the previous page
      setCurrentView(lastEntry.view);
      
      // Restore the previous state
      if (lastEntry.campaignInfo) {
        setCampaignData(prev => ({ ...prev, ...lastEntry.campaignInfo }));
      }
      if (lastEntry.cadenceData) {
        setSelectedCadence(lastEntry.cadenceData);
      }
      if (lastEntry.reportsView) {
        setReportsInitialView(lastEntry.reportsView);
      } else {
        setReportsInitialView(undefined);
      }
    } else {
      // Fallback to dashboard if no history
      setCurrentView("dashboard");
    }
  };

  const updateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...data }));
  };

  // Cadence management functions
  const addCadence = (cadenceData: Omit<CadenceData, 'id'>) => {
    const newCadence: CadenceData = {
      ...cadenceData,
      id: Math.max(...cadences.map(c => c.id), 0) + 1,
      dateCreated: new Date().toISOString().split('T')[0],
      dateFinished: null,
      assigned: "You",
      bookedMeetings: "0 booked, 0 tentative",
      bookedCount: 0,
      prospectCount: 0,
      status: "Active",
      statusType: "active" as const,
    };
    setCadences(prev => [...prev, newCadence]);
    return newCadence;
  };

  const updateCadence = (id: number, updates: Partial<CadenceData>) => {
    setCadences(prev => prev.map(cadence => 
      cadence.id === id ? { ...cadence, ...updates } : cadence
    ));
  };

  const deleteCadence = (id: number) => {
    setCadences(prev => prev.filter(cadence => cadence.id !== id));
  };

  // Template management functions
  const addTemplate = (templateData: Omit<EmailTemplate, 'id' | 'dateCreated' | 'lastModified'>) => {
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: `custom-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setEmailTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(template => 
      template.id === id ? { 
        ...template, 
        ...updates, 
        lastModified: new Date().toISOString() 
      } : template
    ));
  };

  const deleteTemplate = (id: string) => {
    // Prevent deletion of system templates
    const template = emailTemplates.find(t => t.id === id);
    if (template?.isSystem) {
      alert("System templates cannot be deleted.");
      return;
    }
    setEmailTemplates(prev => prev.filter(template => template.id !== id));
  };

  const duplicateTemplate = (id: string) => {
    const template = emailTemplates.find(t => t.id === id);
    if (template) {
      const duplicatedTemplate: EmailTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        name: `${template.name} (Copy)`,
        isSystem: false,
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      setEmailTemplates(prev => [...prev, duplicatedTemplate]);
      return duplicatedTemplate;
    }
  };

  // Loading state
  if (isLoading) {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              {/* Left page */}
              <path d="M3 5h8v14H3c-0.55 0-1-0.45-1-1V6c0-0.55 0.45-1 1-1z"/>
              {/* Right page */}
              <path d="M13 5h8c0.55 0 1 0.45 1 1v12c0 0.55-0.45 1-1 1h-8V5z"/>
              {/* Center spine crease */}
              <path d="M11 5v14h2V5h-2z" opacity="0.6"/>
              
              {/* Page content lines - left side */}
              <rect x="4.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
              
              {/* Page content lines - right side */}
              <rect x="4.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
            </svg>
          </div>
          <div className="text-xl font-semibold text-gray-900">Booky</div>
          <div className="w-8 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user?.isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show main application if user is authenticated
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar currentView={currentView} onNavigate={navigateTo} user={user} onLogout={handleLogout} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {currentView === "dashboard" && <DashboardContent onNavigate={navigateTo} campaignData={campaignData} cadences={cadences} />}
        {currentView === "campaign-detail" && <CampaignDetail onNavigate={goBack} campaignData={campaignData} />}
        {currentView === "cadences" && <CadencesPage onNavigate={navigateTo} cadences={cadences} onDeleteCadence={deleteCadence} />}
        {currentView === "cadence-detail" && selectedCadence && <CadenceDetailPage onNavigate={navigateTo} cadenceData={selectedCadence} />}
        {currentView === "new-cadence" && <NewCadencePage onNavigate={navigateTo} onSaveCadence={addCadence} />}
        {currentView === "edit-cadence" && selectedCadence && <NewCadencePage onNavigate={navigateTo} editingCadence={selectedCadence} onSaveCadence={addCadence} onUpdateCadence={updateCadence} />}
        {currentView === "clone-cadence" && selectedCadence && <NewCadencePage onNavigate={navigateTo} editingCadence={{...selectedCadence, name: `(Clone) ${selectedCadence.name}`}} onSaveCadence={addCadence} />}
        {currentView === "prospect-upload" && <ProspectUploadPage onNavigate={navigateTo} onCampaignLaunch={updateCampaignData} calendarInvitesPerDay={selectedCadence?.settings?.calendarInvitesPerDay} />}
        {currentView === "prospects" && <ProspectsPage onNavigate={navigateTo} onGoBack={goBack} emailTemplates={emailTemplates} />}
        {currentView === "account-settings" && <AccountSettingsPage onNavigate={navigateTo} onGoBack={goBack} />}
        {currentView === "meetings" && <MeetingsPage onNavigate={navigateTo} onGoBack={goBack} emailTemplates={emailTemplates} cadences={cadences} />}
        {currentView === "reports" && <ReportsPage onNavigate={navigateTo} onGoBack={goBack} initialView={reportsInitialView} cadences={cadences} campaignData={campaignData} />}
        {currentView === "templates" && <TemplatesPage onNavigate={navigateTo} onGoBack={goBack} templates={emailTemplates} onAddTemplate={addTemplate} onUpdateTemplate={updateTemplate} onDeleteTemplate={deleteTemplate} onDuplicateTemplate={duplicateTemplate} />}
        {currentView === "support" && <SupportPage onNavigate={navigateTo} onGoBack={goBack} user={user} />}
      </main>
    </div>
  );
}
