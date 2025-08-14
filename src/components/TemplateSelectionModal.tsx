import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChevronLeft, FileText, Plus, Calendar, Mail, MessageSquare, Edit } from "lucide-react";

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

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EmailTemplate) => void;
  onCreateNew: () => void;
  templates: EmailTemplate[];
  selectedProspectsCount: number;
}

type ModalStep = "choice" | "template-selection";

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNew,
  templates,
  selectedProspectsCount
}: TemplateSelectionModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>("choice");

  const handleClose = () => {
    setCurrentStep("choice");
    onClose();
  };

  const handleUseSavedTemplate = () => {
    setCurrentStep("template-selection");
  };

  const handleCreateNew = () => {
    handleClose();
    onCreateNew();
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    handleClose();
    onSelectTemplate(template);
  };

  const handleBackToChoice = () => {
    setCurrentStep("choice");
  };

  const getCategoryIcon = (category: EmailTemplate['category']) => {
    switch (category) {
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "follow-up":
        return <Mail className="h-4 w-4" />;
      case "outreach":
        return <MessageSquare className="h-4 w-4" />;
      case "custom":
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: EmailTemplate['category']) => {
    switch (category) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "follow-up":
        return "bg-green-100 text-green-800";
      case "outreach":
        return "bg-purple-100 text-purple-800";
      case "custom":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (currentStep === "choice") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {selectedProspectsCount} Prospects to Cadence</DialogTitle>
            <DialogDescription>
              Choose how you'd like to create your cadence template
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
              onClick={handleUseSavedTemplate}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Use Saved Template</CardTitle>
                    <CardDescription className="text-sm">
                      Start with one of your existing email templates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600">
                  {templates.length} templates available
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-green-300"
              onClick={handleCreateNew}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Create New</CardTitle>
                    <CardDescription className="text-sm">
                      Build a custom cadence template from scratch
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600">
                  Full customization with multi-step sequences
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToChoice}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>
                Select a saved template to use as the starting point for your cadence
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-96 space-y-3">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCategoryColor(template.category)}`}
                        >
                          {template.category}
                        </Badge>
                        {template.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm line-clamp-1">
                        {template.subject || "No subject"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(template.lastModified)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600 line-clamp-2">
                  {truncateText(template.body.replace(/\n/g, ' '), 150) || "No content"}
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No templates available</p>
              <p className="text-sm">Create your first template to get started</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleBackToChoice}>
            Back
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}