
import { Order, OrderStatus, ClientCode, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Status display information
export const getStatusDisplayInfo = (status: OrderStatus) => {
  const statusMap = {
    "ORDER_APPROVAL": { 
      label: "Order Approval", 
      color: "bg-slate-400",
      textColor: "text-slate-50",
      description: "Order has been received and is awaiting approval",
      order: 1
    },
    "YARN_ISSUED": { 
      label: "Yarn Issued", 
      color: "bg-emerald-400",
      textColor: "text-emerald-50",
      description: "Raw materials have been issued for production",
      order: 2
    },
    "RENDERING": {
      label: "Rendering",
      color: "bg-sky-400",
      textColor: "text-sky-50",
      description: "Design is being rendered",
      order: 3
    },
    "DYEING": {
      label: "Dyeing", 
      color: "bg-indigo-400",
      textColor: "text-indigo-50",
      description: "Materials are being dyed to specification",
      order: 4
    },
    "DYEING_READY": {
      label: "Dyeing Ready", 
      color: "bg-violet-400",
      textColor: "text-violet-50",
      description: "Dyeing process is complete",
      order: 5
    },
    "WAITING_FOR_LOOM": {
      label: "Waiting for Loom", 
      color: "bg-purple-400",
      textColor: "text-purple-50",
      description: "Materials are ready and waiting for loom availability",
      order: 6
    },
    "ONLOOM": {
      label: "On Loom", 
      color: "bg-fuchsia-400",
      textColor: "text-fuchsia-50",
      description: "Carpet is being woven on the loom",
      order: 7
    },
    "ONLOOM_PROGRESS": {
      label: "On Loom Progress", 
      color: "bg-pink-400",
      textColor: "text-pink-50",
      description: "Weaving is in progress",
      order: 8
    },
    "OFFLOOM": {
      label: "Off Loom",
      color: "bg-rose-400",
      textColor: "text-rose-50",
      description: "Carpet has been removed from the loom",
      order: 9
    },
    "FINISHING": {
      label: "Finishing", 
      color: "bg-green-400",
      textColor: "text-green-50",
      description: "Final touches and quality control",
      order: 10
    },
    "DELIVERY_TIME": {
      label: "Ready for Delivery", 
      color: "bg-emerald-400",
      textColor: "text-emerald-50",
      description: "Carpet is ready to be delivered",
      order: 11
    },
    "FIRST_REVISED_DELIVERY_DATE": {
      label: "First Revised Date", 
      color: "bg-amber-400",
      textColor: "text-amber-50",
      description: "Delivery date has been revised once",
      order: 12
    },
    "SECOND_REVISED_DELIVERY_DATE": {
      label: "Second Revised Date", 
      color: "bg-red-400",
      textColor: "text-red-50",
      description: "Delivery date has been revised twice",
      order: 13
    }
  };
  
  return statusMap[status] || {
    label: status,
    color: "bg-gray-400",
    textColor: "text-gray-50",
    description: "Status information unavailable",
    order: 99
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
    },
    "RM": {
      id: "user4",
      username: "RM",
      clientCode: "RM",
      clientName: "Royal Mats",
      role: "client"
    },
    "ADV": {
      id: "user5",
      username: "ADV",
      clientCode: "ADV",
      clientName: "Advance Designs",
      role: "client"
    },
    "HR": {
      id: "user6",
      username: "HR",
      clientCode: "HR",
      clientName: "Himalayan Rugs",
      role: "client"
    },
    "NB": {
      id: "user7",
      username: "NB",
      clientCode: "NB",
      clientName: "Noble Brands",
      role: "client"
    },
    "admin": {
      id: "admin1",
      username: "admin",
      clientCode: "TC",
      clientName: "System Administrator",
      role: "admin"
    }
  };

  // Simple validation - checking if WS with PASSWORD, otherwise use default logic
  if (username === "WS" && password === "PASSWORD") {
    return validUsers["WS"];
  } else if (username === "admin" && password === "admin123") {
    return validUsers["admin"];
  } else if (validUsers[username] && password === "password") {
    return validUsers[username];
  }

  return null;
};

// Helper function to normalize status from database
const normalizeStatus = (status: string): OrderStatus => {
  const normalized = status?.trim().toUpperCase().replace(/\s+/g, '_') || 'ORDER_APPROVAL';
  
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
  
  const currentStatusInfo = getStatusDisplayInfo(status);
  const currentOrder = currentStatusInfo.order;
  
  return allStatuses.map(stage => {
    const stageInfo = getStatusDisplayInfo(stage);
    const isCompleted = stageInfo.order <= currentOrder;
    
    let stageDate: string | undefined;
    
    if (stage === 'ORDER_APPROVAL' && orderIssuedDate) {
      stageDate = orderIssuedDate;
    } else if ((stage === 'DELIVERY_TIME' || stage === 'FINISHING') && deliveryDate) {
      stageDate = deliveryDate;
    } else if (isCompleted) {
      const today = new Date();
      const orderDate = orderIssuedDate ? new Date(orderIssuedDate) : new Date();
      const deliveryDateObj = deliveryDate ? new Date(deliveryDate) : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
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

// Helper function to map database records to our Order type
export const mapCarpetOrderToOrder = (record: any): Order => {
  console.log("Mapping record:", record);
  
  const status = normalizeStatus(record.STATUS || "ORDER_APPROVAL");
  const clientCode = record.Buyercode as ClientCode || "WS";
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

// Fetch all orders from Supabase
export const getAllOrders = async (): Promise<Order[]> => {
  console.log("Fetching all orders");
  
  try {
    const { data, error } = await supabase
      .from("CarpetOrder")
      .select("*");
      
    if (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
    
    console.log("All orders data:", data);
    
    if (!data || data.length === 0) {
      console.log("No orders found in the database.");
      return [];
    }
    
    return data.map(mapCarpetOrderToOrder);
  } catch (error) {
    console.error("Exception in getAllOrders:", error);
    return [];
  }
};

// Fetch orders for a specific client
export const getOrdersByClient = async (clientCode: ClientCode): Promise<Order[]> => {
  console.log("Fetching orders for client code:", clientCode);
  
  try {
    const { data, error } = await supabase
      .from("CarpetOrder")
      .select("*")
      .eq("Buyercode", clientCode);
    
    if (error) {
      console.error("Error fetching orders for client:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} orders for Buyercode=${clientCode}`);
    
    if (!data || data.length === 0) {
      console.log("No orders found with exact match, trying case insensitive match");
      
      const { data: allData, error: allError } = await supabase
        .from("CarpetOrder")
        .select("*");
        
      if (allError) {
        console.error("Error fetching all orders:", allError);
        return [];
      }
      
      const matchingData = allData.filter(
        record => record.Buyercode && 
                  record.Buyercode.toString().trim().toUpperCase() === clientCode.toUpperCase()
      );
      
      console.log(`Found ${matchingData?.length || 0} orders with case-insensitive match`);
      
      if (matchingData.length > 0) {
        return matchingData.map(mapCarpetOrderToOrder);
      }
      
      return [];
    }
    
    return data.map(mapCarpetOrderToOrder);
  } catch (error) {
    console.error("Exception in getOrdersByClient:", error);
    return [];
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  try {
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
  } catch (error) {
    console.error("Exception in getOrderById:", error);
    return undefined;
  }
};
