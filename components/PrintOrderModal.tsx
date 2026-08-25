import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';

export default function PrintOrderModal({ isOpen, onClose, order, storeName, storePhone }: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  storeName: string;
  storePhone: string;
}) {
  const [customDeliveryFee, setCustomDeliveryFee] = useState<number>(0);

  useEffect(() => {
    if (order) {
      setCustomDeliveryFee(order.deliveryFee || 0);
    }
  }, [order]);

  // Group items by name to prevent duplicates
  const groupedItems = React.useMemo(() => {
    if (!order?.items) return [];
    return order.items.reduce((acc: any[], current: any) => {
      const existing = acc.find(item => item.name === current.name);
      if (existing) {
        existing.qty += current.qty;
        existing.total += current.total;
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, []);
  }, [order?.items]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Basic fallback to print dialogue since standard browser printing handles "Save as PDF"
    window.print();
  };

  const total = (order.subtotal || 0) + Number(customDeliveryFee);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:bg-transparent print:backdrop-blur-none">
        
        {/* Print Styles injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            @page {
              size: auto;
              margin: 0mm; /* Removes browser headers/footers */
            }
            #print-area {
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px; /* Padding for the actual paper */
              box-shadow: none !important;
            }
            /* Hide UI controls during print */
            .no-print {
              display: none !important;
            }
          }
        `}} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:bg-white"
          id="print-area"
        >
          {/* Header (No print) */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 no-print">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Print Preview</h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Content */}
          <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
            <div className="text-center mb-8 border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-black text-slate-900">{storeName}</h1>
              <p className="text-slate-500 mt-1">{storePhone}</p>
              <h2 className="text-xl font-bold mt-4 text-slate-800">ORDER RECEIPT</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{order.id} &bull; {order.orderDate} {order.orderTime}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Customer Details</h3>
                <p className="font-semibold text-slate-800">{order.customerName}</p>
                <p className="text-slate-600 mt-1">{order.customerPhone}</p>
                <p className="text-slate-600 mt-1">{order.customerEmail}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Order & Delivery</h3>
                <p className="text-slate-600 whitespace-pre-wrap mb-2">{order.shippingAddress}</p>
                <p className="text-slate-800 font-bold bg-slate-100 dark:bg-slate-800 inline-block px-3 py-1 rounded-md">
                  Payment : {order.paymentMethod}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs border-b border-slate-200 pb-2">Order Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-left">
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 text-center font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Price</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {groupedItems.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 text-slate-800 font-medium">{item.name}</td>
                      <td className="py-3 text-center text-slate-600">{item.qty}</td>
                      <td className="py-3 text-right text-slate-600">Rs. {Number(item.price).toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-slate-800">Rs. {Number(item.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-bold text-slate-900">Rs. {Number(order.subtotal).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm group">
                  <span className="text-slate-600">Delivery Fee</span>
                  <div className="flex items-center gap-1 no-print">
                    <span className="text-slate-400">Rs.</span>
                    <input 
                      type="number" 
                      value={customDeliveryFee === 0 ? '' : customDeliveryFee}
                      onChange={(e) => setCustomDeliveryFee(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-right border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <span className="font-bold text-slate-900 hidden print:inline">Rs. {Number(customDeliveryFee).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="font-black text-slate-900">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-xs font-medium text-slate-400 pb-8">
              <p>Thank you for your purchase!</p>
              <p className="mt-1">Generated by cMart - Smart POS</p>
            </div>
          </div>

          {/* Footer Actions (No print) */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 no-print">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
