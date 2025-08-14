import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { TemplateSelectionModal } from "./TemplateSelectionModal";
import { ChevronDown, ChevronUp, Search, Mail, ArrowLeft, Upload, Users, Building, MapPin, UserX } from "lucide-react";

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  location?: string;
  industry?: string;
  linkedinUrl?: string;
  phone?: string;
  dateAdded: string;
  status: "" | "in-cadence" | "meeting-held" | "meeting-declined" | "future-meeting";
  optedOut: boolean;
  optOutDate?: string;
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

interface ProspectsPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings" | "reports" | "templates" | "prospects") => void;
  onGoBack: () => void;
  emailTemplates?: EmailTemplate[];
}

type SortField = "firstName" | "lastName" | "email" | "title" | "company" | "dateAdded" | "status";
type SortDirection = "asc" | "desc";
type ProspectStatus = "" | "in-cadence" | "meeting-held" | "meeting-declined" | "future-meeting" | "opted-out";

interface FilterState {
  statuses: ProspectStatus[];
}

export function ProspectsPage({ onNavigate, onGoBack, emailTemplates = [] }: ProspectsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const [showAddToCadenceModal, setShowAddToCadenceModal] = useState(false);
  const [showTemplateSelectionModal, setShowTemplateSelectionModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    statuses: ["", "in-cadence", "meeting-held", "meeting-declined", "future-meeting", "opted-out"]
  });

  // Mock prospects data with new status values including blank status
  const prospects: Prospect[] = [
    {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@techcorp.com",
      title: "VP of Sales",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      industry: "Technology",
      linkedinUrl: "https://linkedin.com/in/sarahjohnson",
      phone: "+1 (555) 123-4567",
      dateAdded: "2024-08-01",
      status: "meeting-held",
      optedOut: false
    },
    {
      id: "2",
      firstName: "Mike",
      lastName: "Chen",
      email: "mike.chen@startup.io",
      title: "Head of Growth",
      company: "StartupIO Inc",
      location: "Austin, TX",
      industry: "SaaS",
      linkedinUrl: "https://linkedin.com/in/mikechen",
      dateAdded: "2024-08-02",
      status: "in-cadence",
      optedOut: false
    },
    {
      id: "3",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.r@bigtech.com",
      title: "Director of Marketing",
      company: "BigTech Corp",
      location: "Seattle, WA",
      industry: "Technology",
      linkedinUrl: "https://linkedin.com/in/emilyrodriguez",
      phone: "+1 (555) 234-5678",
      dateAdded: "2024-08-03",
      status: "future-meeting",
      optedOut: true,
      optOutDate: "2024-08-05"
    },
    {
      id: "4",
      firstName: "David",
      lastName: "Park",
      email: "david.park@fintech.com",
      title: "CTO",
      company: "FinTech Innovations",
      location: "New York, NY",
      industry: "Financial Services",
      linkedinUrl: "https://linkedin.com/in/davidpark",
      dateAdded: "2024-08-04",
      status: "future-meeting",
      optedOut: false
    },
    {
      id: "5",
      firstName: "Lisa",
      lastName: "Thompson",
      email: "lisa.t@retailcorp.com",
      title: "Chief Revenue Officer",
      company: "RetailCorp",
      location: "Chicago, IL",
      industry: "Retail",
      linkedinUrl: "https://linkedin.com/in/lisathompson",
      phone: "+1 (555) 345-6789",
      dateAdded: "2024-08-05",
      status: "in-cadence",
      optedOut: false
    },
    {
      id: "6",
      firstName: "James",
      lastName: "Wilson",
      email: "j.wilson@healthcare.org",
      title: "VP of Operations",
      company: "Healthcare Systems Inc",
      location: "Miami, FL",
      industry: "Healthcare",
      linkedinUrl: "https://linkedin.com/in/jameswilson",
      dateAdded: "2024-08-06",
      status: "meeting-declined",
      optedOut: true,
      optOutDate: "2024-08-08"
    },
    {
      id: "7",
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@consulting.com",
      title: "Senior Partner",
      company: "Elite Consulting Group",
      location: "Los Angeles, CA",
      industry: "Consulting",
      linkedinUrl: "https://linkedin.com/in/mariagarcia",
      phone: "+1 (555) 456-7890",
      dateAdded: "2024-08-07",
      status: "meeting-held",
      optedOut: false
    },
    {
      id: "8",
      firstName: "Robert",
      lastName: "Kim",
      email: "r.kim@techstartup.io",
      title: "Founder & CEO",
      company: "Tech Startup Labs",
      location: "San Jose, CA",
      industry: "Technology",
      linkedinUrl: "https://linkedin.com/in/robertkim",
      dateAdded: "2024-08-08",
      status: "",
      optedOut: false
    },
    {
      id: "9",
      firstName: "Jennifer",
      lastName: "Lee",
      email: "jennifer.lee@enterprise.com",
      title: "Head of Digital Transformation",
      company: "Enterprise Solutions Ltd",
      location: "Boston, MA",
      industry: "Enterprise Software",
      linkedinUrl: "https://linkedin.com/in/jenniferlee",
      phone: "+1 (555) 567-8901",
      dateAdded: "2024-08-09",
      status: "",
      optedOut: false
    },
    {
      id: "10",
      firstName: "Alex",
      lastName: "Martinez",
      email: "a.martinez@globalbank.com",
      title: "SVP Technology",
      company: "Global Bank Corp",
      location: "Charlotte, NC",
      industry: "Banking",
      linkedinUrl: "https://linkedin.com/in/alexmartinez",
      dateAdded: "2024-08-10",
      status: "meeting-declined",
      optedOut: false
    },
    {
      id: "11",
      firstName: "Amanda",
      lastName: "Foster",
      email: "a.foster@newcompany.com",
      title: "Marketing Director",
      company: "New Company Inc",
      location: "Denver, CO",
      industry: "Marketing",
      linkedinUrl: "https://linkedin.com/in/amandafoster",
      phone: "+1 (555) 678-9012",
      dateAdded: "2024-08-11",
      status: "",
      optedOut: false
    }
  ];

  // Define the logical order for status sorting - blank status first
  const statusOrder: Record<ProspectStatus, number> = {
    "": 1,
    "in-cadence": 2,
    "future-meeting": 3,
    "meeting-held": 4,
    "meeting-declined": 5,
    "opted-out": 6
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedProspects = () => {
    return [...prospects].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Get the effective status (opted-out overrides regular status)
      const getEffectiveStatus = (prospect: Prospect): ProspectStatus => {
        return prospect.optedOut ? "opted-out" : prospect.status;
      };

      switch (sortField) {
        case "firstName":
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
          break;
        case "lastName":
          aValue = a.lastName.toLowerCase();
          bValue = b.lastName.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "company":
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case "dateAdded":
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
        case "status":
          // Use the predefined order for status sorting
          aValue = statusOrder[getEffectiveStatus(a)];
          bValue = statusOrder[getEffectiveStatus(b)];
          break;
        default:
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredAndSortedProspects = getSortedProspects()
    .filter(prospect => {
      // Get effective status for filtering
      const effectiveStatus: ProspectStatus = prospect.optedOut ? "opted-out" : prospect.status;
      
      // Status filter
      if (!filters.statuses.includes(effectiveStatus)) return false;
      
      // Search filter
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        prospect.firstName.toLowerCase().includes(searchLower) ||
        prospect.lastName.toLowerCase().includes(searchLower) ||
        prospect.email.toLowerCase().includes(searchLower) ||
        prospect.title.toLowerCase().includes(searchLower) ||
        prospect.company.toLowerCase().includes(searchLower)
      );
    });

  const toggleStatusFilter = (status: ProspectStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status) 
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  // Handle prospect selection - exclude opted out prospects
  const handleProspectSelect = (prospectId: string, isSelected: boolean) => {
    const prospect = prospects.find(p => p.id === prospectId);
    if (prospect?.optedOut) {
      // Prevent selection of opted out prospects
      return;
    }
    
    const newSelection = new Set(selectedProspects);
    if (isSelected) {
      newSelection.add(prospectId);
    } else {
      newSelection.delete(prospectId);
    }
    setSelectedProspects(newSelection);
  };

  // Handle select all prospects - only selectable prospects
  const handleSelectAll = () => {
    const selectableProspects = filteredAndSortedProspects.filter(prospect => !prospect.optedOut);
    const selectableProspectIds = new Set(selectableProspects.map(prospect => prospect.id));
    
    // If all selectable prospects are already selected, deselect them
    const allSelectableSelected = selectableProspects.every(prospect => selectedProspects.has(prospect.id));
    
    if (allSelectableSelected) {
      setSelectedProspects(new Set());
    } else {
      setSelectedProspects(selectableProspectIds);
    }
  };

  // Handle adding selected prospects to cadence
  const handleAddToCadence = () => {
    if (selectedProspects.size === 0) {
      alert("Please select at least one prospect to add to a cadence.");
      return;
    }
    setShowTemplateSelectionModal(true);
  };

  // Handle bulk email for selected prospects
  const handleBulkEmail = () => {
    if (selectedProspects.size === 0) {
      alert("Please select at least one prospect to send emails.");
      return;
    }
    
    const selectedProspectsList = filteredAndSortedProspects.filter(prospect => 
      selectedProspects.has(prospect.id) && !prospect.optedOut
    );
    
    alert(`Sending emails to ${selectedProspectsList.length} selected prospects:\n${selectedProspectsList.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`);
    setSelectedProspects(new Set());
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    const selectedProspectsList = filteredAndSortedProspects.filter(prospect => 
      selectedProspects.has(prospect.id) && !prospect.optedOut
    );
    
    // In a real app, this would create a new cadence with these prospects and the selected template
    alert(`Creating new cadence with ${selectedProspectsList.length} selected prospects using template "${template.name}":\n${selectedProspectsList.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`);
    
    setShowTemplateSelectionModal(false);
    setSelectedProspects(new Set());
    onNavigate("new-cadence");
  };

  // Handle creating new cadence without template
  const handleCreateNewCadence = () => {
    const selectedProspectsList = filteredAndSortedProspects.filter(prospect => 
      selectedProspects.has(prospect.id) && !prospect.optedOut
    );
    
    // In a real app, this would create a new cadence with these prospects
    alert(`Creating new cadence with ${selectedProspectsList.length} selected prospects:\n${selectedProspectsList.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`);
    
    setShowTemplateSelectionModal(false);
    setSelectedProspects(new Set());
    onNavigate("new-cadence");
  };

  // Handle saving selected prospects to cadence (legacy modal)
  const handleSaveToNewCadence = () => {
    const selectedProspectsList = filteredAndSortedProspects.filter(prospect => 
      selectedProspects.has(prospect.id) && !prospect.optedOut
    );
    
    // In a real app, this would create a new cadence with these prospects
    alert(`Creating new cadence with ${selectedProspectsList.length} selected prospects:\n${selectedProspectsList.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`);
    
    setShowAddToCadenceModal(false);
    setSelectedProspects(new Set());
    onNavigate("new-cadence");
  };

  // Get count of selected prospects (only selectable ones)
  const selectableProspects = filteredAndSortedProspects.filter(prospect => !prospect.optedOut);
  const selectedCount = selectedProspects.size;
  const allSelectableSelected = selectableProspects.length > 0 && selectableProspects.every(prospect => selectedProspects.has(prospect.id));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string, optedOut: boolean) => {
    if (optedOut) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <UserX className="h-3 w-3 mr-1" />
          Opted Out
        </span>
      );
    }
    
    // Handle blank status
    if (status === "") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Unassigned
        </span>
      );
    }
    
    const colors = {
      "in-cadence": "bg-blue-100 text-blue-800",
      "future-meeting": "bg-purple-100 text-purple-800",
      "meeting-held": "bg-green-100 text-green-800",
      "meeting-declined": "bg-yellow-100 text-yellow-800"
    };
    
    const labels = {
      "in-cadence": "In Cadence",
      "future-meeting": "Future Meeting",
      "meeting-held": "Meeting Held",
      "meeting-declined": "Meeting Declined"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close status dropdown
      if (showStatusDropdown && !target.closest('[data-dropdown="status"]')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

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
              <h1 className="text-xl font-semibold text-gray-900">Prospects</h1>
              <p className="text-sm text-gray-600">Manage your prospect database</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-500">
                {filteredAndSortedProspects.length} of {prospects.length} prospects
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
              onClick={() => onNavigate("prospect-upload")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Prospects
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
              Status ({filters.statuses.length})
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("")}
                      onChange={() => toggleStatusFilter("")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Unassigned</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("in-cadence")}
                      onChange={() => toggleStatusFilter("in-cadence")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">In Cadence</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("future-meeting")}
                      onChange={() => toggleStatusFilter("future-meeting")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Future Meeting</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("meeting-held")}
                      onChange={() => toggleStatusFilter("meeting-held")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Meeting Held</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("meeting-declined")}
                      onChange={() => toggleStatusFilter("meeting-declined")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Meeting Declined</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes("opted-out")}
                      onChange={() => toggleStatusFilter("opted-out")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Opted Out</span>
                  </label>
                </div>
              </div>
            )}
          </div>
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
                    <SortButton field="firstName">Name</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="email">Email</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="title">Title</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="company">Company</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="status">Status</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="dateAdded">Date Added</SortButton>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedProspects.map((prospect) => (
                  <tr 
                    key={prospect.id} 
                    className={`transition-colors relative ${
                      prospect.optedOut 
                        ? 'bg-red-50 hover:bg-red-100 text-red-900' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProspects.has(prospect.id)}
                        onChange={(e) => handleProspectSelect(prospect.id, e.target.checked)}
                        disabled={prospect.optedOut}
                        className={`w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${
                          prospect.optedOut ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${prospect.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                          {prospect.firstName} {prospect.lastName}
                        </div>
                        {prospect.location && (
                          <div className={`text-sm flex items-center gap-1 ${prospect.optedOut ? 'text-red-700' : 'text-gray-500'}`}>
                            <MapPin className="h-3 w-3" />
                            {prospect.location}
                          </div>
                        )}
                        {prospect.optedOut && prospect.optOutDate && (
                          <div className="text-xs text-red-600 mt-1">
                            Opted out: {formatDate(prospect.optOutDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${prospect.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                        {prospect.email}
                      </div>
                      {prospect.phone && (
                        <div className={`text-xs ${prospect.optedOut ? 'text-red-700' : 'text-gray-500'}`}>
                          {prospect.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${prospect.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                        {prospect.title}
                      </div>
                      {prospect.industry && (
                        <div className={`text-xs ${prospect.optedOut ? 'text-red-700' : 'text-gray-500'}`}>
                          {prospect.industry}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className={`h-4 w-4 ${prospect.optedOut ? 'text-red-600' : 'text-gray-400'}`} />
                        <div className={`text-sm ${prospect.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                          {prospect.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 relative z-10">
                      {getStatusBadge(prospect.status, prospect.optedOut)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${prospect.optedOut ? 'text-red-900' : 'text-gray-900'}`}>
                        {formatDate(prospect.dateAdded)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {prospect.optedOut ? (
                        <div className="text-xs text-red-600 font-medium">
                          Unsubscribed
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert(`Email ${prospect.firstName} ${prospect.lastName}`)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedProspects.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by uploading your first prospects."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => onNavigate("prospect-upload")} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Prospects
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={showTemplateSelectionModal}
        onClose={() => setShowTemplateSelectionModal(false)}
        onSelectTemplate={handleTemplateSelect}
        onCreateNew={handleCreateNewCadence}
        templates={emailTemplates}
        selectedProspectsCount={selectedCount}
      />

      {/* Add to Cadence Modal (Legacy - kept for fallback) */}
      <Dialog open={showAddToCadenceModal} onOpenChange={setShowAddToCadenceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Selected Prospects to Cadence</DialogTitle>
            <DialogDescription>
              Create a new cadence with the {selectedCount} selected prospects.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              The selected prospects will be added to a new cadence with appropriate follow-up templates.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToCadenceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToNewCadence} className="bg-purple-600 hover:bg-purple-700">
              Create Cadence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}