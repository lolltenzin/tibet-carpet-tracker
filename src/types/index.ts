
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
  | 'BD';

// UPDATED STATUSES
export type OrderStatus = 
  | 'ORDER_APPROVAL'
  | 'RENDERING'
  | 'DYEING'
  | 'DYEING_READY'
  | 'WAITING_FOR_LOOM'
  | 'ONLOOM'
  | 'ONLOOM_PROGRESS'
  | 'OFFLOOM';

export interface User {
  id: string;
  username: string;
  clientCode: ClientCode;
  clientName: string;
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
