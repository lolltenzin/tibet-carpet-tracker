
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStatusDisplayInfo, getOrdersByClient } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { Filter, Search, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [showCompletedOrders, setShowCompletedOrders] = useState(true);
  const { toast } = useToast();

  // List of all possible order statuses to use in the filter
  const allStatuses: Array<OrderStatus | "ALL"> = [
    "ALL",
    "ORDER_APPROVAL",
    "YARN_ISSUED",
    "RENDERING",
    "DYEING",
    "DYEING_READY",
    "WAITING_FOR_LOOM",
    "ONLOOM",
    "ONLOOM_PROGRESS",
    "OFFLOOM",
    "FINISHING",
    "DELIVERY_TIME",
    "FIRST_REVISED_DELIVERY_DATE",
    "SECOND_REVISED_DELIVERY_DATE"
  ];

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const fetchedOrders = await getOrdersByClient(user.clientCode);
      setOrders(fetchedOrders);
      
      if (fetchedOrders.length === 0) {
        toast({
          title: "No orders found",
          description: "No orders found for your account.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "There was a problem loading your orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.carpetName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    
    const isCompleted = ["DELIVERY_TIME", "FIRST_REVISED_DELIVERY_DATE", "SECOND_REVISED_DELIVERY_DATE"].includes(order.status);
    const matchesCompletion = showCompletedOrders || !isCompleted;
    
    return matchesSearch && matchesStatus && matchesCompletion;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOrders}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              type="search"
              placeholder="Search order number or carpet name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64"
            />
            
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="md:ml-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filterStatus === "ALL" ? "Filter by Status" : getStatusDisplayInfo(filterStatus as OrderStatus).label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {allStatuses.map((status) => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => setFilterStatus(status)}
                      className={filterStatus === status ? "bg-muted" : ""}
                    >
                      {status === "ALL" ? "All Statuses" : getStatusDisplayInfo(status as OrderStatus).label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <label className="inline-flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showCompletedOrders}
              onChange={(e) => setShowCompletedOrders(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show Completed Orders</span>
          </label>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-tibet-red" />
          </div>
        )}
        
        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== "ALL" 
                ? "No orders match your current filters. Try adjusting your search or filter criteria."
                : "We couldn't find any orders for your account."}
            </p>
            {(searchTerm || filterStatus !== "ALL") && (
              <Button onClick={() => {
                setSearchTerm("");
                setFilterStatus("ALL");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        {!isLoading && filteredOrders.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Tibet Carpet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
