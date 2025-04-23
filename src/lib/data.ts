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
  
  const statuses: OrderStatus[] = [
    'ORDER_APPROVAL',
    'RENDERING',
    'DYEING',
    'DYEING_READY',
    'WAITING_FOR_LOOM',
    'ONLOOM',
    'ONLOOM_PROGRESS',
    'OFFLOOM'
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
    status: "ORDER_APPROVAL",
    hasDelay: true,
    delayReason: "Waiting for order approval",
    timeline: createOrderTimeline("ORDER_APPROVAL"),
    estimatedCompletion: "2024-07-20"
  },
  {
    id: "3",
    clientCode: "LD",
    orderNumber: "LD-2024-001",
    carpetName: "Royal Palace",
    dimensions: "12' x 15'",
    status: "ONLOOM_PROGRESS",
    hasDelay: false,
    timeline: createOrderTimeline("ONLOOM_PROGRESS"),
    estimatedCompletion: "2024-05-30"
  },
  {
    id: "4",
    clientCode: "LD",
    orderNumber: "LD-2024-002",
    carpetName: "Urban Grid",
    dimensions: "9' x 12'",
    status: "WAITING_FOR_LOOM",
    hasDelay: false,
    timeline: createOrderTimeline("WAITING_FOR_LOOM"),
    estimatedCompletion: "2024-06-30"
  },
  {
    id: "5",
    clientCode: "HR",
    orderNumber: "HR-2024-001",
    carpetName: "Classic Mandala",
    dimensions: "10' x 10'",
    status: "RENDERING",
    hasDelay: true,
    delayReason: "Pattern adjustment required",
    timeline: createOrderTimeline("RENDERING"),
    estimatedCompletion: "2024-06-10"
  },
  {
    id: "6",
    clientCode: "RM",
    orderNumber: "RM-2024-001",
    carpetName: "Tibetan Clouds",
    dimensions: "8' x 10'",
    status: "OFFLOOM",
    hasDelay: false,
    timeline: createOrderTimeline("OFFLOOM"),
    estimatedCompletion: "2024-04-15"
  },
  {
    id: "7",
    clientCode: "RM",
    orderNumber: "RM-2024-002",
    carpetName: "Mountain Peaks",
    dimensions: "6' x 9'",
    status: "ONLOOM",
    hasDelay: false,
    timeline: createOrderTimeline("ONLOOM"),
    estimatedCompletion: "2024-05-25"
  },
  {
    id: "8",
    clientCode: "RM",
    orderNumber: "RM-2024-003",
    carpetName: "Valley Sunset",
    dimensions: "9' x 12'",
    status: "DYEING_READY",
    hasDelay: true,
    delayReason: "Special color blend development",
    timeline: createOrderTimeline("DYEING_READY"),
    estimatedCompletion: "2024-07-05"
  }
];

export const getUser = (username: string): User | undefined => {
  return USERS.find(user => user.username === username);
};

export const validateCredentials = (username: string, password: string): User | null => {
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

export const getStatusDisplayInfo = (
  status: OrderStatus
): { label: string; color: string; description: string } => {
  switch (status) {
    case 'ORDER_APPROVAL':
      return {
        label: "Order Approval",
        color: "blue",
        description: "Awaiting approval for your order."
      };
    case 'RENDERING':
      return {
        label: "Rendering",
        color: "purple",
        description: "Design artwork/rendering is being prepared."
      };
    case 'DYEING':
      return {
        label: "Dyeing",
        color: "sky",
        description: "Yarn is being dyed specifically for your carpet."
      };
    case 'DYEING_READY':
      return {
        label: "Dyeing Ready",
        color: "indigo",
        description: "Dyed yarn is ready for further processing."
      };
    case 'WAITING_FOR_LOOM':
      return {
        label: "Waiting for Loom",
        color: "amber",
        description: "Waiting for loom allocation to start weaving."
      };
    case 'ONLOOM':
      return {
        label: "Onloom",
        color: "green",
        description: "Your carpet is being woven on the loom."
      };
    case 'ONLOOM_PROGRESS':
      return {
        label: "Onloom Progress",
        color: "teal",
        description: "Woven carpet is under progress (in production)."
      };
    case 'OFFLOOM':
      return {
        label: "Offloom",
        color: "red",
        description: "Carpet has come off the loom for finishing."
      };
    default:
      return {
        label: "Unknown",
        color: "gray",
        description: "Status not available."
      };
  }
};
