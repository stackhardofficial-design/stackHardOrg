'use client';

import React from 'react';
import { 
  ExternalLink, 
  Calendar, 
  Server, 
  Database, 
  Mail, 
  CreditCard, 
  DollarSign, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface ProjectCardProps {
  project: ProjectWithPayments;
  onEdit: (project: ProjectWithPayments) => void;
  onDelete: (id: string) => void;
  onManagePayments: (project: ProjectWithPayments) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onManagePayments }: ProjectCardProps) {
  // Cálculo de días restantes de dominio
  let domainStatusText = 'Sin dominio';
  let domainStatusColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
  let daysRemaining: number | null = null;

  if (project.domain_name) {
    if (!project.domain_renews) {
      domainStatusText = 'No renueva';
      domainStatusColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
    } else if (project.domain_renewal_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const renewDate = new Date(project.domain_renewal_date + 'T00:00:00');
      const diffTime = renewDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        domainStatusText = `Venció hace ${Math.abs(daysRemaining)}d`;
        domainStatusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      } else if (daysRemaining === 0) {
        domainStatusText = 'Vence hoy';
        domainStatusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      } else if (daysRemaining <= 15) {
        domainStatusText = `Vence en ${daysRemaining}d`;
        domainStatusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      } else if (daysRemaining <= 30) {
        domainStatusText = `Vence en ${daysRemaining}d`;
        domainStatusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      } else {
        domainStatusText = `${daysRemaining}d restantes`;
        domainStatusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      }
    } else {
      domainStatusText = 'Fecha no definida';
      domainStatusColor = 'text-slate-400 bg-slate-800 border-slate-700';
    }
  }

  // Pagos completados
  const totalPagado = project.payments?.reduce((sum, p) => sum + (p.status === 'completado' ? Number(p.amount) : 0), 0) || 0;
  const countPayments = project.payments?.length || 0;

  // Badge tipo de proyecto
  const typeBadgeColors = {
    landing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    sistema: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ecommerce: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    saas: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    otro: 'bg-slate-700/40 text-slate-300 border-slate-600',
  }[project.type] || 'bg-slate-700/40 text-slate-300 border-slate-600';

  const typeLabels = {
    landing: 'Landing Page',
    sistema: 'Sistema Web',
    ecommerce: 'E-commerce',
    saas: 'SaaS App',
    otro: 'Otro',
  }[project.type] || project.type;

  return (
    <div className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md">
      <div>
        {/* Encabezado: Tipo, Estado y Acciones */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeBadgeColors}`}>
              {typeLabels}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              project.status === 'activo' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : project.status === 'entregado'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : project.status === 'en_desarrollo'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Editar proyecto"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?`)) {
                  onDelete(project.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nombre y Cliente */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight line-clamp-1">
              {project.name}
            </h3>
            {project.url && (
              <a
                href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5 mt-0.5"
                title="Abrir enlace"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {project.client_name && (
            <p className="text-xs text-slate-400 mt-0.5">Cliente: <span className="text-slate-300 font-medium">{project.client_name}</span></p>
          )}
        </div>

        {/* Sección Dominio */}
        <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800/80 mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Dominio:
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${domainStatusColor}`}>
              {domainStatusText}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-200 font-mono font-medium truncate max-w-[170px]">
              {project.domain_name || 'No configurado'}
            </span>
            {project.domain_renews && project.domain_renewal_date && (
              <span className="text-slate-400 text-[11px]">
                {project.domain_renewal_date}
              </span>
            )}
          </div>
          {project.domain_registrar && (
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Registrador: {project.domain_registrar}</span>
              {Number(project.domain_cost) > 0 && <span>${project.domain_cost}/año</span>}
            </div>
          )}
        </div>

        {/* Infraestructura y Cuentas de Google */}
        <div className="space-y-1.5 text-xs mb-3 text-slate-300">
          {project.google_account && (
            <div className="flex items-center gap-2 bg-slate-800/40 px-2 py-1.5 rounded-md border border-slate-800">
              <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-slate-400 shrink-0">Google:</span>
              <span className="text-slate-200 font-mono text-[11px] truncate">{project.google_account}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {project.hosting_provider && (
              <div className="flex items-center gap-1.5 bg-slate-800/30 px-2 py-1 rounded border border-slate-800/60 text-[11px]">
                <Server className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{project.hosting_provider}</span>
              </div>
            )}
            {project.db_provider && (
              <div className="flex items-center gap-1.5 bg-slate-800/30 px-2 py-1 rounded border border-slate-800/60 text-[11px]">
                <Database className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{project.db_provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cobros y Finanzas */}
        <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/70 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Cobro:</span>
            <span className="capitalize text-slate-200 font-medium">
              {project.billing_type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            {Number(project.one_time_price) > 0 && (
              <div>
                <span className="text-[11px] text-slate-500 block">Pago único:</span>
                <span className="font-semibold text-emerald-400">${project.one_time_price}</span>
              </div>
            )}
            {Number(project.recurring_amount) > 0 && (
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Mantenimiento:</span>
                <span className="font-semibold text-indigo-400">
                  ${project.recurring_amount}/{project.recurring_period === 'mensual' ? 'mes' : 'año'}
                </span>
              </div>
            )}
          </div>

          {project.next_billing_date && (
            <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                Próx. cobro:
              </span>
              <span className="text-slate-300 font-mono">{project.next_billing_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer de la Tarjeta con Registro de Pagos */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-slate-500 text-[11px] block">Cobrado registrado:</span>
          <span className="font-bold text-white text-sm">
            ${totalPagado > 0 ? totalPagado : Number(project.one_time_price || 0)}
          </span>
        </div>

        <button
          onClick={() => onManagePayments(project)}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white transition-colors border border-slate-700"
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pagos ({countPayments})</span>
        </button>
      </div>
    </div>
  );
}
