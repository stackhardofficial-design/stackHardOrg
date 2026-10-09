'use client';

import React from 'react';
import { DollarSign, Repeat, AlertTriangle, Layers, TrendingUp } from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface StatsCardsProps {
  projects: ProjectWithPayments[];
}

export function StatsCards({ projects }: StatsCardsProps) {
  // 1. Total Generado (Suma de todos los pagos registrados o montos base cobrados)
  const totalGenerado = projects.reduce((acc, p) => {
    const paidInPayments = p.payments?.reduce((sum, pay) => sum + (pay.status === 'completado' ? Number(pay.amount) : 0), 0) || 0;
    // Si no tiene registros de pago explícitos pero tiene one_time_price y está entregado/activo, o sumamos el paidInPayments
    return acc + (paidInPayments > 0 ? paidInPayments : Number(p.one_time_price || 0));
  }, 0);

  // 2. MRR (Cobros mensuales de mantenimiento activo)
  const mrr = projects.reduce((acc, p) => {
    if (p.status === 'activo' || p.status === 'entregado') {
      if (p.recurring_period === 'mensual') {
        return acc + Number(p.recurring_amount || 0);
      } else if (p.recurring_period === 'anual') {
        return acc + Number(p.recurring_amount || 0) / 12;
      }
    }
    return acc;
  }, 0);

  // 3. Dominios por renovar (próximos 30 días o vencidos)
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiringDomains = projects.filter((p) => {
    if (!p.domain_renews || !p.domain_renewal_date) return false;
    const renewalDate = new Date(p.domain_renewal_date);
    return renewalDate <= thirtyDaysLater;
  });

  const landingsCount = projects.filter((p) => p.type === 'landing').length;
  const sistemasCount = projects.filter((p) => p.type === 'sistema' || p.type === 'saas').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Generado */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Generado</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ${totalGenerado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-normal">USD</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Pagos únicos + acumulados</span>
        </p>
      </div>

      {/* Ingresos Recurrentes (MRR) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">MRR (Mantenimientos)</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Repeat className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ${mrr.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-normal">/mes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          ARR est: ${(mrr * 12).toLocaleString('es-AR', { maximumFractionDigits: 0 })}/año
        </p>
      </div>

      {/* Alerta Dominios */}
      <div className={`border rounded-xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm ${
        expiringDomains.length > 0 
          ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Dominios a Renovar</span>
          <div className={`p-2 rounded-lg border ${
            expiringDomains.length > 0
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {expiringDomains.length}
          </span>
          <span className="text-xs text-slate-400">en ≤ 30 días</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {expiringDomains.length === 0 ? 'Sin renovaciones urgentes' : 'Atención requerida'}
        </p>
      </div>

      {/* Proyectos Totales */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Proyectos</span>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {projects.length}
          </span>
          <span className="text-xs text-slate-400">registrados</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
          <span>{landingsCount} Landings</span>
          <span>•</span>
          <span>{sistemasCount} Sistemas</span>
        </div>
      </div>
    </div>
  );
}
