import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSetting, setSetting } from '@/lib/db';
import { toast } from 'sonner';

interface MonthlyGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalUpdated?: (newGoal: string) => void;
}

export function MonthlyGoalDialog({ isOpen, onClose, onGoalUpdated }: MonthlyGoalDialogProps) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGoal();
    }
  }, [isOpen]);

  const loadGoal = async () => {
    const savedGoal = await getSetting('monthly_sales_goal', '500000');
    setGoal(savedGoal);
  };

  const handleSave = async () => {
    if (!goal || isNaN(Number(goal))) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    await setSetting('monthly_sales_goal', goal);
    setIsLoading(false);
    toast.success('Monthly sales goal updated!');
    if (onGoalUpdated) onGoalUpdated(goal);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm pointer-events-auto flex flex-col gap-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Set Monthly Goal</h3>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Target Revenue (LKR)
                  </label>
                  <Input 
                    type="number" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Goal
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
