
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStatusDisplayInfo } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { CheckCheck, Filter, Search, Loader2, AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
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
  const [showDebug, setShowDebug] = useState(false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const { toast } = useToast();

  // List of all possible order statuses to use in the filter
  const allStatuses: Array<OrderStatus | "ALL"> = [
    "ALL",
    "ORDER_APPROVAL",
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

  // Function to check database connection
  const checkDbConnection = async () => {
    setDbConnectionStatus('checking');
    try {
      const { data, error } = await supabase.from('CarpetOrder').select('count()', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database connection error:", error);
        setDbConnectionStatus('error');
        toast({
          title: "Database connection error",
          description: `${error.message}. Please check RLS policies and authentication.`,
          variant: "destructive"
        });
      } else {
        console.log("Database connected successfully");
        setDbConnectionStatus('connected');
      }
    } catch (error) {
      console.error("Exception checking DB connection:", error);
      setDbConnectionStatus('error');
      toast({
        title: "Database connection failed",
        description: "Could not connect to database. Please check your network connection.",
        variant: "destructive"
      });
    }
  };

  // Fetch raw records for debugging
  const fetchRawRecords = async () => {
    try {
      // First check if connected
      if (dbConnectionStatus !== 'connected') {
        await checkDbConnection();
        if (dbConnectionStatus === 'error') {
          console.error("Cannot fetch raw records due to connection issues");
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('CarpetOrder')
        .select('*');
      
      if (error) {
        console.error("Error fetching raw records:", error);
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setRawRecords(data || []);
        console.log("Raw records:", data);
      }
    } catch (error) {
      console.error("Exception fetching raw records:", error);
    }
  };
  
  // Helper function to map database records to our Order type
  const mapCarpetOrderToOrder = (record: any): Order => {
    console.log("Mapping record:", record);
    
    // Map STATUS to one of our predefined statuses with normalization
    const normalizeStatus = (status: string): OrderStatus => {
      // Convert to uppercase and replace spaces with underscores
      const normalized = status?.trim().toUpperCase().replace(/\s+/g, '_') || 'ORDER_APPROVAL';
      
      // Map common variations to our defined OrderStatus types
      const statusMap: Record<string, OrderStatus> = {
        'ORDER_APPROVAL': 'ORDER_APPROVAL',
        'ORDER_ISSUED': 'ORDER_APPROVAL',
        'YARN_ISSUED': 'YARN_ISSUED',
        'RENDERING': 'RENDERING',
        'DYEING': 'DYEING',
        'DYEING_READY': 'DYEING_READY',
        'WAITING_FOR_LOOM': 'WAITING_FOR_LOOM',
        'ONLOOM': 'ONLOOM',
        'ONLOOM_PROGRESS': 'ONLOOM_PROGRESS',
        'OFFLOOM': 'OFFLOOM',
        'FINISHING': 'FINISHING',
        'DELIVERY_TIME': 'DELIVERY_TIME',
        'DELIVERY': 'DELIVERY_TIME',
        'FIRST_REVISED_DELIVERY_DATE': 'FIRST_REVISED_DELIVERY_DATE',
        'SECOND_REVISED_DELIVERY_DATE': 'SECOND_REVISED_DELIVERY_DATE'
      };
      
      return statusMap[normalized] || 'ORDER_APPROVAL';
    };
    
    // Build timeline based on current status
    const buildOrderTimeline = (status: OrderStatus, orderIssuedDate?: string, deliveryDate?: string): Order['timeline'] => {
      // Define the order of statuses for the timeline display
      const allStatuses: OrderStatus[] = [
        'ORDER_APPROVAL',
        'YARN_ISSUED',
        'DYEING',
        'DYEING_READY',
        'ONLOOM',
        'OFFLOOM',
        'FINISHING',
        'DELIVERY_TIME'
      ];
      
      // Get the index of the current status in our sequence
      const currentStatusInfo = getStatusDisplayInfo(status);
      const currentOrder = currentStatusInfo.order;
      
      // Build timeline with completion status based on the current status
      return allStatuses.map(stage => {
        const stageInfo = getStatusDisplayInfo(stage);
        const isCompleted = stageInfo.order <= currentOrder;
        
        // Determine the date for this stage
        let stageDate: string | undefined;
        
        if (stage === 'ORDER_APPROVAL' && orderIssuedDate) {
          stageDate = orderIssuedDate;
        } else if ((stage === 'DELIVERY_TIME' || stage === 'FINISHING') && deliveryDate) {
          stageDate = deliveryDate;
        } else if (isCompleted) {
          // For completed stages without specific dates, use estimated dates based on progress
          const today = new Date();
          const orderDate = orderIssuedDate ? new Date(orderIssuedDate) : new Date();
          const deliveryDateObj = deliveryDate ? new Date(deliveryDate) : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          // Calculate a date between order and delivery based on the stage's position
          const totalDuration = deliveryDateObj.getTime() - orderDate.getTime();
          const stagePosition = allStatuses.indexOf(stage) / (allStatuses.length - 1);
          const estimatedTime = orderDate.getTime() + (totalDuration * stagePosition);
          
          stageDate = new Date(estimatedTime).toISOString();
        }
        
        return {
          stage,
          date: stageDate,
          completed: isCompleted
        };
      });
    };
    
    const status = normalizeStatus(record.STATUS || "ORDER_APPROVAL");
    const clientCode = record.Buyercode || "WS";
    const timeline = buildOrderTimeline(status, record["Order issued"], record["Delivery Date"]);
    
    return {
      id: record.Carpetno,
      clientCode: clientCode,
      orderNumber: record.Carpetno,
      carpetName: record.Design || "Unnamed Design",
      dimensions: record.Size || "Unknown",
      status: status,
      hasDelay: false,
      timeline: timeline,
      estimatedCompletion: record["Delivery Date"] || undefined
    };
  };
  
  const fetchOrders = async () => {
    setIsLoading(true);
    await checkDbConnection();
    
    try {
      let fetchedOrders: Order[] = [];
      
      // Only proceed if we have a successful database connection
      if (dbConnectionStatus === 'error') {
        throw new Error("Cannot fetch orders due to database connection issues");
      }
      
      const { data, error } = await supabase
        .from('CarpetOrder')
        .select('*');

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("Found orders:", data);
        fetchedOrders = data.map(record => mapCarpetOrderToOrder(record));
      } else {
        console.log("No orders found in database");
        
        // Create a sample order if none exist
        const sampleOrder = {
          id: `SAMPLE-${user?.clientCode || 'WS'}-001`,
          clientCode: user?.clientCode || 'WS',
          orderNumber: `SAMPLE-${user?.clientCode || 'WS'}-001`,
          carpetName: "Sample Carpet",
          dimensions: "8x10",
          status: "ORDER_APPROVAL" as OrderStatus,
          hasDelay: false,
          timeline: [
            { stage: "ORDER_APPROVAL" as OrderStatus, date: new Date().toISOString(), completed: true },
            { stage: "RENDERING" as OrderStatus, date: undefined, completed: false },
            { stage: "FINISHING" as OrderStatus, date: undefined, completed: false }
          ],
          estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        fetchedOrders = [sampleOrder];
        
        toast({
          title: "No orders found",
          description: "Sample data is being shown for demonstration purposes.",
          variant: "default"
        });
      }
      
      // Debug mode for seeing raw records
      if (showDebug) {
        await fetchRawRecords();
      }

      setOrders(fetchedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: error.message || "There was a problem loading your orders. Please try again.",
        variant: "destructive"
      });
      
      // Generate sample data as a fallback
      setOrders([{
        id: `SAMPLE-${user?.clientCode || 'WS'}-001`,
        clientCode: user?.clientCode || 'WS',
        orderNumber: `SAMPLE-${user?.clientCode || 'WS'}-001`,
        carpetName: "Sample Carpet",
        dimensions: "8x10",
        status: "ORDER_APPROVAL",
        hasDelay: false,
        timeline: [
          { stage: "ORDER_APPROVAL", date: new Date().toISOString(), completed: true },
          { stage: "RENDERING", date: undefined, completed: false },
          { stage: "FINISHING", date: undefined, completed: false }
        ],
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (showDebug) {
      fetchRawRecords();
    }
  }, [showDebug]);

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
        {/* Debug Tools */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button 
              variant={showDebug ? "default" : "outline"} 
              size="sm" 
              onClick={() => {
                setShowDebug(!showDebug);
              }}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {showDebug ? "Hide Debug" : "Debug View"}
            </Button>
          </div>
        </div>
        
        {/* Database Connection Status (Debug) */}
        {showDebug && (
          <div className="mb-6 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold mb-2">Database Connection Status</h3>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  dbConnectionStatus === 'connected' ? 'bg-green-500' : 
                  dbConnectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} 
              />
              <span>{
                dbConnectionStatus === 'connected' ? 'Connected to Database' : 
                dbConnectionStatus === 'error' ? 'Connection Error' : 'Checking Connection...'
              }</span>
            </div>
            
            {dbConnectionStatus === 'error' && (
              <div className="mt-2 text-sm p-2 bg-red-50 border border-red-200 rounded text-red-800">
                <p>Troubleshooting Tips:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Check if RLS policies are correctly set up</li>
                  <li>Verify your Supabase connection settings</li>
                  <li>Make sure you're authenticated properly</li>
                </ul>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Authentication Status</h4>
              <div className="mb-2">
                <strong>User:</strong> {user ? `${user.clientName} (${user.clientCode})` : 'Not logged in'}
              </div>
              <div className="mb-2">
                <strong>Role:</strong> {user?.role || 'None'}
              </div>
              <div className="mb-2">
                <strong>Auth System:</strong> Local Storage (Mock Authentication)
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Raw Records ({rawRecords.length})</h4>
              {rawRecords.length > 0 ? (
                <div className="overflow-auto max-h-64 border rounded">
                  <pre className="p-2 text-xs">{JSON.stringify(rawRecords, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No raw records found in database.</p>
              )}
            </div>
          </div>
        )}
        
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
