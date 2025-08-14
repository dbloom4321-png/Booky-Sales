import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ArrowLeft, Send, HeadphonesIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface SupportPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings" | "reports" | "templates" | "prospects" | "support") => void;
  onGoBack: () => void;
  user: {
    email: string;
    name: string;
    isAuthenticated: boolean;
  };
}

export function SupportPage({ onNavigate, onGoBack, user }: SupportPageProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: "technical", label: "Technical Issue" },
    { value: "billing", label: "Billing & Account" },
    { value: "feature", label: "Feature Request" },
    { value: "training", label: "Training & Support" },
    { value: "integration", label: "Integration Help" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" }
  ];

  const priorities = [
    { value: "low", label: "Low - General question", color: "text-gray-600" },
    { value: "medium", label: "Medium - Need assistance", color: "text-blue-600" },
    { value: "high", label: "High - Blocking my work", color: "text-orange-600" },
    { value: "urgent", label: "Urgent - System down", color: "text-red-600" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim() || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would send to the support system
      console.log("Support ticket submitted:", {
        user: user.email,
        userName: user.name,
        subject,
        message,
        category,
        priority,
        timestamp: new Date().toISOString()
      });

      setIsSubmitted(true);
    } catch (error) {
      alert("Failed to submit support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setPriority("medium");
    setCategory("");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
              <h1 className="text-xl font-semibold text-gray-900">Support Request Submitted</h1>
              <p className="text-sm text-gray-600">We'll get back to you soon</p>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h2>
                <p className="text-gray-600">
                  Thank you for contacting Booky support. We've received your request and will respond within 24 hours.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Our support team will review your request</li>
                      <li>• You'll receive a confirmation email shortly</li>
                      <li>• We'll respond within 24 hours (sooner for urgent issues)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Submit Another Request
                  </Button>
                  <Button 
                    onClick={() => onNavigate("dashboard")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Contact Support</h1>
            </div>
            <p className="text-sm text-gray-600">Get help from the Booky support team</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quick Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Quick Help Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-1">Getting Started Guide</h3>
                  <p className="text-sm text-gray-600">Learn the basics of setting up your first cadence</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-1">Video Tutorials</h3>
                  <p className="text-sm text-gray-600">Watch step-by-step tutorials for common tasks</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-1">FAQ</h3>
                  <p className="text-sm text-gray-600">Find answers to frequently asked questions</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium text-gray-900 mb-1">Best Practices</h3>
                  <p className="text-sm text-gray-600">Tips for maximizing your meeting booking rates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <p className="text-sm text-gray-600">
                Can't find what you're looking for? Send us a message and we'll help you out.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Info (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Your Name</Label>
                    <Input
                      id="userName"
                      value={user.name}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Your Email</Label>
                    <Input
                      id="userEmail"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <span className={p.color}>{p.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{subject.length}/100 characters</p>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please provide as much detail as possible about your issue or question. Include any error messages, steps you've taken, or specific features you need help with."
                    rows={8}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length}/2000 characters</p>
                </div>

                {/* Priority Info */}
                {priority === "urgent" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-900">Urgent Priority Selected</p>
                        <p className="text-red-800 mt-1">
                          Please only select "Urgent" for critical system issues that completely prevent you from using Booky. 
                          For general questions or feature requests, please use a lower priority.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !message.trim() || !category}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}