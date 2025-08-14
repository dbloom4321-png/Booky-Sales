import { Badge } from "./ui/badge";
import { CheckCircle, Clock, X } from "lucide-react";

export function ProspectsTable() {
  const prospects = [
    {
      name: "Brian Koenig",
      company: "RevOps Inc",
      title: "VP of Revenue Operations",
      status: "Tentative",
      statusType: "tentative" as const,
      dateSent: "Jul 30",
    },
    {
      name: "Sarah Kim",
      company: "Stripe",
      title: "Head of RevOps",
      status: "Booked",
      statusType: "booked" as const,
      dateSent: "Jul 11",
    },
    {
      name: "Maria Lopez",
      company: "Rippling",
      title: "CMO",
      status: "No Show",
      statusType: "no-show" as const,
      dateSent: "Jul 13",
    },
  ];

  const getStatusIcon = (statusType: "booked" | "tentative" | "no-show") => {
    switch (statusType) {
      case "booked":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "tentative":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "no-show":
        return <X className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (statusType: "booked" | "tentative" | "no-show", status: string) => {
    switch (statusType) {
      case "booked":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            {status}
          </Badge>
        );
      case "tentative":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {status}
          </Badge>
        );
      case "no-show":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Prospects</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-600">Prospect Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Company</th>
              <th className="text-left p-4 font-medium text-gray-600">Title</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Date Sent</th>
              <th className="text-left p-4 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{prospect.name}</td>
                <td className="p-4 text-gray-600">{prospect.company}</td>
                <td className="p-4 text-gray-600">{prospect.title}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(prospect.statusType)}
                    {getStatusBadge(prospect.statusType, prospect.status)}
                  </div>
                </td>
                <td className="p-4 text-gray-600">{prospect.dateSent}</td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}