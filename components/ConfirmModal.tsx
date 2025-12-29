
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Excluir Permanentemente" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-inner">
            <AlertTriangle size={40} />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black text-slate-900 leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full py-5 bg-rose-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
          >
            {confirmLabel}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-lg hover:bg-slate-200 active:scale-95 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
