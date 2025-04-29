
import { Order, OrderStatus, ClientCode, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Status display information
export const getStatusDisplayInfo = (status: OrderStatus) => {
  const statusMap = {
    "ORDER_APPROVAL": { 
      label: "Order Approval", 
      color: "bg-slate-400",
      textColor: "text-slate-50",
      description: "Order has been received and is awaiting approval"
    },
    "RENDERING": {
      label: "Rendering",
      color: "bg-sky-400",
      textColor: "text-sky-50",
      description: "Design is being rendered"
    },
    "DYEING": {
      label: "Dyeing", 
      color: "bg-indigo-400",
      textColor: "text-indigo-50",
      description: "Materials are being dyed to specification"
    },
    "DYEING_READY": {
      label: "Dyeing Ready", 
      color: "bg-violet-400",
      textColor: "text-violet-50",
      description: "Dyeing process is complete"
    },
    "WAITING_FOR_LOOM": {
      label: "Waiting for Loom", 
      color: "bg-purple-400",
      textColor: "text-purple-50",
      description: "Materials are ready and waiting for loom availability"
    },
    "ONLOOM": {
      label: "On Loom", 
      color: "bg-fuchsia-400",
      textColor: "text-fuchsia-50",
      description: "Carpet is being woven on the loom"
    },
    "ONLOOM_PROGRESS": {
      label: "On Loom Progress", 
      color: "bg-pink-400",
      textColor: "text-pink-50",
      description: "Weaving is in progress"
    },
    "OFFLOOM": {
      label: "Off Loom",
      color: "bg-rose-400",
      textColor: "text-rose-50",
      description: "Carpet has been removed from the loom"
    },
    "FINISHING": {
      label: "Finishing", 
      color: "bg-green-400",
      textColor: "text-green-50",
      description: "Final touches and quality control"
    },
    "DELIVERY_TIME": {
      label: "Ready for Delivery", 
      color: "bg-emerald-400",
      textColor: "text-emerald-50",
      description: "Carpet is ready to be delivered"
    },
    "FIRST_REVISED_DELIVERY_DATE": {
      label: "First Revised Date", 
      color: "bg-amber-400",
      textColor: "text-amber-50",
      description: "Delivery date has been revised once"
    },
    "SECOND_REVISED_DELIVERY_DATE": {
      label: "Second Revised Date", 
      color: "bg-red-400",
      textColor: "text-red-50",
      description: "Delivery date has been revised twice"
    }
  };
  
  return statusMap[status] || {
    label: status,
    color: "bg-gray-400",
    textColor: "text-gray-50",
    description: "Status information unavailable"
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
    },
    "WS": {
      id: "user3",
      username: "WS",
      clientCode: "WS",
      clientName: "WS Client",
      role: "client"
    }
  };

  // Simple validation - checking if WS with PASSWORD, otherwise use default logic
  if (username === "WS" && password === "PASSWORD") {
    return validUsers["WS"];
  } else if (validUsers[username] && password === "password") {
    return validUsers[username];
  }

  return null;
};

// Helper function to map database records to our Order type
const mapCarpetOrderToOrder = (record: any): Order => {
  console.log("Mapping record:", record); // Added debugging
  
  // Map STATUS to one of our predefined statuses or default to ORDER_APPROVAL
  const status = record.STATUS as OrderStatus || "ORDER_APPROVAL";
  
  // Map client code from table or default to a default client
  const clientCode = record.Buyercode as ClientCode || "WS"; // Changed default to WS
  
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
  
  console.log("All orders data:", data); // Added debugging
  return data.map(mapCarpetOrderToOrder);
};

// Fetch orders for a specific client
export const getOrdersByClient = async (clientCode: ClientCode): Promise<Order[]> => {
  console.log("Fetching orders for client code:", clientCode); // Added debugging
  
  // First try exact match
  let { data, error } = await supabase
    .from("CarpetOrder")
    .select("*")
    .eq("Buyercode", clientCode);
  
  if (error) {
    console.error("Error fetching orders for client:", error);
    return [];
  }
  
  console.log(`Found ${data?.length || 0} orders with exact match for Buyercode=${clientCode}`); // Added debugging
  
  // If no data found with exact match, try case insensitive match
  if (!data || data.length === 0) {
    console.log("Trying case insensitive match"); // Added debugging
    
    // Get all data and filter manually for case-insensitive match
    const { data: allData, error: allError } = await supabase
      .from("CarpetOrder")
      .select("*");
      
    if (allError) {
      console.error("Error fetching all orders:", allError);
      return [];
    }
    
    // Filter for case-insensitive match
    data = allData.filter(
      record => record.Buyercode && 
                record.Buyercode.toString().trim().toUpperCase() === clientCode.toUpperCase()
    );
    
    console.log(`Found ${data?.length || 0} orders with case-insensitive match`); // Added debugging
  }
  
  // If still no data, fetch all orders as fallback
  if (!data || data.length === 0) {
    console.log("No orders found for client, falling back to all orders"); // Added debugging
    return getAllOrders();
  }
  
  return data.map(mapCarpetOrderToOrder);
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
