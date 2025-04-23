
import { ClientCode, Order, User, OrderStatus } from "@/types";

export const USERS: User[] = [
  { id: "1", username: "ws_client", clientCode: "WS", clientName: "Washington Studios" },
  { id: "2", username: "ld_client", clientCode: "LD", clientName: "London Designs" },
  { id: "3", username: "hr_client", clientCode: "HR", clientName: "Himalayan Rugs" },
  { id: "4", username: "demo", clientCode: "RM", clientName: "Royal Mountain" }
];

const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

const createOrderTimeline = (status: Order['status']): Order['timeline'] => {
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);
  
  const statuses: Order['status'][] = [
    'YARN_ISSUED',
    'DYEING',
    'ISSUED_TO_SUPPLIER',
    'CARPET_RECEIVED',
    'FINISHING',
    'EXPORTED'
  ];
  
  const currentStatusIndex = statuses.indexOf(status);
  
  return statuses.map((stage, index) => {
    if (index <= currentStatusIndex) {
      return {
        stage,
        date: getRandomDate(twoWeeksAgo, now),
        completed: true
      };
    } else {
      return {
        stage,
        date: "",
        completed: false
      };
    }
  });
};

export const ORDERS: Order[] = [
  {
    id: "1",
    clientCode: "WS",
    orderNumber: "WS-2024-001",
    carpetName: "Himalayan Bloom",
    dimensions: "8' x 10'",
    status: "DYEING",
    hasDelay: false,
    timeline: createOrderTimeline("DYEING"),
    estimatedCompletion: "2024-06-15"
  },
  {
    id: "2",
    clientCode: "WS",
    orderNumber: "WS-2024-002",
    carpetName: "Mountain Stream",
    dimensions: "6' x 9'",
    status: "YARN_ISSUED",
    hasDelay: true,
    delayReason: "Waiting for special silk yarn import",
    timeline: createOrderTimeline("YARN_ISSUED"),
    estimatedCompletion: "2024-07-20"
  },
  {
    id: "3",
    clientCode: "LD",
    orderNumber: "LD-2024-001",
    carpetName: "Royal Palace",
    dimensions: "12' x 15'",
    status: "FINISHING",
    hasDelay: false,
    timeline: createOrderTimeline("FINISHING"),
    estimatedCompletion: "2024-05-30"
  },
  {
    id: "4",
    clientCode: "LD",
    orderNumber: "LD-2024-002",
    carpetName: "Urban Grid",
    dimensions: "9' x 12'",
    status: "ISSUED_TO_SUPPLIER",
    hasDelay: false,
    timeline: createOrderTimeline("ISSUED_TO_SUPPLIER"),
    estimatedCompletion: "2024-06-30"
  },
  {
    id: "5",
    clientCode: "HR",
    orderNumber: "HR-2024-001",
    carpetName: "Classic Mandala",
    dimensions: "10' x 10'",
    status: "CARPET_RECEIVED",
    hasDelay: true,
    delayReason: "Pattern adjustment required",
    timeline: createOrderTimeline("CARPET_RECEIVED"),
    estimatedCompletion: "2024-06-10"
  },
  {
    id: "6",
    clientCode: "RM",
    orderNumber: "RM-2024-001",
    carpetName: "Tibetan Clouds",
    dimensions: "8' x 10'",
    status: "EXPORTED",
    hasDelay: false,
    timeline: createOrderTimeline("EXPORTED"),
    estimatedCompletion: "2024-04-15"
  },
  {
    id: "7",
    clientCode: "RM",
    orderNumber: "RM-2024-002",
    carpetName: "Mountain Peaks",
    dimensions: "6' x 9'",
    status: "FINISHING",
    hasDelay: false,
    timeline: createOrderTimeline("FINISHING"),
    estimatedCompletion: "2024-05-25"
  },
  {
    id: "8",
    clientCode: "RM",
    orderNumber: "RM-2024-003",
    carpetName: "Valley Sunset",
    dimensions: "9' x 12'",
    status: "DYEING",
    hasDelay: true,
    delayReason: "Special color blend development",
    timeline: createOrderTimeline("DYEING"),
    estimatedCompletion: "2024-07-05"
  }
];

export const getUser = (username: string): User | undefined => {
  return USERS.find(user => user.username === username);
};

export const validateCredentials = (username: string, password: string): User | null => {
  // In a real app, you would validate against a secure database
  // For demo purposes, we're accepting any password that matches the pattern "<username>_pass"
  const expectedPassword = `${username}_pass`;
  if (password === expectedPassword) {
    return getUser(username) || null;
  }
  return null;
};

export const getOrdersByClient = (clientCode: ClientCode): Order[] => {
  return ORDERS.filter(order => order.clientCode === clientCode);
};

export const getOrderById = (orderId: string): Order | undefined => {
  return ORDERS.find(order => order.id === orderId);
};

export const getStatusDisplayInfo = (status: OrderStatus): { label: string, color: string, description: string } => {
  switch (status) {
    case 'YARN_ISSUED':
      return { 
        label: "Yarn Issued", 
        color: "blue", 
        description: "Raw materials have been selected and issued for production." 
      };
    case 'DYEING':
      return { 
        label: "Dyeing", 
        color: "purple", 
        description: "Yarn is being dyed according to the color specifications." 
      };
    case 'ISSUED_TO_SUPPLIER':
      return { 
        label: "Issued to Supplier", 
        color: "yellow", 
        description: "Materials have been sent to the weaving facility." 
      };
    case 'CARPET_RECEIVED':
      return { 
        label: "Carpet Received", 
        color: "green", 
        description: "The woven carpet has been received from the supplier." 
      };
    case 'FINISHING':
      return { 
        label: "Finishing", 
        color: "gold", 
        description: "The carpet is undergoing final finishing touches." 
      };
    case 'EXPORTED':
      return { 
        label: "Exported", 
        color: "red", 
        description: "The carpet has been shipped and is on its way to you." 
      };
  }
};
