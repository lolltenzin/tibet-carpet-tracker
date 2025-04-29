
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrdersByClient, getAllOrders } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import { CheckCheck, Filter, Search, Loader2, AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const STATUS_LIST: OrderStatus[] = [
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

const Dashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const { toast } = useToast();
  const [showDebugView, setShowDebugView] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const fetchOrders = async () => {
    setIsLoading(true);
    setDebugInfo(null);
    
    try {
      if (user) {
        console.log("Current user:", user);
        setDebugInfo(`Fetching orders for client: ${user.clientCode}`);
        
        // Get raw records for debugging
        const { data: rawData } = await supabase
          .from("CarpetOrder")
          .select("*")
          .limit(10);
        
        setRawRecords(rawData || []);
        setDatabaseStatus(rawData !== null ? 'connected' : 'error');
        
        const orders = await getOrdersByClient(user.clientCode);
        setClientOrders(orders);
        
        if (orders.length === 0) {
          setDebugInfo(`No orders found for client code: ${user.clientCode}. Please check your database.`);
        } else {
          setDebugInfo(`Found ${orders.length} orders for client code: ${user.clientCode}`);
          setTimeout(() => setDebugInfo(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setDebugInfo(`Error loading orders: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error loading orders",
        description: "Unable to load your orders. Please try again later.",
        variant: "destructive"
      });
      setDatabaseStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, toast]);
  
  const filteredOrders = clientOrders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.carpetName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const statusCounts = clientOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);
  
  const totalOrders = clientOrders.length;
  const ordersWithDelay = clientOrders.filter(order => order.hasDelay).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order Dashboard</h1>
            <p className="text-muted-foreground">
              Track the status of your carpets through the production process.
            </p>
          </div>
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
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebugView(!showDebugView)}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {showDebugView ? "Hide Debug View" : "Show Debug View"}
            </Button>
          </div>
        </div>
        
        {debugInfo && (
          <div className="mt-2 mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            {debugInfo}
          </div>
        )}
        
        {databaseStatus === 'error' && (
          <div className="mt-2 mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Database connection issue detected. Please check your Supabase connection and permissions.
          </div>
        )}
        
        {showDebugView && (
          <div className="mb-6 border rounded-md overflow-hidden">
            <div className="bg-muted p-3 font-medium">Database Debug View</div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">User Info:</h3>
                <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Database Connection Status:</h3>
                <div className={`px-2 py-1 rounded inline-flex items-center ${
                  databaseStatus === 'connected' ? 'bg-green-100 text-green-800' :
                  databaseStatus === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    databaseStatus === 'connected' ? 'bg-green-500' :
                    databaseStatus === 'error' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></span>
                  {databaseStatus === 'connected' ? 'Connected' :
                   databaseStatus === 'error' ? 'Error' : 'Unknown'}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Raw CarpetOrder Records (First 10):</h3>
                {rawRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Carpetno</TableHead>
                          <TableHead>Buyercode</TableHead>
                          <TableHead>Design</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>Order issued</TableHead>
                          <TableHead>Delivery Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rawRecords.map((record, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{record.Carpetno || 'N/A'}</TableCell>
                            <TableCell className={record.Buyercode === user?.clientCode ? 'bg-green-100' : ''}>
                              {record.Buyercode || 'N/A'}
                            </TableCell>
                            <TableCell>{record.Design || 'N/A'}</TableCell>
                            <TableCell>{record.Size || 'N/A'}</TableCell>
                            <TableCell>{record.STATUS || 'N/A'}</TableCell>
                            <TableCell>{record["Order issued"] || 'N/A'}</TableCell>
                            <TableCell>{record["Delivery Date"] || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">No records found in CarpetOrder table!</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Database Troubleshooting:</h3>
                <div className="bg-slate-50 p-3 rounded text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure your CarpetOrder table exists in Supabase</li>
                    <li>Check that <strong>Buyercode column exists</strong> and contains records with value "WS"</li>
                    <li>Verify that <strong>Carpetno column exists</strong> and has values (this is used as the order ID)</li>
                    <li>Ensure proper permissions are set for anonymous access to the CarpetOrder table</li>
                    <li>If database issues persist, the app will use sample data as a fallback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-tibet-red" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-tibet-red/10 p-2 rounded-full">
                  <CheckCheck className="h-5 w-5 text-tibet-red" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders with Delays</p>
                  <p className="text-2xl font-bold">{ordersWithDelay}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Finished</p>
                  <p className="text-2xl font-bold">{statusCounts["FINISHING"] || 0}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Production</p>
                  <p className="text-2xl font-bold">
                    {totalOrders - (statusCounts["FINISHING"] || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button
                  variant={statusFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ALL")}
                  className={statusFilter === "ALL" ? "bg-tibet-red hover:bg-tibet-red/90" : ""}
                >
                  All
                </Button>
                
                {STATUS_LIST.map((status) => {
                  const { label } = getStatusDisplayInfo(status);
                  return (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? "bg-tibet-red hover:bg-tibet-red/90" : ""}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {clientOrders.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-orange-50 border-orange-200">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium">No Orders Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  We couldn't find any orders for client code: <strong>{user?.clientCode}</strong>
                </p>
                <div className="mt-4 text-sm text-slate-600 p-4 bg-slate-50 rounded-md max-w-md mx-auto">
                  <p className="font-bold">Troubleshooting Tips:</p>
                  <ul className="mt-2 list-disc text-left pl-5">
                    <li>Check that you have records in the CarpetOrder table</li>
                    <li>Verify that the Buyercode column <strong>exactly equals "WS"</strong> (case sensitive, no spaces)</li>
                    <li>Make sure the records have values for Carpetno and other required fields</li>
                    <li>Try toggling "Show Debug View" to see your raw database records</li>
                    <li>Refresh the page and check the debug output for more information</li>
                  </ul>
                </div>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No matching orders found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Tibet Carpet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
