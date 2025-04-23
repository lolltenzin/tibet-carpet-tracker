import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrdersByClient } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import { CheckCheck, Filter, Search } from "lucide-react";

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
  
  const clientOrders = user ? getOrdersByClient(user.clientCode) : [];
  
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Order Dashboard</h1>
          <p className="text-muted-foreground">
            Track the status of your carpets through the production process.
          </p>
        </div>
        
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
        
        {filteredOrders.length > 0 ? (
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
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || statusFilter !== "ALL" 
                ? "Try adjusting your search or filters" 
                : "You don't have any orders at the moment"}
            </p>
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
