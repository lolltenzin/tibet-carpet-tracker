import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getOrdersByClient, getAllOrders } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import { CheckCheck, Filter, Search, Loader2, AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

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

  // Function to check database connection
  const checkDbConnection = async () => {
    setDbConnectionStatus('checking');
    try {
      const { data, error } = await supabase.from('CarpetOrder').select('count()', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database connection error:", error);
        setDbConnectionStatus('error');
      } else {
        console.log("Database connected successfully");
        setDbConnectionStatus('connected');
      }
    } catch (error) {
      console.error("Exception checking DB connection:", error);
      setDbConnectionStatus('error');
    }
  };

  // Fetch raw records for debugging
  const fetchRawRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('CarpetOrder')
        .select('*');
      
      if (error) {
        console.error("Error fetching raw records:", error);
      } else {
        setRawRecords(data || []);
        console.log("Raw records:", data);
      }
    } catch (error) {
      console.error("Exception fetching raw records:", error);
    }
  };
  
  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    checkDbConnection();
    
    try {
      let fetchedOrders: Order[];
      
      if (user.role === "admin") {
        fetchedOrders = await getAllOrders();
      } else {
        fetchedOrders = await getOrdersByClient(user.clientCode);
      }
      
      if (showDebug) {
        await fetchRawRecords();
      }

      setOrders(fetchedOrders);
      
      if (fetchedOrders.length === 0) {
        toast({
          title: "No orders found",
          description: "We couldn't find any orders for your account. Sample data will be shown instead.",
          variant: "default"
        });
      }
    } catch (error) {
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
                if (!showDebug) {
                  fetchRawRecords();
                }
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
              <Button variant="outline" className="md:ml-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Status
              </Button>
              {/* Implement a dropdown or popover for status filtering here */}
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
