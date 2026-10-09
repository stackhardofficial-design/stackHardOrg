'use client';

import React from 'react';
import { AlertTriangle, Clock, Calendar, ShieldAlert, ArrowRight } from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface UpcomingRenewalsProps {
  projects: ProjectWithPayments[];
  onSelectProject: (project: ProjectWithPayments) => void;
}

export function UpcomingRenewals({ projects, onSelectProject }: UpcomingRenewalsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dominios que renuevan en los próximos 45 días o vencidos
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

  // Próximos cobros de mantenimiento en los próximos 30 días
  const billingAlerts = projects
    .filter((p) => p.recurring_amount > 0 && p.next_billing_date)
    .map((p) => {
      const billDate = new Date(p.next_billing_date + 'T00:00:00');
      const diffTime = billDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { project: p, days, billDate: p.next_billing_date };
    })
    .filter((item) => item.days <= 30)
    .sort((a, b) => a.days - b.days);

  if (domainAlerts.length === 0 && billingAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Alertas de Dominios */}
      {domainAlerts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Dominios a Renovar Próximamente ({domainAlerts.length})</span>
          </div>
          <div className="space-y-2">
            {domainAlerts.map(({ project, days, renewalDate }) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="flex items-center justify-between bg-slate-900/80 hover:bg-slate-800 p-2.5 rounded-lg border border-amber-500/20 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono text-xs text-white font-medium block">
                    {project.domain_name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {project.name} {project.domain_registrar ? `(${project.domain_registrar})` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold block ${
                    days <= 0 ? 'text-rose-400' : days <= 15 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {days < 0 ? `Vencido (${Math.abs(days)}d)` : days === 0 ? '¡Vence Hoy!' : `En ${days} días`}
                  </span>
                  <span className="text-[10px] text-slate-400">{renewalDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas de Cobros de Mantenimiento */}
      {billingAlerts.length > 0 && (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2.5">
            <Clock className="w-4 h-4" />
            <span>Próximos Cobros de Mantenimiento ({billingAlerts.length})</span>
          </div>
          <div className="space-y-2">
            {billingAlerts.map(({ project, days, billDate }) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="flex items-center justify-between bg-slate-900/80 hover:bg-slate-800 p-2.5 rounded-lg border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-xs text-white font-medium block">
                    {project.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cliente: {project.client_name || 'Sin especificar'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-300 block">
                    +${project.recurring_amount} USD
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {days < 0 ? `Atrasado (${Math.abs(days)}d)` : days === 0 ? 'Cobrar Hoy' : `En ${days} días`} ({billDate})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
