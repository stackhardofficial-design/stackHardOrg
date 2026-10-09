'use client';

import React from 'react';
import { DollarSign, Repeat, ShieldAlert, FolderKanban, TrendingUp } from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface StatsCardsProps {
  projects: ProjectWithPayments[];
}

export function StatsCards({ projects }: StatsCardsProps) {
  // Total acumulado generado
  const totalGenerado = projects.reduce((acc, p) => {
    const paidInPayments = p.payments?.reduce(
      (sum, pay) => sum + (pay.status === 'completado' ? Number(pay.amount) : 0),
      0
    ) || 0;
    return acc + (paidInPayments > 0 ? paidInPayments : Number(p.one_time_price || 0));
  }, 0);

  // MRR
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

  // Dominios por renovar (≤ 30 días o vencidos)
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiringDomains = projects.filter((p) => {
    if (!p.domain_renews || !p.domain_renewal_date) return false;
    const renewalDate = new Date(p.domain_renewal_date + 'T00:00:00');
    return renewalDate <= thirtyDaysLater;
  });

  const landingsCount = projects.filter((p) => p.type === 'landing').length;
  const sistemasCount = projects.filter((p) => p.type === 'sistema' || p.type === 'saas').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Generado */}
      <div className="bg-brand-card border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors shadow-metal">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Generado
          </span>
          <div className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            ${totalGenerado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-brand-orange font-mono font-semibold">ARS</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
          <span>Pagos únicos + suscripciones</span>
        </p>
      </div>

      {/* 2. MRR (Mantenimientos) */}
      <div className="bg-brand-card border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors shadow-metal">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            MRR Mensual
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Repeat className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            ${mrr.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 font-mono">/mes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          ARR Proyectado: <span className="text-slate-200 font-semibold font-mono">${(mrr * 12).toLocaleString('es-AR', { maximumFractionDigits: 0 })}/año</span>
        </p>
      </div>

      {/* 3. Renovación de Dominios */}
      <div className={`rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors border shadow-metal ${
        expiringDomains.length > 0 
          ? 'bg-brand-card border-brand-orange/40 shadow-ember-sm' 
          : 'bg-brand-card border-brand-border hover:border-brand-borderLight'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dominios a Renovar
          </span>
          <div className={`p-2 rounded-lg border ${
            expiringDomains.length > 0
              ? 'bg-brand-orange/15 text-brand-orange border-brand-orange/30'
              : 'bg-brand-surface text-slate-400 border-brand-border'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
            expiringDomains.length > 0 ? 'text-brand-orange' : 'text-white'
          }`}>
            {expiringDomains.length}
          </span>
          <span className="text-xs text-slate-400">en ≤ 30 días</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {expiringDomains.length === 0 ? 'Sin alertas urgentes' : '¡Requiere atención inmediata!'}
        </p>
      </div>

      {/* 4. Total Proyectos */}
      <div className="bg-brand-card border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors shadow-metal">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Proyectos Activos
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {projects.length}
          </span>
          <span className="text-xs text-slate-400">registrados</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
          <span className="text-slate-300 font-medium">{landingsCount} Landings</span>
          <span>•</span>
          <span className="text-slate-300 font-medium">{sistemasCount} Sistemas</span>
        </div>
      </div>
    </div>
  );
}
