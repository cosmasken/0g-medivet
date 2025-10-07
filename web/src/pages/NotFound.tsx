import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, Brain, Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="text-center shadow-xl border-0">
          <CardHeader className="pb-2">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-gray-400 mb-2">404</p>
              <p className="text-gray-600 mb-6">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs text-gray-600">AI Insights</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-xs text-gray-600">Secure Storage</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
                <Home className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-xs text-gray-600">Health Records</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              <p className="mb-2">
                The requested URL: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{location.pathname}</span>
              </p>
              <p className="text-xs text-gray-400">
                Error: Page not found in the MediVet system
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact support at support@medivet.health</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
