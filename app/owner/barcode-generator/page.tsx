'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Barcode, Download, Printer, Copy, RefreshCcw, ChevronDown, History, Maximize, Minimize, Settings } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/lib/auth-store';
import { getLocalProducts, getBarcodeHistory, saveBarcodeHistory } from '@/lib/local-services';
import type { Product } from '@/lib/types';
import { generateSystemBarcode } from '@/lib/barcode-utils';

const BARCODE_TYPES = [
  { value: 'ean13', label: 'EAN-13 (Retail)' },
  { value: 'code128', label: 'Code 128 (Standard)' },
  { value: 'upca', label: 'UPC-A (North America)' },
  { value: 'code39', label: 'Code 39' },
  { value: 'qrcode', label: 'QR Code' },
];

export default function BarcodeGeneratorPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    if (user?.tenantId) {
      getLocalProducts(user.tenantId).then(setProducts).catch(console.error);
    }
  }, [user?.tenantId]);

  const [barcodeText, setBarcodeText] = useState('');
  useEffect(() => {
    if (!barcodeText && user) {
      setBarcodeText(generateSystemBarcode(user.tenantId));
    }
  }, [user?.tenantId]);

  const [symbology, setSymbology] = useState('ean13');
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(15);
  
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [manualPrice, setManualPrice] = useState('');
  const [isPriceLocked, setIsPriceLocked] = useState(false);

  useEffect(() => {
    if (!barcodeText) return;
    const matchedProduct = products.find(p => p.barcode === barcodeText);
    if (matchedProduct) {
      setManualPrice(matchedProduct.price.toString());
      setIsPriceLocked(true);
    } else {
      setIsPriceLocked(false);
    }
  }, [barcodeText, products]);
  const [printQuantity, setPrintQuantity] = useState(1);
  const [compositeImageUrl, setCompositeImageUrl] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isBarcodeEditable, setIsBarcodeEditable] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (user?.tenantId) {
      const data = await getBarcodeHistory(user.tenantId);
      setHistoryData(data);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.tenantId]);

  // Barcode Scanner Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (except for rapid scanner typing which we want to capture globally)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      const currentTime = Date.now();
      // Scanners type very fast (usually < 30ms per character). 
      // We use 50ms as a threshold. If it's slower, it's a human typing.
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = ''; 
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) { // Considered a valid scan
          setBarcodeText(barcodeBuffer);
          barcodeBuffer = '';
          
          if (isInput) {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
          toast.success('Barcode scanned successfully!');
        }
      } else if (e.key.length === 1) { 
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBarcodeClick = () => {
    if (!isBarcodeEditable) {
      setIsConfirmOpen(true);
    }
  };

  // Generate URL for bwip-js API
  const generateBarcodeUrl = () => {
    if (!barcodeText) return '';
    const params = new URLSearchParams({
      bcid: symbology,
      text: barcodeText,
      scale: scale.toString(),
      height: height.toString(),
      includetext: 'true', // Always show text below
      backgroundcolor: 'ffffff',
    });
    return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
  };

  useEffect(() => {
    const bwipUrl = generateBarcodeUrl();
    if (!bwipUrl) {
      setCompositeImageUrl('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = bwipUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const topPadding = (showStoreName || showDate) ? 30 * (scale / 3) : 0;
      const bottomPadding = showPrice ? 30 * (scale / 3) : 0;
      
      canvas.width = img.width + 40; // padding
      canvas.height = img.height + topPadding + bottomPadding + 20;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      const fontSize = Math.max(12, 12 * (scale / 3));
      ctx.font = `bold ${fontSize}px sans-serif`;

      if (showStoreName || showDate) {
        ctx.textBaseline = 'top';
        
        if (showStoreName) {
          ctx.textAlign = 'left';
          ctx.fillText(user?.tenant?.businessName || 'cMart POS', 20, 10);
        }
        
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-GB');
          ctx.textAlign = 'right';
          ctx.fillText(dateStr, canvas.width - 20, 10);
        }
      }

      // Draw barcode
      const imgX = (canvas.width - img.width) / 2;
      const imgY = topPadding + 10;
      
      ctx.drawImage(img, imgX, imgY);

      if (showPrice) {
         ctx.textBaseline = 'bottom';
         ctx.textAlign = 'center';
         const priceStr = `Rs. ${parseFloat(manualPrice || '0').toFixed(2)}`;
         ctx.fillText(priceStr, canvas.width / 2, canvas.height - 10);
      }
      
      setCompositeImageUrl(canvas.toDataURL('image/png'));
    };
  }, [barcodeText, symbology, scale, height, showStoreName, showDate, showPrice, manualPrice, user]);

  const handlePrint = async () => {
    if (user?.tenantId) {
       await saveBarcodeHistory(user.tenantId, {
         barcode: barcodeText,
         barcodeType: symbology,
         quantity: printQuantity
       });
       fetchHistory();
    }
    const printWindow = window.open('', '_blank');
    if (printWindow && compositeImageUrl) {
      const imagesHtml = Array(printQuantity)
        .fill(0)
        .map(() => `<div class="barcode-wrapper"><img src="${compositeImageUrl}" onload="imageLoaded()" /></div>`)
        .join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body { 
                display: flex; 
                flex-wrap: wrap; 
                gap: 20px; 
                padding: 20px; 
                justify-content: center; 
                margin: 0;
                background: white;
              }
              .barcode-wrapper { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                page-break-inside: avoid;
              }
              img { max-width: 100%; height: auto; }
              @media print {
                body { padding: 0; gap: 10px; }
              }
            </style>
            <script>
              let loaded = 0;
              const total = ${printQuantity};
              function imageLoaded() {
                loaded++;
                if (loaded >= total) {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 200);
                }
              }
            </script>
          </head>
          <body>
            ${imagesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyUrl = async () => {
    if (!compositeImageUrl) return;
    try {
      const res = await fetch(compositeImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Barcode Image copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy image');
    }
  };

  const handleDownload = async () => {
    if (!compositeImageUrl) return;

    if (printQuantity === 1) {
      // Single download
      const link = document.createElement('a');
      link.href = compositeImageUrl;
      link.download = `barcode-${barcodeText}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloaded barcode');
    } else {
      // ZIP download
      toast.loading('Generating ZIP file...', { id: 'zip-download' });
      try {
        const zip = new JSZip();
        // Remove data URL prefix to get raw base64
        const base64Data = compositeImageUrl.split(',')[1];
        
        for (let i = 1; i <= printQuantity; i++) {
          zip.file(`barcode-${barcodeText}-${i}.png`, base64Data, { base64: true });
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `barcodes-${barcodeText}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Downloaded ${printQuantity} barcodes`, { id: 'zip-download' });
      } catch (e) {
        toast.error('Failed to generate ZIP', { id: 'zip-download' });
      }
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 ${isFullscreen ? 'hidden' : 'mb-8'}`}>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Barcode className="w-8 h-8 text-blue-600" />
            Barcode Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create standard barcodes for your products and print them instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          {isHistoryView && (
            <button 
              onClick={() => setIsFullscreen(true)}
              title="Full Screen"
              className="flex items-center justify-center w-12 h-12 rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-800"
            >
              <Maximize className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setIsHistoryView(!isHistoryView)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isHistoryView ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {isHistoryView ? (
              <>
                <Barcode className="w-5 h-5" />
                Generator Mode
              </>
            ) : (
              <>
                <History className="w-5 h-5" />
                Barcode History
              </>
            )}
          </button>
        </div>
      </div>

      {isHistoryView ? (
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
          {isFullscreen && (
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
            >
              <Minimize className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[200px_200px_150px_200px_150px_150px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Date & Time</div>
                <div>Generated By</div>
                <div>Barcode Type</div>
                <div>Barcode Value</div>
                <div className="text-right">Quantity</div>
                <div className="text-center">Action</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {historyData.length > 0 ? historyData.map((record) => (
                  <div key={record.id} className="grid grid-cols-[200px_200px_150px_200px_150px_150px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {record.performedBy}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {record.barcodeType}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-mono truncate group/code">
                      <span className="truncate">{record.barcode}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(record.barcode); toast.success('Barcode copied!'); }}
                        className="p-1.5 opacity-0 group-hover/code:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                      </button>
                    </div>
                    <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {record.quantity}
                    </div>
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => {
                           setBarcodeText(record.barcode);
                           const t = BARCODE_TYPES.find(bt => bt.label.includes(record.barcodeType) || bt.value === record.barcodeType);
                           if (t) setSymbology(t.value);
                           setPrintQuantity(record.quantity);
                           setIsHistoryView(false);
                           setIsFullscreen(false);
                        }} 
                        className="px-4 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Reuse
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                    No barcode generation history found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* CONFIGURATION PANEL */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto no-scrollbar flex flex-col gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode Data (Auto Generated)</label>
              <button 
                onClick={() => {
                  setBarcodeText(generateSystemBarcode(user?.tenantId || 0));
                  setIsBarcodeEditable(false);
                }}
                className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-2 py-1 rounded-md transition-colors"
                title="Regenerate Barcode"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
            <input 
              type="text" 
              value={barcodeText}
              onChange={(e) => setBarcodeText(e.target.value)}
              readOnly={!isBarcodeEditable}
              onClick={handleBarcodeClick}
              className={`w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-colors ${
                isBarcodeEditable 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white' 
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-pointer'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Print Quantity</label>
            <input 
              type="number" 
              min="1"
              value={printQuantity}
              onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
            />
          </div>

          {showPrice && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price Field (Rs.)</label>
              <input 
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                disabled={isPriceLocked}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white ${isPriceLocked ? 'opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                placeholder="Enter price"
              />
              {isPriceLocked && <p className="text-[10px] text-blue-500 font-bold">Price locked. To edit, please update the product in the Products or Inventory page.</p>}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Advanced Configuration</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAdvancedOpen && (
              <div className="mt-4 space-y-6 px-3 pb-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span>{BARCODE_TYPES.find(t => t.value === symbology)?.label}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsTypeDropdownOpen(false)}
                        />
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                          {BARCODE_TYPES.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => {
                                setSymbology(type.value);
                                setIsTypeDropdownOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer font-bold text-sm transition-colors ${
                                symbology === type.value 
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              {type.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Scale (Size)</label>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={scale} 
                    onChange={(e) => setScale(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-right text-xs text-slate-500 font-medium">{scale}x</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Height</label>
                  <input 
                    type="range" 
                    min="5" max="50" 
                    value={height} 
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-right text-xs text-slate-500 font-medium">{height}mm</div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Display Options</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${showStoreName ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showStoreName ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={showStoreName} onChange={() => setShowStoreName(!showStoreName)} />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Store Name</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${showPrice ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showPrice ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={showPrice} onChange={() => setShowPrice(!showPrice)} />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Price Label</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${showDate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showDate ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={showDate} onChange={() => setShowDate(!showDate)} />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Date</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Live Preview</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center">
            
            <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-[min-content]">
              {compositeImageUrl ? (
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 mb-8 inline-block transition-transform duration-300 hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={compositeImageUrl} 
                    alt="Barcode Preview" 
                    className="max-w-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400 gap-4 mb-8">
                  <Barcode className="w-16 h-16 opacity-20" />
                  <p className="font-medium text-slate-500">Enter data to generate a barcode</p>
                </div>
              )}

              <div className="w-full max-w-sm flex gap-4 mt-auto">
                 <button 
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Label
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Edit Barcode Data"
        message="Are you sure you want to manually edit the barcode data? This might cause conflicts with existing barcodes in the global registry."
        confirmText="Yes, Edit"
        onConfirm={() => {
          setIsBarcodeEditable(true);
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
