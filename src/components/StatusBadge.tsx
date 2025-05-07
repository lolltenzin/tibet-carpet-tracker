
import { OrderStatus } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import {
  Check,                // For Order Approval, Finishing
  Layers,               // For Rendering
  Droplet,              // For Dyeing, Dyeing Ready
  Hourglass,            // For Waiting for Loom
  Circle,               // For Onloom, Onloom Progress, Offloom
  Truck,                // For Delivery Time
  Calendar,             // For First/Second Revised Delivery Date
  Clock,                // For delays
  Package               // For Yarn Issued
} from "lucide-react";

interface StatusBadgeProps {
  status: OrderStatus;
  hasDelay?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, hasDelay = false, size = "md" }: StatusBadgeProps) {
  const { label } = getStatusDisplayInfo(status);

  // Map status to the right icon
  const getStatusIcon = () => {
    switch (status) {
      case "ORDER_APPROVAL":
        return <Check className="h-3 w-3" />;
      case "YARN_ISSUED":
        return <Package className="h-3 w-3" />;
      case "RENDERING":
        return <Layers className="h-3 w-3" />;
      case "DYEING":
      case "DYEING_READY":
        return <Droplet className="h-3 w-3" />;
      case "WAITING_FOR_LOOM":
        return <Hourglass className="h-3 w-3" />;
      case "ONLOOM":
      case "ONLOOM_PROGRESS":
      case "OFFLOOM":
        return <Circle className="h-3 w-3" />;
      case "FINISHING":
        return <Check className="h-3 w-3" />;
      case "DELIVERY_TIME":
        return <Truck className="h-3 w-3" />;
      case "FIRST_REVISED_DELIVERY_DATE":
      case "SECOND_REVISED_DELIVERY_DATE":
        return <Calendar className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Color classes - you can adjust shades to match your design
  const statusClasses: Record<OrderStatus, string> = {
    ORDER_APPROVAL: "bg-blue-100 text-blue-800",
    YARN_ISSUED: "bg-emerald-100 text-emerald-800",
    RENDERING: "bg-purple-100 text-purple-800",
    DYEING: "bg-sky-100 text-sky-800",
    DYEING_READY: "bg-indigo-100 text-indigo-800",
    WAITING_FOR_LOOM: "bg-amber-100 text-amber-800",
    ONLOOM: "bg-green-100 text-green-800",
    ONLOOM_PROGRESS: "bg-teal-100 text-teal-800",
    OFFLOOM: "bg-red-100 text-red-800",
    FINISHING: "bg-yellow-100 text-yellow-800",
    DELIVERY_TIME: "bg-pink-100 text-pink-800",
    FIRST_REVISED_DELIVERY_DATE: "bg-cyan-100 text-cyan-800",
    SECOND_REVISED_DELIVERY_DATE: "bg-cyan-50 text-cyan-700"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm"
  };
  const baseClasses = "rounded-full font-medium flex items-center gap-1.5";
  const classes = `${baseClasses} ${statusClasses[status]} ${sizeClasses[size]} ${hasDelay ? "animate-pulse-slow" : ""}`;

  return (
    <span className={classes}>
      {hasDelay && <Clock className="h-3 w-3 mr-0.5" />}
      {getStatusIcon()}
      {label}
    </span>
  );
}
