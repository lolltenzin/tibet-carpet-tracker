
// Update OrderStatus to match the requested statuses!
export type ClientCode = 
  | 'WS'
  | 'LD'
  | 'HR'
  | 'RM'
  | 'WAYNE'
  | 'HNS'
  | 'DR'
  | 'TC'
  | 'DAVID'
  | 'JDP'
  | 'NR'
  | 'MM'
  | 'CLX'
  | 'RGD'
  | 'NB'
  | 'ADV'
  | 'BD'
  | 'LC';  // Added 'LC' to support Luxury Carpets client

export type OrderStatus = 
  | 'ORDER_APPROVAL'
  | 'YARN_ISSUED'
  | 'RENDERING'
  | 'DYEING'
  | 'DYEING_READY'
  | 'WAITING_FOR_LOOM'
  | 'ONLOOM'
  | 'ONLOOM_PROGRESS'
  | 'OFFLOOM'
  | 'FINISHING'
  | 'DELIVERY_TIME'
  | 'FIRST_REVISED_DELIVERY_DATE'
  | 'SECOND_REVISED_DELIVERY_DATE';

export interface User {
  id: string;
  username: string;
  clientCode: ClientCode;
  clientName: string;
  role: string;
}

export interface Order {
  id: string;
  clientCode: ClientCode;
  orderNumber: string;
  carpetName: string;
  dimensions: string;
  status: OrderStatus;
  hasDelay: boolean;
  delayReason?: string;
  timeline: {
    stage: OrderStatus;
    date: string;
    completed: boolean;
  }[];
  estimatedCompletion?: string;
}
