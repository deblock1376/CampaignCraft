import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Search, AlertCircle, Info, AlertTriangle, Bug, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ClientLog {
  id: number;
  userId: number | null;
  newsroomId: number | null;
  sessionId: string;
  level: string;
  message: string;
  context: any;
  url: string;
  userAgent: string;
  createdAt: string;
}

interface UserFlag {
  id: number;
  userId: number;
  newsroomId: number | null;
  flagType: string;
  reason: string | null;
  notes: string | null;
  flaggedBy: number;
  userName: string;
  newsroomName: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLogs() {
  const [logLevel, setLogLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading: logsLoading } = useQuery<ClientLog[]>({
    queryKey: ["/api/admin/logs", logLevel],
    queryFn: async () => {
      const url = logLevel === "all" 
        ? "/api/admin/logs?limit=500" 
        : `/api/admin/logs?level=${logLevel}&limit=500`;
      const res = await apiRequest('GET', url);
      return await res.json();
    },
  });

  const { data: flags = [], isLoading: flagsLoading } = useQuery<UserFlag[]>({
    queryKey: ["/api/admin/user-flags"],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/user-flags');
      return await res.json();
    },
  });

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return log.message.toLowerCase().includes(searchLower) ||
           log.url.toLowerCase().includes(searchLower) ||
           log.sessionId.toLowerCase().includes(searchLower);
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, string> = {
      error: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={variants[level] || 'bg-gray-100 text-gray-800'}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getFlagBadge = (flagType: string) => {
    const variants: Record<string, string> = {
      good: 'bg-green-100 text-green-800',
      bad: 'bg-red-100 text-red-800',
      testing: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={variants[flagType] || 'bg-gray-100 text-gray-800'}>
        {flagType.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="h-full p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Logs & User Flags</h1>
          <p className="text-muted-foreground mt-1">
            Monitor client activity and manage user flags for testing
          </p>
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList>
            <TabsTrigger value="logs">Client Logs</TabsTrigger>
            <TabsTrigger value="flags">User Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Logs</CardTitle>
                <CardDescription>
                  {logs.length} logs captured (90-day retention)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="warn">Warnings</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No logs found</div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 bg-white space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                            <span className="font-medium">{log.message}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>URL: {log.url}</div>
                          <div>Session: {log.sessionId}</div>
                          {log.userId && <div>User ID: {log.userId}</div>}
                          {log.newsroomId && <div>Newsroom ID: {log.newsroomId}</div>}
                        </div>
                        {log.context && Object.keys(log.context).length > 0 && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Context
                            </summary>
                            <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Flags</CardTitle>
                <CardDescription>
                  {flags.length} users flagged for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {flagsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading flags...</div>
                  ) : flags.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No user flags found</div>
                  ) : (
                    flags.map((flag) => (
                      <div key={flag.id} className="border rounded-lg p-4 bg-white space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            {getFlagBadge(flag.flagType)}
                            <span className="font-medium">{flag.userName}</span>
                            {flag.newsroomName && (
                              <span className="text-sm text-muted-foreground">
                                ({flag.newsroomName})
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(flag.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {flag.reason && (
                          <div className="text-sm">
                            <span className="font-medium">Reason: </span>
                            {flag.reason}
                          </div>
                        )}
                        {flag.notes && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Notes: </span>
                            {flag.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
