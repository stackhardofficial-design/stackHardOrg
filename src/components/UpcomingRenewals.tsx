'use client';

import React from 'react';
import { AlertCircle, Clock, ShieldAlert, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface UpcomingRenewalsProps {
  projects: ProjectWithPayments[];
  onSelectProject: (project: ProjectWithPayments) => void;
  onQuickMarkMonthlyPaid?: (project: ProjectWithPayments) => void;
  onRenewDomain?: (project: ProjectWithPayments) => void;
  onToggleDomainRenewal?: (project: ProjectWithPayments, renews: boolean) => void;
}

export function UpcomingRenewals({ 
  projects, 
  onSelectProject, 
  onQuickMarkMonthlyPaid,
  onRenewDomain,
  onToggleDomainRenewal
}: UpcomingRenewalsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Dominios que renuevan en los próximos 45 días o ya vencieron
  const domainAlerts = projects
    .filter((p) => p.domain_renews && p.domain_name && p.domain_renewal_date)
    .map((p) => {
      const renewalDate = new Date(p.domain_renewal_date + 'T00:00:00');
      const diffTime = renewalDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { project: p, days, renewalDate: p.domain_renewal_date };
    })
    .filter((item) => item.days <= 45)
    .sort((a, b) => a.days - b.days);

  // Mantenimientos mensuales que AÚN NO se han cobrado este mes (Regla: antes del día 10)
  const billingAlerts = projects
    .filter((p) => Number(p.recurring_amount) > 0 && p.recurring_period === 'mensual')
    .filter((p) => {
      // Verificar si ya tiene pago de mantenimiento registrado este mes
      const hasPaid = p.payments?.some((pay) => {
        if (pay.payment_type !== 'mantenimiento') return false;
        const payDate = new Date(pay.payment_date + 'T00:00:00');
        return payDate.getFullYear() === currentYear && payDate.getMonth() === currentMonth && pay.status === 'completado';
      });
      return !hasPaid;
    })
    .map((p) => {
      // Días hasta el día 10 del mes en curso
      const daysUntilTen = 10 - currentDay;
      return { project: p, daysUntilTen };
    })
    .sort((a, b) => a.daysUntilTen - b.daysUntilTen);

  if (domainAlerts.length === 0 && billingAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Alertas de Renovación de Dominio */}
      {domainAlerts.length > 0 && (
        <div className="bg-brand-card border border-brand-orange/30 rounded-xl p-4 shadow-metal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Dominios por Renovar ({domainAlerts.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
              Acción anual requerida
            </span>
          </div>

          <div className="space-y-2">
            {domainAlerts.map(({ project, days, renewalDate }) => (
              <div
                key={project.id}
                className="flex items-center justify-between bg-brand-dark/80 p-3 rounded-lg border border-brand-border"
              >
                <div onClick={() => onSelectProject(project)} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white font-bold hover:text-brand-orange transition-colors">
                      {project.domain_name}
                    </span>
                    {project.domain_registrar && (
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                        {project.domain_registrar}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {project.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${
                      days < 0 
                        ? 'text-rose-500' 
                        : days <= 15 
                        ? 'text-brand-orange' 
                        : 'text-amber-400'
                    }`}>
                      {days < 0 ? `Vencido (${Math.abs(days)}d)` : days === 0 ? '¡Vence Hoy!' : `En ${days} días`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{renewalDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onRenewDomain && (
                      <button
                        onClick={() => onRenewDomain(project)}
                        title="Renovar por 1 año más"
                        className="px-2 py-1 rounded bg-brand-orange hover:bg-brand-orangeBright text-black font-bold text-[10px] uppercase font-mono tracking-wider transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Renovar +1A</span>
                      </button>
                    )}

                    {onToggleDomainRenewal && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Marcar que el dominio "${project.domain_name}" ya no se renueva?`)) {
                            onToggleDomainRenewal(project, false);
                          }
                        }}
                        title="Ya no se renueva este dominio"
                        className="p-1 text-slate-500 hover:text-slate-300 text-[10px] font-mono transition-colors"
                      >
                        ✕ No renueva
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cobros de Mantenimiento Pendientes de este Mes (Antes del 10) */}
      {billingAlerts.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-metal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Mantenimientos Pendientes este Mes ({billingAlerts.length})</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
              Vence el 10
            </span>
          </div>

          <div className="space-y-2">
            {billingAlerts.map(({ project, daysUntilTen }) => (
              <div
                key={project.id}
                className="flex items-center justify-between bg-brand-dark/80 p-3 rounded-lg border border-brand-border"
              >
                <div onClick={() => onSelectProject(project)} className="cursor-pointer">
                  <span className="text-xs text-white font-bold hover:text-amber-400 transition-colors block">
                    {project.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Cliente: {project.client_name || 'Sin especificar'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      +${project.recurring_amount} ARS
                    </span>
                    <span className={`text-[10px] font-mono ${
                      daysUntilTen < 0 ? 'text-rose-400 font-bold' : daysUntilTen === 0 ? 'text-amber-400 font-bold' : 'text-slate-400'
                    }`}>
                      {daysUntilTen < 0 ? `Atrasado (${Math.abs(daysUntilTen)}d)` : daysUntilTen === 0 ? '¡Vence Hoy (día 10)!' : `Vence en ${daysUntilTen} días`}
                    </span>
                  </div>

                  {onQuickMarkMonthlyPaid && (
                    <button
                      onClick={() => onQuickMarkMonthlyPaid(project)}
                      title="Marcar cobrado este mes"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/30 font-semibold text-[11px] transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Cobrado</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
