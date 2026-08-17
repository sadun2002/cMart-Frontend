'use client';

import { Eye, ShoppingBag, Check, Trash2 } from 'lucide-react';

export interface Theme {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  type: string;
  previewUrl?: string;
  tags?: string[];
  version?: string;
  rating?: number;
  reviews?: number;
  stores?: number;
  isActive?: boolean;
  pageCount?: number;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
    background?: string;
  };
}

interface ThemeCardProps {
  theme: Theme;
  variant?: 'marketplace' | 'owner' | 'admin';
  onActivate?: (id: number | string) => void;
  onBuy?: (id: number | string) => void;
  onPreview?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
  isActivating?: boolean;
  isActive?: boolean;
}

const GRADIENTS = [
  'from-indigo-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-slate-600 to-gray-900',
  'from-rose-400 to-pink-700',
  'from-blue-600 to-indigo-800',
  'from-orange-400 to-red-600',
  'from-green-500 to-emerald-800',
  'from-amber-500 to-orange-700',
  'from-fuchsia-500 to-pink-700',
  'from-yellow-400 to-amber-700',
  'from-red-500 to-rose-800',
  'from-amber-300 to-orange-600',
];

function getGradient(id: number | string) {
  const index = typeof id === 'number' ? id : parseInt(id, 10) || 0;
  return GRADIENTS[index % GRADIENTS.length];
}

export function ThemeCard({
  theme,
  variant = 'marketplace',
  onActivate,
  onBuy,
  onPreview,
  onDelete,
  isActivating = false,
  isActive = false,
}: ThemeCardProps) {
  const gradient = getGradient(theme.id);
  const isFree = theme.price === 0 || theme.type === 'FREE';

  return (
    <div
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Preview */}
      <div className="aspect-video relative overflow-hidden">
        {theme.previewUrl ? (
          <div className="w-full h-full relative overflow-hidden bg-slate-50">
            <div className="absolute top-0 left-0 origin-top-left pointer-events-none" style={{ width: '400%', height: '400%', transform: 'scale(0.25)' }}>
              <iframe
                src={theme.previewUrl}
                className="w-full h-full border-0"
                scrolling="no"
                tabIndex={-1}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} p-3 flex flex-col gap-2 overflow-hidden`}>
            <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm px-3 py-2 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-white/80" />
              <div className="flex gap-2">
                <div className="w-10 h-1.5 bg-white/50 rounded-full" />
                <div className="w-10 h-1.5 bg-white/50 rounded-full" />
                <div className="w-10 h-1.5 bg-white/50 rounded-full" />
              </div>
              <div className="w-16 h-5 bg-white/25 rounded-full" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-3/4 h-4 bg-white/90 rounded-full shadow" />
              <div className="w-1/2 h-2.5 bg-white/60 rounded-full" />
              <div className="w-24 h-6 bg-white/30 rounded-lg mt-1" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/25 rounded-md" />
              ))}
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {variant === 'admin' ? (
            <div className="flex items-center justify-center gap-3 p-4">
              <button
                onClick={() => onPreview?.(theme.id)}
                className="flex-1 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => onDelete?.(theme.id)}
                className="p-2.5 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-lg text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href={theme.previewUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-bold px-5 py-2 rounded-xl shadow-xl text-xs flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {theme.name}
        </h3>

        {variant === 'marketplace' && theme.rating != null && (
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-3">
            <div className="flex items-center gap-1 text-amber-500">
              <svg className="w-3 h-3 fill-amber-500" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-bold text-gray-700 dark:text-slate-300">{theme.rating}</span>
            </div>
            <span>·</span>
            <span>{theme.reviews ?? 0} reviews</span>
            <span>·</span>
            <span>{theme.stores ?? 0} stores</span>
          </div>
        )}

        {theme.tags && theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {theme.tags.map(tag => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          {isFree ? (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">
              FREE
            </span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-black text-blue-600 dark:text-blue-400 text-base">
                Rs. {Number(theme.price).toLocaleString()}
              </span>
            </div>
          )}

          {variant === 'owner' ? (
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              ) : isFree ? (
                <button
                  onClick={() => onActivate?.(theme.id)}
                  disabled={isActivating === theme.id}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isActivating === theme.id ? '...' : 'Activate'}
                </button>
              ) : (
                <button
                  onClick={() => onBuy?.(theme.name)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                </button>
              )}
            </div>
          ) : variant === 'admin' ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>v{theme.version || '1.0.0'}</span>
              {theme.isActive ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Published
                </span>
              ) : (
                <span className="text-slate-500">Draft</span>
              )}
            </div>
          ) : (
            <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5" /> Get
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
