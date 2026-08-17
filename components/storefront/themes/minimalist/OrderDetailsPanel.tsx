"use client";

import { X, Package, Clock, Truck, CheckCircle } from "lucide-react";
import { formatLKR } from "@/lib/constants";
import { useEffect, useState } from "react";

export interface OrderDetails {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface OrderDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}

export function OrderDetailsPanel({ isOpen, onClose, order }: OrderDetailsPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !order) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing": return <Clock className="w-5 h-5 text-amber-500 mr-2" />;
      case "Shipped": return <Truck className="w-5 h-5 text-blue-500 mr-2" />;
      case "Delivered": return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
      default: return null;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/3 min-w-[320px] max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order {order.id}
          </h2>
          <button
            type="button"
            className="-m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
          <div>
            <h3 className="text-sm font-medium text-foreground">Status</h3>
            <div className="mt-2 flex items-center bg-muted p-3 rounded-md border border-border">
              {getStatusIcon(order.status)}
              <span className="font-medium text-foreground">{order.status}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Order Summary</h3>
            <dl className="mt-2 text-sm text-muted-foreground space-y-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <dt>Date Placed</dt>
                <dd className="font-medium text-foreground">{order.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Items</dt>
                <dd className="font-medium text-foreground">{order.items}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <dt className="text-base font-medium text-foreground">Total Amount</dt>
                <dd className="text-base font-bold text-foreground">{formatLKR(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Items Included</h3>
            <ul className="divide-y divide-border border-t border-border">
              {Array.from({ length: order.items }).map((_, idx) => (
                <li key={idx} className="py-4 flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col flex-1 justify-center">
                    <p className="text-sm font-medium text-foreground">Sample Product {idx + 1}</p>
                    <p className="text-xs text-muted-foreground mt-1">Quantity: 1</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border px-4 py-6 sm:px-6 bg-muted">
          <button
            onClick={onClose}
            className="w-full flex justify-center items-center px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
}
