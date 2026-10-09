'use client';

import React from 'react';
import { AlertCircle, Clock, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface UpcomingRenewalsProps {
  projects: ProjectWithPayments[];
  onSelectProject: (project: ProjectWithPayments) => void;
}

export function UpcomingRenewals({ projects, onSelectProject }: UpcomingRenewalsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
      {/* 1. Alertas de Renovación de Dominio */}
      {domainAlerts.length > 0 && (
        <div className="bg-brand-card border border-brand-orange/30 rounded-xl p-4 shadow-metal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Dominios por Renovar ({domainAlerts.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
              Acción requerida
            </span>
          </div>

          <div className="space-y-2">
            {domainAlerts.map(({ project, days, renewalDate }) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group flex items-center justify-between bg-brand-dark/80 hover:bg-brand-surface p-3 rounded-lg border border-brand-border hover:border-brand-orange/40 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white font-bold group-hover:text-brand-orange transition-colors">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Próximos Cobros de Mantenimiento */}
      {billingAlerts.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-metal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Próximos Cobros de Mantenimiento ({billingAlerts.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
              Facturación
            </span>
          </div>

          <div className="space-y-2">
            {billingAlerts.map(({ project, days, billDate }) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group flex items-center justify-between bg-brand-dark/80 hover:bg-brand-surface p-3 rounded-lg border border-brand-border hover:border-amber-500/40 cursor-pointer transition-all"
              >
                <div>
                  <span className="text-xs text-white font-bold group-hover:text-amber-400 transition-colors block">
                    {project.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Cliente: {project.client_name || 'Sin especificar'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    +${project.recurring_amount} USD
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
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
