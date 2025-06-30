import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateLibrary() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const handleSelectTemplate = (templateId: number) => {
    console.log('Template selected:', templateId);
    // TODO: Load template configuration
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Templates</CardTitle>
          <Button variant="ghost" size="sm">
            View All Templates <i className="fas fa-arrow-right ml-1"></i>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-12 h-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template: any) => (
              <div 
                key={template.id} 
                className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    template.name.includes('Breaking') ? 'bg-red-100' :
                    template.name.includes('Monthly') ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    <i className={`${template.icon} ${
                      template.name.includes('Breaking') ? 'text-red-600' :
                      template.name.includes('Monthly') ? 'text-green-600' :
                      'text-blue-600'
                    } text-sm`}></i>
                  </div>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                <h4 className="font-medium text-slate-900 mb-2">{template.name}</h4>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <i className="fas fa-clock mr-1"></i>
                  <span>{template.setupTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
