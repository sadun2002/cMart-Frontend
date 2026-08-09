'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, BarChart3, ListOrdered, AlertTriangle, Table,
  Calendar, Target, Activity, Zap, GitCompare, MapPin, CreditCard,
  Package, Users, Globe, Smartphone, Server, UserCheck, Clock, Gift,
  DollarSign, TrendingUp, ShoppingBag, MoreHorizontal, Search, ChevronDown, ChevronUp, GripVertical,
  LayoutGrid, List, Save, RotateCcw, Eye, EyeOff,
} from 'lucide-react';
import {
  dashboardComponents,
  componentCategories,
  defaultEnabledComponents,
  CATEGORY_LIMITS,
  type DashboardComponentId,
  type CategoryKey,
} from '@/lib/dashboard-components';
import { getIcon } from '@/lib/icon-registry';
import { ComponentPreview } from './ComponentPreview';
import { formatLKR } from '@/lib/constants';

const STORAGE_KEY = 'cMart_dashboard_prefs';

interface DashboardPrefs {
  enabledComponents: DashboardComponentId[];
  layout: 'grid' | 'list';
  compactMode: boolean;
  autoRefresh: boolean;
}

const defaultPrefs: DashboardPrefs = {
  enabledComponents: defaultEnabledComponents,
  layout: 'grid',
  compactMode: false,
  autoRefresh: true,
};

