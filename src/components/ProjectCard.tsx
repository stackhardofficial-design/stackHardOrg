'use client';

import React from 'react';
import { 
  ExternalLink, 
  Server, 
  Database, 
  Mail, 
  Clock, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Receipt,
  Globe,
  Phone,
  Check
} from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface ProjectCardProps {
  project: ProjectWithPayments;
  onEdit: (project: ProjectWithPayments) => void;
  onDelete: (id: string) => void;
  onManagePayments: (project: ProjectWithPayments) => void;
  onQuickMarkMonthlyPaid?: (project: ProjectWithPayments) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onManagePayments, onQuickMarkMonthlyPaid }: ProjectCardProps) {
  // Cálculo de días restantes de dominio
  let domainStatusText = 'Sin dominio';
  let domainStatusBadge = 'text-slate-400 bg-brand-surface border-brand-border';
  let daysRemaining: number | null = null;

  if (project.domain_name) {
    if (!project.domain_renews) {
      domainStatusText = 'No renueva';
      domainStatusBadge = 'text-slate-400 bg-brand-surface border-brand-border';
    } else if (project.domain_renewal_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const renewDate = new Date(project.domain_renewal_date + 'T00:00:00');
      const diffTime = renewDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        domainStatusText = `Venció hace ${Math.abs(daysRemaining)}d`;
        domainStatusBadge = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      } else if (daysRemaining === 0) {
        domainStatusText = '¡Vence Hoy!';
        domainStatusBadge = 'text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse';
      } else if (daysRemaining <= 15) {
        domainStatusText = `Vence en ${daysRemaining}d`;
        domainStatusBadge = 'text-brand-orange bg-brand-orange/15 border-brand-orange/40';
      } else if (daysRemaining <= 30) {
        domainStatusText = `Vence en ${daysRemaining}d`;
        domainStatusBadge = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      } else {
        domainStatusText = `${daysRemaining}d restantes`;
        domainStatusBadge = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      }
    } else {
      domainStatusText = 'Fecha pendiente';
      domainStatusBadge = 'text-slate-400 bg-brand-surface border-brand-border';
    }
  }

  // Pagos completados
  const totalPagado = project.payments?.reduce(
    (sum, p) => sum + (p.status === 'completado' ? Number(p.amount) : 0),
    0
  ) || 0;
  const countPayments = project.payments?.length || 0;

  // Badges estilizados
  const typeLabels = {
    landing: 'LANDING PAGE',
    sistema: 'SISTEMA WEB',
    ecommerce: 'E-COMMERCE',
    saas: 'SAAS APP',
    otro: 'PROYECTO',
  }[project.type] || project.type.toUpperCase();

  const statusStyles = {
    activo: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    entregado: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    en_desarrollo: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
    pausado: 'text-slate-400 bg-slate-800 border-slate-700',
    cancelado: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }[project.status] || 'text-slate-400 bg-slate-800 border-slate-700';

  return (
    <div className="bg-brand-card hover:bg-brand-cardHover border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-metal group">
      <div>
        {/* Cabecera: Badges y Acciones */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-brand-surface text-slate-300 border border-brand-border">
              {typeLabels}
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${statusStyles}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-brand-surface rounded-md transition-colors"
              title="Editar proyecto"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar "${project.name}"?`)) {
                  onDelete(project.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-brand-surface rounded-md transition-colors"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nombre y Cliente */}
        <div className="mb-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-brand-orange transition-colors line-clamp-1">
              {project.name}
            </h3>
            {project.url && (
              <a
                href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-brand-orange transition-colors p-0.5 shrink-0"
                title="Abrir sitio web"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {project.client_name && (
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <p>
                Cliente: <span className="text-slate-200 font-semibold">{project.client_name}</span>
              </p>
              {project.client_phone && (
                <a
                  href={`https://wa.me/${project.client_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  title="Abrir WhatsApp / Llamar"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{project.client_phone}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sección Dominio */}
        <div className="bg-brand-dark/90 rounded-lg p-3 border border-brand-border mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-brand-orange" />
              Dominio:
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${domainStatusBadge}`}>
              {domainStatusText}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-200 font-mono font-semibold truncate max-w-[180px]">
              {project.domain_name || 'No configurado'}
            </span>
            {project.domain_renews && project.domain_renewal_date && (
              <span className="text-slate-400 font-mono text-[11px]">
                {project.domain_renewal_date}
              </span>
            )}
          </div>

          {project.domain_registrar && (
            <div className="text-[11px] text-slate-500 font-mono flex justify-between pt-0.5 border-t border-brand-border/60">
              <span>Registrador: {project.domain_registrar}</span>
              {Number(project.domain_cost) > 0 && <span>${project.domain_cost}/año</span>}
            </div>
          )}
        </div>

        {/* Cuentas de Google e Infraestructura (Servidor & BD Separados) */}
        <div className="space-y-1.5 text-xs mb-3.5">
          {/* Servidor / Hosting */}
          <div className="bg-brand-surface/70 p-2 rounded-lg border border-brand-border space-y-0.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Server className="w-3 h-3 text-brand-orange shrink-0" />
                <span>Servidor:</span>
                <span className="text-slate-200 font-mono font-normal">{project.hosting_provider || 'Vercel'}</span>
              </span>
            </div>
            {(project.google_account_server || project.google_account) && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pl-4 truncate">
                <Mail className="w-3 h-3 text-brand-orange shrink-0" />
                <span className="truncate">{project.google_account_server || project.google_account}</span>
              </div>
            )}
          </div>

          {/* Base de Datos */}
          <div className="bg-brand-surface/70 p-2 rounded-lg border border-brand-border space-y-0.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Database className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Base de Datos:</span>
                <span className="text-slate-200 font-mono font-normal">{project.db_provider || 'Supabase'}</span>
              </span>
            </div>
            {(project.google_account_db || project.google_account) && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pl-4 truncate">
                <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{project.google_account_db || project.google_account}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cobros y Finanzas con Regla de cobro antes del día 10 */}
        <div className="bg-brand-dark/60 rounded-lg p-2.5 border border-brand-border space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Esquema:</span>
            <span className="capitalize text-slate-200 font-medium">
              {project.billing_type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-brand-border/60">
            {Number(project.one_time_price) > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Pago Único</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${project.one_time_price}
                </span>
              </div>
            )}

            {Number(project.recurring_amount) > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mantenimiento</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  ${project.recurring_amount}/{project.recurring_period === 'mensual' ? 'mes' : 'año'}
                </span>
              </div>
            )}
          </div>

          {/* Estado de Cobro Mensual (Regla: antes del día 10 de cada mes) */}
          {Number(project.recurring_amount) > 0 && project.recurring_period === 'mensual' && (() => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();

            const isPaidThisMonth = Boolean(
              project.payments?.some((p) => {
                if (p.payment_type !== 'mantenimiento') return false;
                const pDate = new Date(p.payment_date + 'T00:00:00');
                return pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth && p.status === 'completado';
              })
            );

            return (
              <div className="pt-2 border-t border-brand-border/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Mes actual:</span>
                  {isPaidThisMonth ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Cobrado</span>
                    </span>
                  ) : currentDay <= 10 ? (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Cobrar antes del 10
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      Atrasado (Venció el 10)
                    </span>
                  )}
                </div>

                {!isPaidThisMonth && onQuickMarkMonthlyPaid && (
                  <button
                    onClick={() => onQuickMarkMonthlyPaid(project)}
                    className="w-full mt-1 py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3 h-3 text-amber-400" />
                    <span>Marcar Cobrado este mes (+${project.recurring_amount})</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Pie de Tarjeta con Registro de Cobros */}
      <div className="mt-3.5 pt-3 border-t border-brand-border flex items-center justify-between">
        <div className="text-xs">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Cobrado registrado</span>
          <span className="font-mono font-extrabold text-white text-base">
            ${totalPagado > 0 ? totalPagado : Number(project.one_time_price || 0)} <span className="text-xs text-slate-400">USD</span>
          </span>
        </div>

        <button
          onClick={() => onManagePayments(project)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-slate-200 hover:text-white border border-brand-border transition-colors active:scale-95"
        >
          <Receipt className="w-3.5 h-3.5 text-brand-orange" />
          <span>Pagos ({countPayments})</span>
        </button>
      </div>
    </div>
  );
}
