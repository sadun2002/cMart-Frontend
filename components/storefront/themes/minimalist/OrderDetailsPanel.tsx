"use client";

import { X, Package, Clock, Truck, CheckCircle } from "lucide-react";
import { formatLKR } from "@/lib/constants";
import { useEffect, useState } from "react";
import { MinimalistConfirmDialog } from "./MinimalistConfirmDialog";

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
  order: any;
  onCancelOrder?: (id: string | number) => Promise<void>;
  onReturnOrder?: (id: string | number) => Promise<void>;
}

export function OrderDetailsPanel({ isOpen, onClose, order, onCancelOrder, onReturnOrder }: OrderDetailsPanelProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !order) return null;

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PROCESSING": return <Clock className="w-5 h-5 text-amber-500 mr-2" />;
      case "SHIPPED": return <Truck className="w-5 h-5 text-blue-500 mr-2" />;
      case "DELIVERED": return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
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
            Order Details
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
            <h3 className="text-sm font-medium text-foreground">Order Timeline</h3>
            <div className="mt-4 space-y-4">
              {order.history && order.history.length > 0 ? (
                <div className="relative border-l border-border ml-3 space-y-4 pb-2">
                  {order.history.map((hist: any, index: number) => {
                    const isLast = index === order.history.length - 1;
                    return (
                      <div key={hist.id} className="relative pl-6">
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background ${isLast ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground capitalize">{hist.status.toLowerCase()}</span>
                          <span className="text-xs text-muted-foreground">{new Date(hist.createdAt).toLocaleString()}</span>
                          {hist.note && <span className="text-xs text-muted-foreground mt-1">{hist.note}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative border-l border-border ml-3 space-y-4 pb-2">
                  <div className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background bg-primary"></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground capitalize">{order.status.toLowerCase()}</span>
                      <span className="text-xs text-muted-foreground">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : (order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Order Summary</h3>
            <dl className="mt-2 text-sm text-muted-foreground space-y-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <dt>Date Placed</dt>
                <dd className="font-medium text-foreground text-right">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Items</dt>
                <dd className="font-medium text-foreground">{Array.isArray(order.items) ? order.items.length : order.items}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Payment Method</dt>
                <dd className="font-medium text-foreground">{(order.paymentMethod === 'COD' || order.paymentMethod === 'CASH') ? 'Cash on Delivery (COD)' : 'Card'}</dd>
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
              {Array.isArray(order.items) 
                ? order.items.map((item: any, idx: number) => (
                    <li key={idx} className="py-4 flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm font-bold mt-1 text-foreground">{formatLKR(item.subtotal)}</p>
                      </div>
                    </li>
                  ))
                : Array.from({ length: Number(order.items) || 0 }).map((_, idx) => (
                    <li key={idx} className="py-4 flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        <p className="text-sm font-medium text-foreground">Sample Product {idx + 1}</p>
                        <p className="text-xs text-muted-foreground mt-1">Quantity: 1</p>
                      </div>
                    </li>
                  ))
              }
            </ul>
          </div>
        </div>

        <div className="border-t border-border px-4 py-6 sm:px-6 bg-muted space-y-3">
          <button
            onClick={onClose}
            className="w-full flex justify-center items-center px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close Details
          </button>
          
          {order.status?.toUpperCase() === 'PENDING' && onCancelOrder && (
            <button
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={isCancelling}
              className="w-full relative flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 overflow-hidden"
            >
              {isCancelling ? (
                <>
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <span className="relative z-10 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </span>
                </>
              ) : (
                "Cancel Order"
              )}
            </button>
          )}

          {order.status?.toUpperCase() === 'DELIVERED' && onReturnOrder && (() => {
            const deliveredDate = new Date(order.updatedAt || order.createdAt);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 3) {
              return (
                <button
                  onClick={() => setIsReturnDialogOpen(true)}
                  disabled={isReturning}
                  className="w-full relative flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 overflow-hidden"
                >
                  {isReturning ? (
                    <>
                      <div className="absolute inset-0 bg-black/5 animate-pulse" />
                      <span className="relative z-10 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Returning...
                      </span>
                    </>
                  ) : (
                    "Return Order"
                  )}
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>

      <MinimalistConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel"
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={async () => {
          setIsCancelling(true);
          try {
            if (onCancelOrder) await onCancelOrder(order.id);
          } finally {
            setIsCancelling(false);
          }
        }}
      />

      <MinimalistConfirmDialog
        isOpen={isReturnDialogOpen}
        title="Return Order"
        message="Are you sure you want to return this order?"
        confirmText="Yes, Return"
        isDestructive={false}
        onClose={() => setIsReturnDialogOpen(false)}
        onConfirm={async () => {
          setIsReturning(true);
          try {
            if (onReturnOrder) await onReturnOrder(order.id);
          } finally {
            setIsReturning(false);
          }
        }}
      />
    </>
  );
}
