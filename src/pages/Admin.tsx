
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllOrders } from "@/lib/data";
import { Order, OrderStatus } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Search, Loader2, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  
  // Form state for new/edit order
  const [formData, setFormData] = useState({
    Carpetno: "",
    Buyercode: "",
    Design: "",
    Size: "",
    STATUS: "ORDER_APPROVAL",
    "Order issued": new Date().toISOString().split('T')[0],
    "Delivery Date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Mapping of OrderStatus to display names
  const orderStatuses: { value: OrderStatus; label: string }[] = [
    { value: "ORDER_APPROVAL", label: "Order Approval" },
    { value: "RENDERING", label: "Rendering" },
    { value: "DYEING", label: "Dyeing" },
    { value: "DYEING_READY", label: "Dyeing Ready" },
    { value: "WAITING_FOR_LOOM", label: "Waiting for Loom" },
    { value: "ONLOOM", label: "On Loom" },
    { value: "ONLOOM_PROGRESS", label: "On Loom Progress" },
    { value: "OFFLOOM", label: "Off Loom" },
    { value: "FINISHING", label: "Finishing" },
    { value: "DELIVERY_TIME", label: "Ready for Delivery" },
    { value: "FIRST_REVISED_DELIVERY_DATE", label: "First Revised Date" },
    { value: "SECOND_REVISED_DELIVERY_DATE", label: "Second Revised Date" }
  ];
  
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "There was a problem loading the orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    return (
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.carpetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Add new order
  const handleAddOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("CarpetOrder")
        .insert([{
          Carpetno: formData.Carpetno,
          Buyercode: formData.Buyercode,
          Design: formData.Design,
          Size: formData.Size,
          STATUS: formData.STATUS,
          "Order issued": formData["Order issued"],
          "Delivery Date": formData["Delivery Date"]
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Order Added",
        description: `Order ${formData.Carpetno} was added successfully`,
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      console.error("Error adding order:", error);
      toast({
        title: "Error Adding Order",
        description: error.message || "There was a problem adding the order",
        variant: "destructive"
      });
    }
  };

  // Update existing order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      const { error } = await supabase
        .from("CarpetOrder")
        .update({
          Buyercode: formData.Buyercode,
          Design: formData.Design,
          Size: formData.Size,
          STATUS: formData.STATUS,
          "Order issued": formData["Order issued"],
          "Delivery Date": formData["Delivery Date"]
        })
        .eq("Carpetno", selectedOrder.orderNumber);

      if (error) {
        throw error;
      }

      toast({
        title: "Order Updated",
        description: `Order ${selectedOrder.orderNumber} was updated successfully`,
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error Updating Order",
        description: error.message || "There was a problem updating the order",
        variant: "destructive"
      });
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderNumber: string) => {
    try {
      const { error } = await supabase
        .from("CarpetOrder")
        .delete()
        .eq("Carpetno", orderNumber);

      if (error) {
        throw error;
      }

      toast({
        title: "Order Deleted",
        description: `Order ${orderNumber} was deleted successfully`,
      });
      
      fetchOrders();
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error Deleting Order",
        description: error.message || "There was a problem deleting the order",
        variant: "destructive"
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      Carpetno: order.orderNumber,
      Buyercode: order.clientCode,
      Design: order.carpetName,
      Size: order.dimensions,
      STATUS: order.status,
      "Order issued": order.timeline[0]?.date ? new Date(order.timeline[0].date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      "Delivery Date": order.estimatedCompletion ? new Date(order.estimatedCompletion).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      Carpetno: "",
      Buyercode: "",
      Design: "",
      Size: "",
      STATUS: "ORDER_APPROVAL",
      "Order issued": new Date().toISOString().split('T')[0],
      "Delivery Date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
                <DialogDescription>
                  Create a new carpet order. Please fill in all the required fields.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Order Number</Label>
                  <Input
                    className="col-span-3"
                    value={formData.Carpetno}
                    onChange={(e) => setFormData({...formData, Carpetno: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Client Code</Label>
                  <Input
                    className="col-span-3"
                    value={formData.Buyercode}
                    onChange={(e) => setFormData({...formData, Buyercode: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Design Name</Label>
                  <Input
                    className="col-span-3"
                    value={formData.Design}
                    onChange={(e) => setFormData({...formData, Design: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Size</Label>
                  <Input
                    className="col-span-3"
                    value={formData.Size}
                    onChange={(e) => setFormData({...formData, Size: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <Select 
                    value={formData.STATUS as OrderStatus} 
                    onValueChange={(value) => setFormData({...formData, STATUS: value as OrderStatus})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Order Date</Label>
                  <Input
                    className="col-span-3"
                    type="date"
                    value={formData["Order issued"]}
                    onChange={(e) => setFormData({...formData, "Order issued": e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Delivery Date</Label>
                  <Input
                    className="col-span-3"
                    type="date"
                    value={formData["Delivery Date"]}
                    onChange={(e) => setFormData({...formData, "Delivery Date": e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddOrder}>Add Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders by number, design name or client code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-tibet-red" />
          </div>
        ) : (
          <div className="bg-white rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found. Try adjusting your search or add a new order.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.clientCode}</TableCell>
                      <TableCell>{order.carpetName}</TableCell>
                      <TableCell>{order.dimensions}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                          style={{ 
                            backgroundColor: order.status === 'ORDER_APPROVAL' ? '#f3f4f6' : 
                                            order.status === 'RENDERING' ? '#dbeafe' :
                                            order.status === 'DYEING' ? '#e0e7ff' :
                                            order.status === 'FINISHING' ? '#d1fae5' :
                                            order.status === 'DELIVERY_TIME' ? '#ecfdf5' : '#f3f4f6'
                          }}
                        >
                          {orderStatuses.find(s => s.value === order.status)?.label || order.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.timeline[0]?.date ? new Date(order.timeline[0].date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {order.estimatedCompletion ? new Date(order.estimatedCompletion).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditClick(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete order #{order.orderNumber}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOrder(order.orderNumber)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update the details for order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Order Number</Label>
              <Input
                className="col-span-3"
                value={formData.Carpetno}
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Client Code</Label>
              <Input
                className="col-span-3"
                value={formData.Buyercode}
                onChange={(e) => setFormData({...formData, Buyercode: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Design Name</Label>
              <Input
                className="col-span-3"
                value={formData.Design}
                onChange={(e) => setFormData({...formData, Design: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Size</Label>
              <Input
                className="col-span-3"
                value={formData.Size}
                onChange={(e) => setFormData({...formData, Size: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select 
                value={formData.STATUS as OrderStatus} 
                onValueChange={(value) => setFormData({...formData, STATUS: value as OrderStatus})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Order Date</Label>
              <Input
                className="col-span-3"
                type="date"
                value={formData["Order issued"]}
                onChange={(e) => setFormData({...formData, "Order issued": e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Delivery Date</Label>
              <Input
                className="col-span-3"
                type="date"
                value={formData["Delivery Date"]}
                onChange={(e) => setFormData({...formData, "Delivery Date": e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateOrder}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for labels
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  );
};

export default Admin;
