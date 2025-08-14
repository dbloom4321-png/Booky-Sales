import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { ArrowLeft, Save, Tag, User, Building, Calendar, Clock as ClockIcon, Mail } from "lucide-react";

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

interface TemplatesPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings" | "reports" | "templates") => void;
  onGoBack: () => void;
  templates: EmailTemplate[];
  onAddTemplate: (template: Omit<EmailTemplate, 'id' | 'dateCreated' | 'lastModified'>) => EmailTemplate;
  onUpdateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => EmailTemplate | undefined;
}

export function TemplatesPage({ 
  onNavigate, 
  onGoBack,
  templates, 
  onUpdateTemplate,
  onAddTemplate
}: TemplatesPageProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubjectTagsDropdown, setShowSubjectTagsDropdown] = useState(false);
  const [showBodyTagsDropdown, setShowBodyTagsDropdown] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

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

  // Sort templates to put custom template first
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.id === "custom-template") return -1;
    if (b.id === "custom-template") return 1;
    return 0;
  });

  // Load template data when selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // For custom template, always show blank fields if no content
        if (template.id === "custom-template" && !template.subject && !template.body) {
          setEditableSubject("");
          setEditableBody("");
        } else {
          setEditableSubject(template.subject);
          setEditableBody(template.body);
        }
        setHasUnsavedChanges(false);
      }
    } else {
      setEditableSubject("");
      setEditableBody("");
      setHasUnsavedChanges(false);
    }
  }, [selectedTemplateId, templates]);

  // Track changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        const hasChanges = editableSubject !== template.subject || editableBody !== template.body;
        setHasUnsavedChanges(hasChanges);
      }
    }
  }, [editableSubject, editableBody, selectedTemplateId, templates]);

  // Set initial template selection to custom template
  useEffect(() => {
    if (sortedTemplates.length > 0 && !selectedTemplateId) {
      const customTemplate = sortedTemplates.find(t => t.id === "custom-template");
      if (customTemplate) {
        setSelectedTemplateId(customTemplate.id);
      } else {
        setSelectedTemplateId(sortedTemplates[0].id);
      }
    }
  }, [sortedTemplates, selectedTemplateId]);

  const handleSaveTemplate = () => {
    if (!selectedTemplateId) {
      alert("Please select a template to save.");
      return;
    }

    if (!editableSubject.trim() || !editableBody.trim()) {
      alert("Please fill in both subject and body before saving.");
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    
    // If this is the blank custom template, prompt for name to create new template
    if (selectedTemplate?.id === "custom-template" && 
        (!selectedTemplate.subject && !selectedTemplate.body)) {
      setShowNameDialog(true);
      return;
    }

    // Otherwise, just update the existing template
    onUpdateTemplate(selectedTemplateId, {
      subject: editableSubject,
      body: editableBody
    });

    setHasUnsavedChanges(false);
    alert("Template saved successfully!");
  };

  const handleCreateNewTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.");
      return;
    }

    // Create new custom template
    const newTemplate = onAddTemplate({
      name: templateName.trim(),
      subject: editableSubject,
      body: editableBody,
      category: "custom",
      isSystem: false
    });

    // Clear the custom template for next use
    onUpdateTemplate("custom-template", {
      subject: "",
      body: ""
    });

    // Switch to the new template
    setSelectedTemplateId(newTemplate.id);
    setHasUnsavedChanges(false);
    setShowNameDialog(false);
    setTemplateName("");
    alert("Template created successfully!");
  };

  const insertTagIntoSubject = (tag: string) => {
    try {
      const input = document.getElementById('template-subject') as HTMLInputElement;
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
      const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
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

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

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
              <h1 className="text-xl font-semibold text-gray-900">Email Templates</h1>
              <p className="text-sm text-gray-600">Edit your email templates</p>
            </div>
          </div>
          <Button 
            onClick={handleSaveTemplate} 
            disabled={!hasUnsavedChanges}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Template Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Template</label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Choose a template to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
                        <span className="font-medium">{template.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {selectedTemplate.category}
                  {selectedTemplate.isSystem && (
                    <span className="ml-4 text-blue-600">• System Template</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Template Editor */}
          {selectedTemplateId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {/* Subject Line */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Subject Line</label>
                  <div className="relative">
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
                  id="template-subject"
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
                  <div className="relative">
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
                  id="template-body"
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  placeholder="Enter email content..."
                  rows={16}
                  className="resize-none"
                />
              </div>

              {hasUnsavedChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    You have unsaved changes. Click "Save Template" to save your modifications.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Tags Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Available Dynamic Tags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dynamicTags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <tag.icon className="h-4 w-4 text-blue-600" />
                  <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">
                    {tag.tag}
                  </span>
                  <span className="text-blue-800">{tag.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Name Input Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Custom Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNewTemplate();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="text-sm text-gray-600">
              This will create a new custom template that you can reuse and select from dropdowns.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}