
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{order.orderNumber}</h3>
          <StatusBadge status={order.status} hasDelay={order.hasDelay} />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-lg font-semibold">{order.carpetName}</p>
          <p className="text-sm text-muted-foreground">{order.dimensions}</p>
        </div>
        
        {order.hasDelay && (
          <div className="bg-red-50 p-3 rounded-md border border-red-100 flex gap-2">
            <Clock className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">
              {order.delayReason || "There is a potential delay with this order."}
            </p>
          </div>
        )}
        
        {order.estimatedCompletion && (
          <div className="text-sm">
            <span className="text-muted-foreground">Estimated completion:</span>{" "}
            <span className="font-medium">{new Date(order.estimatedCompletion).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Link 
          to={`/orders/${order.id}`}
          className="text-sm font-medium text-tibet-red flex items-center hover:underline"
        >
          View Details
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
