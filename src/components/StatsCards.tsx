'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Repeat,
  ShieldAlert,
  FolderKanban,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Globe,
  Receipt,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ProjectWithPayments } from '@/types';

interface StatsCardsProps {
  projects: ProjectWithPayments[];
}

type DatePreset = 'este_mes' | 'mes_pasado' | 'ultimos_30' | 'este_ano' | 'historico' | 'personalizado';

export function StatsCards({ projects }: StatsCardsProps) {
  // Inicialización de fechas: Por defecto Mes Actual
  const getInitialDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 a 11

    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    return { firstDay, lastDay };
  };

  const initialRange = getInitialDates();
  const [datePreset, setDatePreset] = useState<DatePreset>('este_mes');
  const [startDate, setStartDate] = useState<string>(initialRange.firstDay);
  const [endDate, setEndDate] = useState<string>(initialRange.lastDay);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailFilter, setDetailFilter] = useState<'todos' | 'pago_unico' | 'mantenimiento' | 'dominio'>('todos');

  // Función para aplicar presets rápidos
  const handleSelectPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (preset === 'este_mes') {
      const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'mes_pasado') {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const firstDay = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
      const lastDay = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'ultimos_30') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'este_ano') {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    } else if (preset === 'historico') {
      setStartDate('2020-01-01');
      setEndDate('2035-12-31');
    }
  };

  // 1. Recolección de todos los cobros dentro del rango de fechas
  const {
    totalGeneradoEnRango,
    totalPagosUnicos,
    countPagosUnicos,
    totalMantenimientos,
    countMantenimientos,
    totalDominios,
    countDominios,
    totalExtras,
    cobrosDelPeriodo,
  } = useMemo(() => {
    interface ItemCobro {
      id: string;
      projectId: string;
      projectName: string;
      clientName?: string | null;
      concept: string;
      amount: number;
      paymentDate: string;
      paymentType: 'pago_unico' | 'mantenimiento' | 'dominio' | 'extra';
      isDirectProjectUpfront?: boolean;
    }

    const items: ItemCobro[] = [];

    projects.forEach((proj) => {
      const payments = proj.payments || [];
      const hasUpfrontPayments = payments.some((p) => p.payment_type === 'pago_unico' && p.status === 'completado');

      // Pagos explícitamente registrados en la tabla payments
      payments.forEach((pay) => {
        if (pay.status === 'completado' && pay.payment_date) {
          const inRange =
            (!startDate || pay.payment_date >= startDate) &&
            (!endDate || pay.payment_date <= endDate);

          if (inRange) {
            items.push({
              id: pay.id,
              projectId: proj.id,
              projectName: proj.name,
              clientName: proj.client_name,
              concept: pay.concept,
              amount: Number(pay.amount) || 0,
              paymentDate: pay.payment_date,
              paymentType: pay.payment_type,
            });
          }
        }
      });

      // Si el proyecto tiene precio único pactado y no se cargaron pagos únicos aún en payments,
      // pero su fecha de creación cae en el rango, se contabiliza como pago único generado del proyecto
      if (!hasUpfrontPayments && Number(proj.one_time_price || 0) > 0 && proj.created_at) {
        const createdDate = proj.created_at.split('T')[0];
        const inRange =
          (!startDate || createdDate >= startDate) &&
          (!endDate || createdDate <= endDate);

        if (inRange) {
          items.push({
            id: `proj-upfront-${proj.id}`,
            projectId: proj.id,
            projectName: proj.name,
            clientName: proj.client_name,
            concept: `Precio de Entrega / Landing (${proj.name})`,
            amount: Number(proj.one_time_price),
            paymentDate: createdDate,
            paymentType: 'pago_unico',
            isDirectProjectUpfront: true,
          });
        }
      }
    });

    // Ordenar de más reciente a más antiguo
    items.sort((a, b) => (b.paymentDate > a.paymentDate ? 1 : -1));

    // Desglose
    let totalGen = 0;
    let tUnicos = 0;
    let cUnicos = 0;
    let tMant = 0;
    let cMant = 0;
    let tDom = 0;
    let cDom = 0;
    let tExt = 0;

    items.forEach((item) => {
      totalGen += item.amount;
      if (item.paymentType === 'pago_unico') {
        tUnicos += item.amount;
        cUnicos += 1;
      } else if (item.paymentType === 'mantenimiento') {
        tMant += item.amount;
        cMant += 1;
      } else if (item.paymentType === 'dominio') {
        tDom += item.amount;
        cDom += 1;
      } else {
        tExt += item.amount;
      }
    });

    return {
      totalGeneradoEnRango: totalGen,
      totalPagosUnicos: tUnicos,
      countPagosUnicos: cUnicos,
      totalMantenimientos: tMant,
      countMantenimientos: cMant,
      totalDominios: tDom,
      countDominios: cDom,
      totalExtras: tExt,
      cobrosDelPeriodo: items,
    };
  }, [projects, startDate, endDate]);

  // 2. MRR (Mantenimientos mensuales recurrentes)
  const mrr = useMemo(() => {
    return projects.reduce((acc, p) => {
      if (p.status === 'activo' || p.status === 'entregado') {
        if (p.recurring_period === 'mensual') {
          return acc + Number(p.recurring_amount || 0);
        } else if (p.recurring_period === 'anual') {
          return acc + Number(p.recurring_amount || 0) / 12;
        }
      }
      return acc;
    }, 0);
  }, [projects]);

  // 3. Dominios por renovar (≤ 30 días o vencidos)
  const expiringDomains = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    return projects.filter((p) => {
      if (!p.domain_renews || !p.domain_renewal_date) return false;
      const renewalDate = new Date(p.domain_renewal_date + 'T00:00:00');
      return renewalDate <= thirtyDaysLater;
    });
  }, [projects]);

  const landingsCount = projects.filter((p) => p.type === 'landing').length;
  const sistemasCount = projects.filter((p) => p.type === 'sistema' || p.type === 'saas').length;

  // Filtrado de la lista detallada de cobros si el usuario selecciona una pestaña
  const filteredCobros = cobrosDelPeriodo.filter((c) => {
    if (detailFilter === 'todos') return true;
    return c.paymentType === detailFilter;
  });

  return (
    <div className="space-y-4 mb-6">
      {/* ========================================================================= */}
      {/* BARRA DE FILTRO POR RANGO DE FECHAS (POR DEFAULT MES ACTUAL)              */}
      {/* ========================================================================= */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-3 sm:p-4 shadow-metal">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Período de Facturación & Cobros
              </span>
              <p className="text-[11px] text-slate-400">
                Mostrando datos del:{' '}
                <strong className="text-brand-orange font-mono">
                  {startDate || 'Inicio'}
                </strong>{' '}
                al{' '}
                <strong className="text-brand-orange font-mono">
                  {endDate || 'Hoy'}
                </strong>
              </p>
            </div>
          </div>

          {/* Accesos rápidos (Presets) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSelectPreset('este_mes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                datePreset === 'este_mes'
                  ? 'bg-brand-orange text-black font-bold shadow-ember-sm'
                  : 'bg-brand-dark hover:bg-brand-surface text-slate-300 border border-brand-border'
              }`}
            >
              Este Mes (Default)
            </button>

            <button
              onClick={() => handleSelectPreset('mes_pasado')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                datePreset === 'mes_pasado'
                  ? 'bg-brand-orange text-black font-bold shadow-ember-sm'
                  : 'bg-brand-dark hover:bg-brand-surface text-slate-300 border border-brand-border'
              }`}
            >
              Mes Pasado
            </button>

            <button
              onClick={() => handleSelectPreset('ultimos_30')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                datePreset === 'ultimos_30'
                  ? 'bg-brand-orange text-black font-bold shadow-ember-sm'
                  : 'bg-brand-dark hover:bg-brand-surface text-slate-300 border border-brand-border'
              }`}
            >
              Últimos 30 días
            </button>

            <button
              onClick={() => handleSelectPreset('este_ano')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                datePreset === 'este_ano'
                  ? 'bg-brand-orange text-black font-bold shadow-ember-sm'
                  : 'bg-brand-dark hover:bg-brand-surface text-slate-300 border border-brand-border'
              }`}
            >
              Este Año
            </button>

            <button
              onClick={() => handleSelectPreset('historico')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                datePreset === 'historico'
                  ? 'bg-brand-orange text-black font-bold shadow-ember-sm'
                  : 'bg-brand-dark hover:bg-brand-surface text-slate-300 border border-brand-border'
              }`}
            >
              Histórico
            </button>

            {/* Inputs personalizados de fecha */}
            <div className="flex items-center gap-1 bg-brand-dark border border-brand-border rounded-lg px-2 py-0.5 ml-auto sm:ml-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('personalizado');
                }}
                className="bg-transparent text-[11px] text-white focus:outline-none font-mono py-0.5"
                title="Fecha Desde"
              />
              <span className="text-slate-500 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('personalizado');
                }}
                className="bg-transparent text-[11px] text-white focus:outline-none font-mono py-0.5"
                title="Fecha Hasta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 TARJETAS DE MÉTRICAS (PAGO GENERADO EN PESOS CON PAGOS ÚNICOS)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Pago Generado (en Pesos ARS y con Pagos Únicos visibilizados) */}
        <div className="bg-brand-card border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 relative overflow-hidden transition-all shadow-metal">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pago Generado (Período)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Monto Principal en Pesos */}
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              ${totalGeneradoEnRango.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-brand-orange font-mono font-bold">ARS</span>
          </div>

          {/* Desglose destacado con Pagos Únicos */}
          <div className="mt-3 pt-2.5 border-t border-brand-border/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
                <span>Pagos Únicos:</span>
              </span>
              <span className="font-mono font-bold text-white">
                ${totalPagosUnicos.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                <span className="text-[10px] text-brand-orange ml-1 font-normal">({countPagosUnicos})</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3 h-3 text-amber-400" />
                <span>Mantenimientos:</span>
              </span>
              <span className="font-mono text-slate-200">
                ${totalMantenimientos.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                <span className="text-[10px] text-slate-400 ml-1">({countMantenimientos})</span>
              </span>
            </div>

            {(totalDominios > 0 || totalExtras > 0) && (
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>Dominios / Extras:</span>
                </span>
                <span className="font-mono text-slate-200">
                  ${(totalDominios + totalExtras).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                </span>
              </div>
            )}
          </div>

          {/* Botón para ver desglose de pagos del período */}
          <button
            onClick={() => setIsDetailOpen(!isDetailOpen)}
            className="w-full mt-3 py-1.5 px-2 rounded-lg bg-brand-surface hover:bg-brand-border text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-brand-border"
          >
            <Receipt className="w-3.5 h-3.5 text-brand-orange" />
            <span>{isDetailOpen ? 'Ocultar Detalle' : `Ver Pagos del Mes (${cobrosDelPeriodo.length})`}</span>
            {isDetailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 2. MRR (Mantenimientos recurrentes) */}
        <div className="bg-brand-card border border-brand-border hover:border-brand-borderLight rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors shadow-metal">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              MRR Recurrente
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              ${mrr.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-brand-orange font-mono font-bold">ARS</span>
            <span className="text-xs text-slate-400 font-mono">/mes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ARR Anual Proyectado:{' '}
            <span className="text-slate-200 font-semibold font-mono">
              ${(mrr * 12).toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS
            </span>
          </p>
        </div>

        {/* 3. Renovación de Dominios */}
        <div
          className={`rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors border shadow-metal ${
            expiringDomains.length > 0
              ? 'bg-brand-card border-brand-orange/40 shadow-ember-sm'
              : 'bg-brand-card border-brand-border hover:border-brand-borderLight'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dominios a Renovar
            </span>
            <div
              className={`p-2 rounded-lg border ${
                expiringDomains.length > 0
                  ? 'bg-brand-orange/15 text-brand-orange border-brand-orange/30'
                  : 'bg-brand-surface text-slate-400 border-brand-border'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                expiringDomains.length > 0 ? 'text-brand-orange' : 'text-white'
              }`}
            >
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
              Proyectos Registrados
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {projects.length}
            </span>
            <span className="text-xs text-slate-400">totales</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
            <span className="text-slate-300 font-medium">{landingsCount} Landings</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{sistemasCount} Sistemas</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL DESPLEGABLE: DETALLE Y LISTA DE PAGOS ÚNICOS Y COBROS DEL PERÍODO  */}
      {/* ========================================================================= */}
      {isDetailOpen && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 sm:p-5 shadow-metal animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-orange" />
                <span>Desglose de Cobros Generados en el Período</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Total cobrado en este rango:{' '}
                <strong className="text-emerald-400 font-mono">
                  ${totalGeneradoEnRango.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                </strong>{' '}
                en {cobrosDelPeriodo.length} transacción(es)
              </p>
            </div>

            {/* Pestañas de Filtro del Desglose */}
            <div className="flex items-center gap-1 bg-brand-dark p-1 rounded-lg border border-brand-border self-start sm:self-auto text-xs">
              <button
                onClick={() => setDetailFilter('todos')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  detailFilter === 'todos'
                    ? 'bg-brand-orange text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({cobrosDelPeriodo.length})
              </button>
              <button
                onClick={() => setDetailFilter('pago_unico')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                  detailFilter === 'pago_unico'
                    ? 'bg-brand-orange text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Pagos Únicos ({countPagosUnicos})</span>
              </button>
              <button
                onClick={() => setDetailFilter('mantenimiento')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                  detailFilter === 'mantenimiento'
                    ? 'bg-brand-orange text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Repeat className="w-3 h-3" />
                <span>Mantenimientos ({countMantenimientos})</span>
              </button>
              <button
                onClick={() => setDetailFilter('dominio')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                  detailFilter === 'dominio'
                    ? 'bg-brand-orange text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Dominios ({countDominios})</span>
              </button>
            </div>
          </div>

          {/* Lista de movimientos */}
          <div className="mt-3">
            {filteredCobros.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No hay transacciones registradas de este tipo dentro del período seleccionado.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredCobros.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-brand-dark border border-brand-border hover:border-brand-borderLight text-xs transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.projectName}</span>
                        {item.clientName && (
                          <span className="text-slate-400 text-xs">({item.clientName})</span>
                        )}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            item.paymentType === 'pago_unico'
                              ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30'
                              : item.paymentType === 'mantenimiento'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {item.paymentType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-2">
                        <span>{item.concept}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">Fecha: {item.paymentDate}</span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="font-extrabold text-emerald-400 font-mono text-sm block">
                        +${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
