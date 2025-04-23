
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

export type OrderStatus = 
  | 'YARN_ISSUED'
  | 'DYEING'
  | 'ISSUED_TO_SUPPLIER'
  | 'CARPET_RECEIVED'
  | 'FINISHING'
  | 'EXPORTED';

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
