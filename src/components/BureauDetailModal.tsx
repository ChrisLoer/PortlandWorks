'use client';

import React, { useEffect } from 'react';
import { BudgetItem } from '@/types/budget';
import { FUNCTIONAL_CATEGORIES } from '@/data/categories';
import { formatDollarAmount } from '@/utils/budget-utils';
import {
  X,
  ExternalLink,
  Layers,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface BureauDetailModalProps {
  bureau: BudgetItem | null;
  onClose: () => void;
}

export default function BureauDetailModal({ bureau, onClose }: BureauDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bureau) return null;

  const catMeta = bureau.functionalCategory ? FUNCTIONAL_CATEGORIES[bureau.functionalCategory] : null;

  const operating = bureau.operatingExpense || (bureau.classification === 'operating' ? bureau.totalExpense : 0);
  const capital = bureau.capitalExpense || (bureau.classification === 'capital' ? bureau.totalExpense : 0);
  const debt = bureau.debtExpense || (bureau.classification === 'debt' ? bureau.totalExpense : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Modal Dialog */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            {bureau.administrativeUnit}
          </span>

          {catMeta && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${catMeta.badgeBg}`}>
              <Layers className="w-3.5 h-3.5" />
              {catMeta.name}
            </span>
          )}

          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
            {bureau.classification || 'operating'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          {bureau.name}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {bureau.description || 'Public service bureau delivering critical regional programs and services.'}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 mb-6">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Budget</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatDollarAmount(bureau.totalExpense, 2)}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Operating</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatDollarAmount(operating, 2)}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">
              {debt > 0 ? 'Debt Service' : 'Capital Outlay'}
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {debt > 0 ? formatDollarAmount(debt, 2) : (capital > 0 ? formatDollarAmount(capital, 2) : '$0')}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Staffing (FTE)</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {bureau.authorizedFte ? `${Math.round(bureau.authorizedFte)} FTE` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Key Programs */}
        {bureau.keyPrograms && bureau.keyPrograms.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Core Programs & Responsibilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bureau.keyPrograms.map((prog, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-100 bg-white text-xs text-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{prog}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funding Sources */}
        {bureau.fundingSources && bureau.fundingSources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Primary Funding Streams
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {bureau.fundingSources.map((source, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-blue-50/80 text-blue-800 border border-blue-100 font-medium"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes / Special Context */}
        {bureau.notes && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 mb-6 leading-relaxed">
            <strong>Budget Context:</strong> {bureau.notes}
          </div>
        )}

        {/* Source References */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Fiscal Year 2024–25 Adopted Budget
          </span>

          {bureau.references && bureau.references.length > 0 ? (
            <a
              href={bureau.references[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <span>{bureau.references[0].title || 'View Official Document'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <a
              href="https://www.tsccmultco.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <span>TSCC Official Annual Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
