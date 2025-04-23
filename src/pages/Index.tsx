
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-tibet-cream/30">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center space-y-6">
          <div className="mx-auto h-12 w-12 bg-tibet-red rounded-md flex items-center justify-center">
            <span className="font-bold text-white text-xl">TC</span>
          </div>
          
          <h1 className="text-4xl font-bold text-tibet-charcoal md:text-5xl">
            Tibet Carpet Client Portal
          </h1>
          
          <p className="text-xl text-tibet-charcoal/80 max-w-2xl mx-auto">
            Track the status of your handcrafted carpets from production to delivery.
          </p>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-tibet-red hover:bg-tibet-red/90">
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-10 w-10 bg-tibet-gold/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-tibet-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Real-time Tracking</h3>
            <p className="text-muted-foreground">Follow your carpet's journey through each production stage in real-time.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-10 w-10 bg-tibet-red/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-tibet-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Status Updates</h3>
            <p className="text-muted-foreground">Stay informed about each manufacturing milestone with detailed status information.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-10 w-10 bg-tibet-brown/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-tibet-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Delay Notifications</h3>
            <p className="text-muted-foreground">Receive proactive notifications about any potential production delays.</p>
          </div>
        </div>
        
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tibet Carpet. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