export default function CustomizeDashboardPage() {
  const [prefs, setPrefs] = useState<DashboardPrefs>(defaultPrefs);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryKey>>(
    new Set(componentCategories.map(c => c.key))
  );
  const [dragOverId, setDragOverId] = useState<DashboardComponentId | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch {
        setPrefs(defaultPrefs);
      }
    }
  }, []);

  const savePrefs = useCallback((newPrefs: DashboardPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
  }, []);

  const toggleComponent = (id: DashboardComponentId) => {
    setPrefs(prev => {
      const isEnabling = !prev.enabledComponents.includes(id);
      if (isEnabling) {
        const comp = dashboardComponents.find(c => c.id === id);
        if (comp) {
          // Enforce per-category limits
          const maxAllowed = CATEGORY_LIMITS[comp.category] ?? 3;
          const enabledInCategory = prev.enabledComponents.filter(eid =>
            dashboardComponents.find(c => c.id === eid)?.category === comp.category
          ).length;
          if (enabledInCategory >= maxAllowed) {
            // Auto-swap: remove the oldest (first) enabled component in this category
            const firstEnabled = prev.enabledComponents.find(eid =>
              dashboardComponents.find(c => c.id === eid)?.category === comp.category
            );
            if (firstEnabled) {
              const enabled = prev.enabledComponents.filter(c => c !== firstEnabled);
              const next = { ...prev, enabledComponents: [...enabled, id] };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              return next;
            }
            return prev;
          }
        }
      }
      const enabled = prev.enabledComponents.includes(id)
        ? prev.enabledComponents.filter(c => c !== id)
        : [...prev.enabledComponents, id];
      const next = { ...prev, enabledComponents: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleCategory = (key: CategoryKey) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllInCategory = (category: CategoryKey, enable: boolean) => {
    const categoryIds = dashboardComponents
      .filter(c => c.category === category)
      .map(c => c.id);
    setPrefs(prev => {
      let enabled = prev.enabledComponents;
      if (enable) {
        const nonCategoryIds = enabled.filter(id =>
          dashboardComponents.find(c => c.id === id)?.category !== category
        );
        const maxAllowed = CATEGORY_LIMITS[category] ?? 3;
        enabled = [...new Set([...nonCategoryIds, ...categoryIds.slice(0, maxAllowed)])];
      } else {
        enabled = enabled.filter(id => !categoryIds.includes(id));
      }
      const next = { ...prev, enabledComponents: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, id: DashboardComponentId) => {
    e.dataTransfer.setData('text/plain', id);
    setDragOverId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: DashboardComponentId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetId) return;

    setPrefs(prev => {
      const enabled = [...prev.enabledComponents];
      const fromIndex = enabled.indexOf(sourceId as DashboardComponentId);
      const toIndex = enabled.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = enabled.splice(fromIndex, 1);
      enabled.splice(toIndex, 0, moved);
      const next = { ...prev, enabledComponents: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setDragOverId(null);
  };

  const filteredComponents = dashboardComponents.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryMap = new Map<CategoryKey, typeof filteredComponents>();
  filteredComponents.forEach(c => {
    const arr = categoryMap.get(c.category as CategoryKey) || [];
    arr.push(c);
    categoryMap.set(c.category as CategoryKey, arr);
  });

  return (
    <div className="font-sans p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Customize Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Choose which widgets appear on your dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => savePrefs({ ...prefs, enabledComponents: defaultEnabledComponents })}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={() => {
              const newEnabled: DashboardComponentId[] = [];
              componentCategories.forEach(cat => {
                const maxAllowed = CATEGORY_LIMITS[cat.key] ?? 3;
                const catComps = dashboardComponents.filter(c => c.category === cat.key).slice(0, maxAllowed).map(c => c.id);
                newEnabled.push(...catComps);
              });
              savePrefs({ ...prefs, enabledComponents: newEnabled });
            }}
            className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Enable All
          </button>
          <button
            onClick={() => savePrefs({ ...prefs, enabledComponents: [] })}
            className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <EyeOff className="w-4 h-4" />
            Disable All
          </button>
        </div>
      </div>

      {/* Search & Layout Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 lg:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.compactMode}
                onChange={e => savePrefs({ ...prefs, compactMode: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded border-gray-300 dark:border-slate-600"
              />
              Compact Mode
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.autoRefresh}
                onChange={e => savePrefs({ ...prefs, autoRefresh: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded border-gray-300 dark:border-slate-600"
              />
              Auto Refresh
            </label>
            <select
              value={prefs.layout}
              onChange={e => savePrefs({ ...prefs, layout: e.target.value as 'grid' | 'list' })}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="grid">Grid Layout</option>
              <option value="list">List Layout</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-800">
          <span>{prefs.enabledComponents.length} of {dashboardComponents.length} components enabled</span>
          <span>·</span>
          <span>{dashboardComponents.filter(c => c.default).length} defaults</span>
          <span>·</span>
          <span>{componentCategories.length} categories</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2" role="list" aria-label="Dashboard component categories">
        {componentCategories
          .map(category => {
            const categoryId = category.key;
            const components = categoryMap.get(categoryId) || [];
            return { category, categoryId, components };
          })
          .filter(({ components }) => search === '' || components.length > 0)
          .map(({ category, categoryId, components }) => {
          const isExpanded = expandedCategories.has(categoryId);
          const enabledInCategory = components.filter(c => prefs.enabledComponents.includes(c.id)).length;

          // Per-category max limits
          const maxAllowed = CATEGORY_LIMITS[categoryId] ?? 3;
          const isAtLimit = enabledInCategory >= maxAllowed;

          return (
            <div
              key={categoryId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
              role="listitem"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                aria-expanded={isExpanded}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${category.bgClass}`}>
                  {(() => {
                    const CategoryIcon = getIcon(category.icon);
                    return <CategoryIcon className={`w-4 h-4 ${category.textClass}`} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{category.label}</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                    {enabledInCategory} / {maxAllowed} max enabled
                  </p>
                </div>
              </button>

              {/* Category Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-3 pb-3 border-t border-gray-100 dark:border-slate-800 pt-3">
                  {/* Limit warning */}
                  {isAtLimit && (
                    <div className="mb-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      Maximum {maxAllowed} {category.label.toLowerCase()} can be shown on dashboard. Selecting another will replace the oldest one.
                    </div>
                  )}
                  {components.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 dark:text-slate-500 text-sm">
                      No matching components in this category
                    </div>
                  ) : (
                    <div
                      className={
                        prefs.layout === 'list' 
                          ? 'flex flex-col gap-3' 
                          : categoryId === 'kpi'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'
                            : categoryId === 'charts' || categoryId === 'comparison'
                              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      }
                      role="list"
                      aria-label={`${category.label} components`}
                    >
                      {components.map((comp) => {
                        const isEnabled = prefs.enabledComponents.includes(comp.id);
                        return (
                          <div
                            key={comp.id}
                            draggable
                            onDragStart={e => handleDragStart(e, comp.id)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, comp.id)}
                            onClick={() => toggleComponent(comp.id)}
                            className={`
                              group relative rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden
                              ${prefs.layout === 'list' ? 'flex items-center gap-2 p-2' : 'p-0'}
                              ${isEnabled
                                ? 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-200 dark:ring-blue-800/50 shadow-sm'
                                : 'border-gray-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-500'
                              }
                              ${dragOverId === comp.id ? 'ring-2 ring-blue-500' : ''}
                            `}
                            role="listitem"
                            aria-selected={isEnabled}
                          >
                            {/* Enable/Disable overlay badge — positioned at bottom-right to avoid title overlap */}
                            <div className={`absolute bottom-1.5 right-1.5 z-10 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
                              isEnabled
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/70 dark:bg-slate-800/70 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700'
                            }`}>
                              {isEnabled ? '✓' : ''}
                            </div>

                            {/* Realistic Component Preview */}
                            <ComponentPreview comp={comp as any} isEnabled={isEnabled} layout={prefs.layout} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Status */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <Save className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Changes saved automatically to localStorage
          </span>
        </div>
      </div>
    </div>
  );
}