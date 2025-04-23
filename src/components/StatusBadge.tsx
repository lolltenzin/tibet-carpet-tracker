
import { OrderStatus } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import { Calendar, Package, Truck, Check, ArrowRight, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: OrderStatus;
  hasDelay?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, hasDelay = false, size = "md" }: StatusBadgeProps) {
  const { label, color } = getStatusDisplayInfo(status);
  
  const getStatusIcon = () => {
    switch (status) {
      case "YARN_ISSUED":
        return <Package className="h-3 w-3" />;
      case "DYEING":
        return <Calendar className="h-3 w-3" />;
      case "ISSUED_TO_SUPPLIER":
        return <ArrowRight className="h-3 w-3" />;
      case "CARPET_RECEIVED":
        return <Check className="h-3 w-3" />;
      case "FINISHING":
        return <Package className="h-3 w-3" />;
      case "EXPORTED":
        return <Truck className="h-3 w-3" />;
    }
  };
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm"
  };
  
  const baseClasses = "rounded-full font-medium flex items-center gap-1.5";
  
  const statusClasses = {
    YARN_ISSUED: "bg-blue-100 text-blue-800",
    DYEING: "bg-purple-100 text-purple-800",
    ISSUED_TO_SUPPLIER: "bg-yellow-100 text-yellow-800",
    CARPET_RECEIVED: "bg-green-100 text-green-800",
    FINISHING: "bg-tibet-gold/20 text-tibet-brown",
    EXPORTED: "bg-tibet-red/20 text-tibet-red"
  };

  const classes = `${baseClasses} ${statusClasses[status]} ${sizeClasses[size]} ${hasDelay ? "animate-pulse-slow" : ""}`;
  
  return (
    <span className={classes}>
      {hasDelay && <Clock className="h-3 w-3 mr-0.5" />}
      {getStatusIcon()}
      {label}
    </span>
  );
}
