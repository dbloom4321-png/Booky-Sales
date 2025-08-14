import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, FileText, Users, Clock } from "lucide-react";
import { getTimezoneFromState, TIMEZONE_OPTIONS, detectTimezoneFromBrowser, getTimezoneDisplayName } from "./TimezoneUtils";

interface ProspectUploadPageProps {
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload", campaignInfo?: Partial<{ prospectCount: number; campaignName: string; status: "active" | "paused" | "completed" }>, cadenceData?: any, reportsView?: any) => void;
  onCampaignLaunch: (data: { prospectCount: number; campaignName: string; status: "active" | "paused" | "completed" }) => void;
  calendarInvitesPerDay?: number;
}

interface CsvField {
  name: string;
  sample: string;
  mapped: string;
}

interface ProspectData {
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  state: string;
  email: string;
  timezone?: string;
  [key: string]: string;
}

export function ProspectUploadPage({ onNavigate, onCampaignLaunch, calendarInvitesPerDay = 25 }: ProspectUploadPageProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFields, setCsvFields] = useState<CsvField[]>([]);
  const [uploadStep, setUploadStep] = useState<"upload" | "mapping" | "timezone" | "preview">("upload");
  const [mappedData, setMappedData] = useState<ProspectData[]>([]);
  const [prospectsWithoutState, setProspectsWithoutState] = useState<ProspectData[]>([]);
  const [defaultTimezone, setDefaultTimezone] = useState<string>(detectTimezoneFromBrowser());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Required fields for prospects
  const requiredFields = [
    { key: "first_name", label: "First Name", required: true },
    { key: "last_name", label: "Last Name", required: true },
    { key: "title", label: "Title", required: false },
    { key: "company", label: "Company", required: true },
    { key: "state", label: "State", required: false },
    { key: "email", label: "Email", required: true }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Process all rows but limit to 1000 for performance
      const dataLines = lines.slice(1).filter(line => line.trim());
      const totalRows = dataLines.length;
      
      const data = dataLines.slice(0, 1000).map(line => {
        // Better CSV parsing - handle quoted fields
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.trim().replace(/^"(.*)"$/, '$1'));
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = cleanValues[index] || '';
        });
        return row;
      }).filter(row => {
        // Filter out completely empty rows
        return Object.values(row).some(value => value && value.toString().trim() !== '');
      });



      const fields: CsvField[] = headers.map(header => ({
        name: header,
        sample: data[0]?.[header] || '',
        mapped: ''
      }));

      setCsvData(data);
      setCsvFields(fields);
      
      // Show warning if file was truncated
      if (totalRows > 1000) {
        alert(`Warning: Your file contains ${totalRows} prospects, but only the first 1000 have been loaded. Please contact support if you need to upload larger files.`);
      }
      
      setUploadStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleFieldMapping = (csvFieldName: string, mappedTo: string) => {
    setCsvFields(fields => 
      fields.map(field => 
        field.name === csvFieldName 
          ? { ...field, mapped: mappedTo }
          : field
      )
    );
  };

  const generateMappedData = () => {
    const mapped = csvData.map(row => {
      const mappedRow: any = {};
      csvFields.forEach(field => {
        if (field.mapped) {
          mappedRow[field.mapped] = row[field.name];
        }
      });
      
      // Assign timezone based on state or use default
      if (mappedRow.state && mappedRow.state.trim()) {
        mappedRow.timezone = getTimezoneFromState(mappedRow.state);
      }
      
      return mappedRow;
    });
    
    // Check if any prospects don't have state/timezone
    const withoutState = mapped.filter(prospect => !prospect.state || !prospect.state.trim());
    
    setMappedData(mapped);
    setProspectsWithoutState(withoutState);
    
    // If prospects without state exist, go to timezone assignment step
    if (withoutState.length > 0) {
      setUploadStep("timezone");
    } else {
      setUploadStep("preview");
    }
  };

  const handleLaunchCampaign = () => {
    // Ensure all prospects have timezone assigned
    const finalData = mappedData.map(prospect => ({
      ...prospect,
      timezone: prospect.timezone || defaultTimezone
    }));
    
    // Calculate timezone distribution for summary
    const timezoneDistribution = finalData.reduce((acc, prospect) => {
      const tz = prospect.timezone || defaultTimezone;
      acc[tz] = (acc[tz] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const timezoneCount = Object.keys(timezoneDistribution).length;
    
    // Update campaign data with actual prospect count and timezone info
    onCampaignLaunch({
      prospectCount: finalData.length,
      campaignName: `Campaign ${new Date().toLocaleDateString()}`,
      status: "active"
    });
    
    const timezonesSummary = Object.entries(timezoneDistribution)
      .map(([tz, count]) => `${count} in ${getTimezoneDisplayName(tz)}`)
      .join(', ');
    
    alert(`Campaign launched with ${finalData.length} prospects across ${timezoneCount} timezone${timezoneCount > 1 ? 's' : ''}!\n\nDistribution: ${timezonesSummary}`);
    onNavigate("dashboard");
  };

  const handleBack = () => {
    if (uploadStep === "mapping") {
      setUploadStep("upload");
    } else if (uploadStep === "timezone") {
      setUploadStep("mapping");
    } else if (uploadStep === "preview") {
      // Go back to timezone if there were prospects without state, otherwise mapping
      setUploadStep(prospectsWithoutState.length > 0 ? "timezone" : "mapping");
    } else {
      onNavigate("new-cadence");
    }
  };

  const getMappingStatus = () => {
    const requiredMapped = requiredFields.filter(field => field.required)
      .every(field => csvFields.some(csvField => csvField.mapped === field.key));
    const totalMapped = csvFields.filter(field => field.mapped).length;
    return { requiredMapped, totalMapped };
  };

  const { requiredMapped, totalMapped } = getMappingStatus();

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {uploadStep === "upload" ? "Back to Cadence" : "Back"}
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Upload Prospects</h1>
        <p className="text-gray-600">Upload your prospect list and map fields to start your cadence</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${uploadStep === "upload" ? "text-blue-600" : "text-green-600"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStep === "upload" ? "bg-blue-100" : "bg-green-100"}`}>
            {uploadStep === "upload" ? "1" : <CheckCircle className="h-5 w-5" />}
          </div>
          <span className="ml-2 font-medium">Upload CSV</span>
        </div>
        <div className={`w-12 h-px mx-3 ${uploadStep !== "upload" ? "bg-green-200" : "bg-gray-200"}`}></div>
        <div className={`flex items-center ${uploadStep === "mapping" ? "text-blue-600" : (uploadStep === "timezone" || uploadStep === "preview") ? "text-green-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStep === "mapping" ? "bg-blue-100" : (uploadStep === "timezone" || uploadStep === "preview") ? "bg-green-100" : "bg-gray-100"}`}>
            {(uploadStep === "timezone" || uploadStep === "preview") ? <CheckCircle className="h-5 w-5" /> : "2"}
          </div>
          <span className="ml-2 font-medium">Field Mapping</span>
        </div>
        <div className={`w-12 h-px mx-3 ${(uploadStep === "timezone" || uploadStep === "preview") ? "bg-green-200" : "bg-gray-200"}`}></div>
        <div className={`flex items-center ${uploadStep === "timezone" ? "text-blue-600" : uploadStep === "preview" ? "text-green-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStep === "timezone" ? "bg-blue-100" : uploadStep === "preview" ? "bg-green-100" : "bg-gray-100"}`}>
            {uploadStep === "preview" ? <CheckCircle className="h-5 w-5" /> : "3"}
          </div>
          <span className="ml-2 font-medium">Timezone Setup</span>
        </div>
        <div className={`w-12 h-px mx-3 ${uploadStep === "preview" ? "bg-green-200" : "bg-gray-200"}`}></div>
        <div className={`flex items-center ${uploadStep === "preview" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStep === "preview" ? "bg-blue-100" : "bg-gray-100"}`}>
            4
          </div>
          <span className="ml-2 font-medium">Preview & Launch</span>
        </div>
      </div>

      {/* Upload Step */}
      {uploadStep === "upload" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload your prospect CSV file</p>
                <p className="text-gray-600">Drag and drop or click to browse</p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                className="mt-4"
                variant="outline"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {csvFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">File uploaded successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {csvFile.name} ({csvData.length} prospects loaded)
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">CSV Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Include columns for: first_name, last_name, email, company (required)</li>
                <li>• Optional columns: title, state, phone, linkedin_url</li>
                <li>• <span className="font-medium">State column recommended</span> - used for automatic timezone assignment</li>
                <li>• File should be in CSV format with headers in the first row</li>
                <li>• Maximum 1000 prospects per upload</li>
              </ul>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Timezone Assignment</p>
                    <p className="text-xs text-blue-700 mt-1">
                      When prospects include a US state, timezones are automatically assigned for optimal meeting scheduling. 
                      Prospects without state information will be assigned your selected default timezone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping Step */}
      {uploadStep === "mapping" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Map CSV Fields
              </CardTitle>
              <p className="text-gray-600">Map your CSV columns to the required prospect fields</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {csvFields.map((csvField, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{csvField.name}</p>
                      <p className="text-sm text-gray-600 truncate">{csvField.sample}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-400">→</span>
                    </div>
                    <div>
                      <Select 
                        value={csvField.mapped || "unmapped"} 
                        onValueChange={(value) => handleFieldMapping(csvField.name, value === "unmapped" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unmapped">Don't map</SelectItem>
                          {requiredFields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label} {field.required && "*"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      {csvField.mapped && csvField.mapped !== "" && (
                        <Badge variant={requiredFields.find(f => f.key === csvField.mapped)?.required ? "default" : "secondary"}>
                          {requiredFields.find(f => f.key === csvField.mapped)?.required ? "Required" : "Optional"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mapping Status</p>
                    <p className="text-sm text-gray-600">
                      {totalMapped} fields mapped • {requiredMapped ? "All required fields mapped" : "Missing required fields"}
                    </p>
                  </div>
                  {requiredMapped ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={generateMappedData}
                  disabled={!requiredMapped}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Timezone Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timezone Setup Step */}
      {uploadStep === "timezone" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timezone Assignment
              </CardTitle>
              <p className="text-gray-600">
                {prospectsWithoutState.length > 0 
                  ? `${prospectsWithoutState.length} prospects don't have state information. Please assign a timezone for scheduling meetings.`
                  : "All prospects have been automatically assigned timezones based on their state."
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {prospectsWithoutState.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Default Timezone for Prospects Without State Information
                  </label>
                  <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Select default timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map(timezone => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label} ({timezone.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Prospects without state ({prospectsWithoutState.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {prospectsWithoutState.slice(0, 10).map((prospect, index) => (
                        <div key={index} className="text-sm text-blue-800">
                          {prospect.first_name} {prospect.last_name} - {prospect.company}
                        </div>
                      ))}
                      {prospectsWithoutState.length > 10 && (
                        <div className="text-sm text-blue-600 font-medium">
                          +{prospectsWithoutState.length - 10} more prospects
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Timezone Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  {TIMEZONE_OPTIONS.map(timezone => {
                    const prospectsInTimezone = mappedData.filter(p => 
                      p.timezone === timezone.value || 
                      (!p.timezone && !p.state && defaultTimezone === timezone.value)
                    ).length;
                    
                    return prospectsInTimezone > 0 ? (
                      <div key={timezone.value} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{timezone.label}</span>
                        <Badge variant="secondary">{prospectsInTimezone} prospects</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    // Assign default timezone to prospects without state
                    const updatedData = mappedData.map(prospect => ({
                      ...prospect,
                      timezone: prospect.timezone || defaultTimezone
                    }));
                    setMappedData(updatedData);
                    setUploadStep("preview");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Step */}
      {uploadStep === "preview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Preview & Launch Campaign
              </CardTitle>
              <p className="text-gray-600">Review your mapped prospect data before launching</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Campaign Size</p>
                  <p className="text-lg font-semibold text-blue-600">{mappedData.length} prospects</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Estimated Duration</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {Math.ceil(mappedData.length / calendarInvitesPerDay)} days
                  </p>
                  <p className="text-xs text-gray-500">at {calendarInvitesPerDay} calendar invites/day</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Timezone Coverage</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {new Set(mappedData.map(p => p.timezone || defaultTimezone)).size} zones
                  </p>
                  <p className="text-xs text-gray-500">across US timezones</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Campaign Type</p>
                  <p className="text-lg font-semibold text-blue-600">Email + Calendar</p>
                  <p className="text-xs text-gray-500">Multi-step sequence</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Timezone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedData.slice(0, 5).map((prospect, index) => (
                      <TableRow key={index}>
                        <TableCell>{prospect.first_name}</TableCell>
                        <TableCell>{prospect.last_name}</TableCell>
                        <TableCell>{prospect.email}</TableCell>
                        <TableCell>{prospect.company}</TableCell>
                        <TableCell>{prospect.title || "-"}</TableCell>
                        <TableCell>{prospect.state || "-"}</TableCell>
                        <TableCell>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {getTimezoneDisplayName(prospect.timezone || defaultTimezone)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {mappedData.length > 5 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing first 5 of {mappedData.length} prospects
                </p>
              )}

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox id="confirm-launch" />
                <label htmlFor="confirm-launch" className="text-sm">
                  I confirm that I want to launch this campaign with {mappedData.length} prospects
                </label>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleLaunchCampaign}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Launch Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}