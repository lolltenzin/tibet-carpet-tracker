
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/data";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  
  // Get order details
  const order = orderId ? getOrderById(orderId) : undefined;

  // Check if order exists and belongs to the logged-in client
  const hasAccess = order && user && order.clientCode === user.clientCode;

  if (!order || !hasAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Order not found</h3>
            <p className="text-muted-foreground mt-2">
              The order you are looking for does not exist or you don't have permission to view it.
            </p>
            <Button asChild className="mt-4 bg-tibet-red hover:bg-tibet-red/90">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{order.carpetName}</h1>
                <p className="text-muted-foreground">Order #{order.orderNumber}</p>
              </div>
              <StatusBadge status={order.status} hasDelay={order.hasDelay} size="lg" />
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-4">Order Information</h2>
              
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <dt className="text-sm text-muted-foreground">Dimensions</dt>
                  <dd className="font-medium">{order.dimensions}</dd>
                </div>
                
                <div>
                  <dt className="text-sm text-muted-foreground">Client Code</dt>
                  <dd className="font-medium">{order.clientCode}</dd>
                </div>
                
                <div>
                  <dt className="text-sm text-muted-foreground">Current Status</dt>
                  <dd>
                    <StatusBadge status={order.status} size="sm" />
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-muted-foreground">Estimated Completion</dt>
                  <dd className="font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {order.estimatedCompletion 
                      ? new Date(order.estimatedCompletion).toLocaleDateString() 
                      : "Not available"}
                  </dd>
                </div>
              </dl>
              
              {order.hasDelay && (
                <div className="bg-red-50 p-4 rounded-md border border-red-100 flex gap-3">
                  <Clock className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-700 mb-1">Potential Delay</h3>
                    <p className="text-sm text-red-600">
                      {order.delayReason || "There is a potential delay with this order. Our team is working to resolve this as quickly as possible."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-6">Production Timeline</h2>
              <StatusTimeline 
                timeline={order.timeline}
                currentStatus={order.status}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-4">Production Stage</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your carpet is currently in the following production stage:
              </p>
              
              <div className="bg-muted/30 p-4 rounded-md border">
                <StatusBadge status={order.status} size="lg" />
                <p className="mt-2 text-sm">
                  {order.status === "YARN_ISSUED" && "Raw materials have been selected and issued for production."}
                  {order.status === "DYEING" && "Your carpet's yarn is being dyed to match your color specifications."}
                  {order.status === "ISSUED_TO_SUPPLIER" && "Materials have been sent to our expert weavers to begin crafting your carpet."}
                  {order.status === "CARPET_RECEIVED" && "Your carpet has been received from our weavers and is now in our facility."}
                  {order.status === "FINISHING" && "Your carpet is receiving final touches, including edge finishing and quality control."}
                  {order.status === "EXPORTED" && "Your carpet has been shipped and is on its way to you."}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-2">Need Assistance?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your order, please contact your Tibet Carpet representative.
              </p>
              <Button className="w-full bg-tibet-red hover:bg-tibet-red/90" asChild>
                <a href="mailto:support@tibetcarpet.com">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Tibet Carpet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrderDetail;
