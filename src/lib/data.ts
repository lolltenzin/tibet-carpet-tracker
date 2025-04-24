
import { Order, OrderStatus, ClientCode, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Status display information
export const getStatusDisplayInfo = (status: OrderStatus) => {
  const statusMap = {
    "ORDER_APPROVAL": { 
      label: "Order Approval", 
      color: "bg-slate-400",
      textColor: "text-slate-50"
    },
    "RENDERING": {
      label: "Rendering",
      color: "bg-sky-400",
      textColor: "text-sky-50"
    },
    "DYEING": {
      label: "Dyeing", 
      color: "bg-indigo-400",
      textColor: "text-indigo-50"
    },
    "DYEING_READY": {
      label: "Dyeing Ready", 
      color: "bg-violet-400",
      textColor: "text-violet-50"
    },
    "WAITING_FOR_LOOM": {
      label: "Waiting for Loom", 
      color: "bg-purple-400",
      textColor: "text-purple-50"
    },
    "ONLOOM": {
      label: "On Loom", 
      color: "bg-fuchsia-400",
      textColor: "text-fuchsia-50"
    },
    "ONLOOM_PROGRESS": {
      label: "On Loom Progress", 
      color: "bg-pink-400",
      textColor: "text-pink-50"
    },
    "OFFLOOM": {
      label: "Off Loom",
      color: "bg-rose-400",
      textColor: "text-rose-50"
    },
    "FINISHING": {
      label: "Finishing", 
      color: "bg-green-400",
      textColor: "text-green-50"
    },
    "DELIVERY_TIME": {
      label: "Ready for Delivery", 
      color: "bg-emerald-400",
      textColor: "text-emerald-50"
    },
    "FIRST_REVISED_DELIVERY_DATE": {
      label: "First Revised Date", 
      color: "bg-amber-400",
      textColor: "text-amber-50"
    },
    "SECOND_REVISED_DELIVERY_DATE": {
      label: "Second Revised Date", 
      color: "bg-red-400",
      textColor: "text-red-50"
    }
  };
  
  return statusMap[status] || {
    label: status,
    color: "bg-gray-400",
    textColor: "text-gray-50"
  };
};

// Validate user credentials (temporary mock function)
export const validateCredentials = (username: string, password: string): User | null => {
  // Mock data for demonstration
  const validUsers: Record<string, User> = {
    "client1": {
      id: "user1",
      username: "client1",
      clientCode: "TC",
      clientName: "Tibet Carpet",
      role: "client"
    },
    "client2": {
      id: "user2",
      username: "client2",
      clientCode: "LC",
      clientName: "Luxury Carpets",
      role: "client"
    }
  };

  // Simple validation
  if (validUsers[username] && password === "password") {
    return validUsers[username];
  }

  return null;
};

// Helper function to map database records to our Order type
const mapCarpetOrderToOrder = (record: any): Order => {
  // Map STATUS to one of our predefined statuses or default to ORDER_APPROVAL
  const status = record.STATUS as OrderStatus || "ORDER_APPROVAL";
  
  // Map client code from table or default to a default client
  const clientCode = record.clientCode as ClientCode || "TC";
  
  return {
    id: record.Carpetno,
    clientCode: clientCode,
    orderNumber: record.Carpetno,
    carpetName: record.Design || "Unnamed Design",
    dimensions: record.Size || "Unknown",
    status: status,
    hasDelay: false, // We can enhance this later based on delivery dates
    timeline: [
      { stage: "ORDER_APPROVAL", date: record["Order issued"] || new Date().toISOString(), completed: true },
      { stage: "FINISHING", date: record["Delivery Date"] || new Date().toISOString(), completed: false }
    ],
    estimatedCompletion: record["Delivery Date"] || undefined
  };
};

// Fetch all orders from Supabase
export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("CarpetOrder")
    .select("*");
    
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  
  return data.map(mapCarpetOrderToOrder);
};

// Fetch orders for a specific client
export const getOrdersByClient = async (clientCode: ClientCode): Promise<Order[]> => {
  // For now, we'll return all orders since the table might not have clientCode yet
  return getAllOrders();
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  const { data, error } = await supabase
    .from("CarpetOrder")
    .select("*")
    .eq("Carpetno", orderId)
    .single();
    
  if (error) {
    console.error("Error fetching order:", error);
    return undefined;
  }
  
  return mapCarpetOrderToOrder(data);
};
