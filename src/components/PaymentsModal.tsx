'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  Trash2,
  CheckCircle,
  Receipt,
  Globe,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  CreditCard,
  History,
  Sparkles,
} from 'lucide-react';
import { ProjectWithPayments, Payment } from '@/types';
import { supabase } from '@/lib/supabase';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithPayments | null;
  onPaymentUpdated: () => void;
}

type TabType = 'mensual' | 'dominio' | 'pago_unico' | 'historial';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function PaymentsModal({ isOpen, onClose, project, onPaymentUpdated }: PaymentsModalProps) {
  const currentRealDate = new Date();
  const currentRealYear = currentRealDate.getFullYear();
  const currentRealMonth = currentRealDate.getMonth(); // 0 a 11
  const currentRealDay = currentRealDate.getDate();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (!project) return 'mensual';
    if (project.billing_type === 'mensual' || (project.billing_type === 'mixto' && Number(project.recurring_amount) > 0)) {
      return 'mensual';
    }
    if (project.billing_type === 'pago_unico' && Number(project.one_time_price) > 0) {
      return 'pago_unico';
    }
    if (project.domain_renews && Number(project.domain_cost) > 0) {
      return 'dominio';
    }
    return 'mensual';
  });

  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario de cobro extra / personalizado
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customConcept, setCustomConcept] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customType, setCustomType] = useState<'pago_unico' | 'mantenimiento' | 'dominio' | 'extra'>('extra');

  // Input para cobro parcial de pago único
  const [partialAmount, setPartialAmount] = useState('');
  const [partialConcept, setPartialConcept] = useState('Anticipo de desarrollo');

  if (!isOpen || !project) return null;

  const payments = project.payments || [];

  // Cálculos generales
  const totalCobradoGeneral = payments.reduce(
    (acc, p) => acc + (p.status === 'completado' ? Number(p.amount) : 0),
    0
  );

  const pagosUnicos = payments.filter((p) => p.payment_type === 'pago_unico' && p.status === 'completado');
  const totalPagadoUnico = pagosUnicos.reduce((acc, p) => acc + Number(p.amount), 0);
  const saldoPendienteUnico = Math.max(0, Number(project.one_time_price || 0) - totalPagadoUnico);

  // Helper para buscar pago mensual de un mes/año
  const findMonthlyPayment = (year: number, monthIndex: number) => {
    const monthPadded = String(monthIndex + 1).padStart(2, '0');
    const monthPattern = `${year}-${monthPadded}`;
    const monthName = MONTH_NAMES[monthIndex].toLowerCase();

    return payments.find((p) => {
      if (p.payment_type !== 'mantenimiento') return false;
      if (p.payment_date?.startsWith(monthPattern)) return true;
      const c = p.concept.toLowerCase();
      return c.includes(monthName) && c.includes(String(year));
    });
  };

  // Helper para buscar pago de dominio por año
  const findDomainPayment = (year: number) => {
    return payments.find((p) => {
      if (p.payment_type !== 'dominio') return false;
      if (p.payment_date?.startsWith(`${year}-`)) return true;
      return p.concept.toLowerCase().includes(String(year));
    });
  };

  // 1. Acción: Marcar mes pagado con 1 solo clic
  const handlePayMonth = async (monthIndex: number) => {
    const monthName = MONTH_NAMES[monthIndex];
    const amount = Number(project.recurring_amount) || 0;
    const paddedMonth = String(monthIndex + 1).padStart(2, '0');
    const paymentDate = `${selectedYear}-${paddedMonth}-05`; // Fecha representativa antes del 10

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept: `Mantenimiento ${monthName} ${selectedYear}`,
          amount,
          payment_date: paymentDate,
          payment_type: 'mantenimiento',
          status: 'completado',
        },
      ]);

      if (error) throw error;
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el cobro del mes');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Acción: Anular / Eliminar pago
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('¿Deseas anular este cobro registrado?')) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId);
      if (error) throw error;
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al anular el cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Acción: Renovar Dominio por año
  const handlePayDomainYear = async (year: number) => {
    const cost = Number(project.domain_cost) || 0;
    const domainName = project.domain_name || 'Dominio';
    const todayStr = new Date().toISOString().split('T')[0];

    setIsSubmitting(true);
    try {
      // 1. Insertar el pago
      const { error: pError } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept: `Renovación Dominio ${year} (${domainName})`,
          amount: cost,
          payment_date: todayStr,
          payment_type: 'dominio',
          status: 'completado',
        },
      ]);

      if (pError) throw pError;

      // 2. Si es el año actual o siguiente, actualizar la fecha en el proyecto sumando 1 año
      if (project.domain_renewal_date) {
        const parts = project.domain_renewal_date.split('-');
        if (parts.length === 3) {
          const currentExpYear = parseInt(parts[0], 10);
          if (year >= currentExpYear) {
            const nextRenewal = `${year + 1}-${parts[1]}-${parts[2]}`;
            await supabase
              .from('projects')
              .update({ domain_renewal_date: nextRenewal, updated_at: new Date().toISOString() })
              .eq('id', project.id);
          }
        }
      }

      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar la renovación del dominio');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Acción: Cobrar total o saldo restante de Pago Único
  const handlePayFullRemainingUpfront = async () => {
    if (saldoPendienteUnico <= 0) return;
    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const concept = totalPagadoUnico === 0 ? 'Pago Total Desarrollo / Landing' : 'Cancelación de Saldo Desarrollo';

      const { error } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept,
          amount: saldoPendienteUnico,
          payment_date: todayStr,
          payment_type: 'pago_unico',
          status: 'completado',
        },
      ]);

      if (error) throw error;
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Acción: Cobrar Anticipo / Parcial
  const handlePayPartialUpfront = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(partialAmount);
    if (!val || val <= 0) return;

    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept: partialConcept.trim() || 'Cobro Parcial Desarrollo',
          amount: val,
          payment_date: todayStr,
          payment_type: 'pago_unico',
          status: 'completado',
        },
      ]);

      if (error) throw error;
      setPartialAmount('');
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el anticipo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Acción: Guardar cobro manual/extra
  const handleAddCustomPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConcept.trim() || !customAmount) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept: customConcept.trim(),
          amount: parseFloat(customAmount),
          payment_date: customDate,
          payment_type: customType,
          status: 'completado',
        },
      ]);

      if (error) throw error;
      setCustomConcept('');
      setCustomAmount('');
      setIsAddingCustom(false);
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generación de lista de años para Dominios (año de inicio a 3 años adelante)
  const domainYearsList = [
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
    selectedYear + 2,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-brand-border bg-brand-dark/95 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                <Receipt className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Panel de Cobros & Facturación
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-white font-medium">{project.name}</span>
                  {project.client_name && (
                    <>
                      <span>•</span>
                      <span className="text-brand-orange">Cliente: {project.client_name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Total Cobrado</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono leading-none">
                ${totalCobradoGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-brand-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-brand-border bg-brand-dark/60 px-4 sm:px-6 overflow-x-auto scrollbar-none shrink-0 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('mensual')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'mensual'
                ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Mantenimiento Mensual</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-300">
              Corte día 10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dominio')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'dominio'
                ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Dominio Anual</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-300">
              Por Años
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pago_unico')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'pago_unico'
                ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pago Único / Desarrollo</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'historial'
                ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial ({payments.length})</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* ========================================================= */}
          {/* 1. CALENDARIO MENSUAL (CORTE EL DÍA 10)                    */}
          {/* ========================================================= */}
          {activeTab === 'mensual' && (
            <div className="space-y-4">
              {/* Barra de control y regla */}
              <div className="bg-brand-dark border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-metal">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Calendario de Cobro Mensual
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Corte Estricto: Día 10
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Monto mensual fijado:{' '}
                    <span className="text-white font-mono font-bold">
                      ${Number(project.recurring_amount || 0).toFixed(2)} ARS
                    </span>
                    {project.recurring_period !== 'mensual' && (
                      <span className="text-slate-500 ml-1.5">(Este proyecto no tiene recurrencia mensual activa)</span>
                    )}
                  </p>
                </div>

                {/* Selector de Año */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-brand-surface border border-brand-border rounded-lg p-1">
                  <button
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-brand-dark transition-colors"
                    title="Año anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-extrabold text-white font-mono px-3">
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-brand-dark transition-colors"
                    title="Año siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid de los 12 meses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {MONTH_NAMES.map((monthName, idx) => {
                  const payment = findMonthlyPayment(selectedYear, idx);
                  const isPaid = Boolean(payment);

                  // Evaluación de corte al día 10
                  const isPastMonth =
                    selectedYear < currentRealYear ||
                    (selectedYear === currentRealYear && idx < currentRealMonth);
                  const isCurrentMonth =
                    selectedYear === currentRealYear && idx === currentRealMonth;
                  const isFutureMonth =
                    selectedYear > currentRealYear ||
                    (selectedYear === currentRealYear && idx > currentRealMonth);

                  // Si estamos en el mes en curso y ya pasó el día 10
                  const isPastCutoff = isCurrentMonth && currentRealDay > 10;
                  const isOverdue = !isPaid && (isPastMonth || isPastCutoff);

                  return (
                    <div
                      key={monthName}
                      className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                        isPaid
                          ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                          : isOverdue
                          ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                          : 'bg-brand-dark border-brand-border hover:border-brand-borderLight'
                      }`}
                    >
                      {/* Cabecera del mes */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {monthName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {selectedYear}
                          </span>
                        </div>

                        {/* Badge de Estado */}
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Cobrado
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {isPastMonth ? 'Atrasado' : 'Cortó el 10'}
                          </span>
                        ) : isCurrentMonth ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-2.5 h-2.5" />
                            Vence el 10
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            Próximo
                          </span>
                        )}
                      </div>

                      {/* Detalles del mes */}
                      <div className="my-2">
                        {payment ? (
                          <div className="space-y-1">
                            <div className="text-sm font-extrabold text-emerald-400 font-mono">
                              ${Number(payment.amount).toFixed(2)} ARS
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <span>Cobrado: {payment.payment_date}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-sm font-extrabold text-slate-300 font-mono">
                              ${Number(project.recurring_amount || 0).toFixed(2)} ARS
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {isOverdue ? 'Cobro pendiente' : 'Sin registrar'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción rápida */}
                      <div className="pt-2 border-t border-brand-border/40 mt-auto">
                        {payment ? (
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            disabled={isSubmitting}
                            className="w-full text-center text-[10px] text-slate-500 hover:text-rose-400 py-1 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Anular pago</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePayMonth(idx)}
                            disabled={isSubmitting}
                            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                              isOverdue
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                : 'bg-brand-orange hover:bg-brand-orangeBright text-black shadow-ember-sm'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Cobrar Mes</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. DOMINIO ANUAL (POR AÑOS)                                */}
          {/* ========================================================= */}
          {activeTab === 'dominio' && (
            <div className="space-y-4">
              {/* Tarjeta de información del dominio */}
              <div className="bg-brand-dark border border-brand-border rounded-xl p-4 shadow-metal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-orange" />
                      <span className="text-sm font-bold text-white font-mono">
                        {project.domain_name || 'Sin dominio configurado'}
                      </span>
                      {project.domain_registrar && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-400">
                          {project.domain_registrar}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>
                        Costo anual:{' '}
                        <strong className="text-white font-mono">${Number(project.domain_cost || 0).toFixed(2)} ARS</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Vencimiento registrado:{' '}
                        <strong className="text-brand-orange font-mono">
                          {project.domain_renewal_date || 'No definida'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Estado de renovación */}
                  <div>
                    {!project.domain_renews ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <X className="w-3.5 h-3.5" />
                        Ya no se renueva (Baja)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Renovación Anual Activa
                      </span>
                    )}
                  </div>
                </div>

                {!project.domain_renews && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Este proyecto tiene el dominio marcado como &quot;Ya no se renueva&quot;. No generará avisos de cobro de renovación a menos que lo reactives en la edición del proyecto.
                    </span>
                  </div>
                )}
              </div>

              {/* Apartado cronológico año por año */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Cronograma de Renovación por Años
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {domainYearsList.map((year) => {
                    const domainPayment = findDomainPayment(year);
                    const isPaid = Boolean(domainPayment);

                    // Estimación de vencimiento en ese año
                    let expDateString = `${year}-01-01`;
                    if (project.domain_renewal_date) {
                      const parts = project.domain_renewal_date.split('-');
                      if (parts.length === 3) {
                        expDateString = `${year}-${parts[1]}-${parts[2]}`;
                      }
                    }

                    const isPast = year < currentRealYear;
                    const isCurrent = year === currentRealYear;

                    return (
                      <div
                        key={year}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isPaid
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                            : isPast
                            ? 'bg-rose-950/15 border-rose-500/30'
                            : isCurrent
                            ? 'bg-brand-dark border-brand-orange/40 ring-1 ring-brand-orange/20'
                            : 'bg-brand-dark border-brand-border'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                              Año {year}
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                                  Ciclo Actual
                                </span>
                              )}
                            </span>

                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Renovado & Cobrado
                              </span>
                            ) : isPast ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Sin Registro
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Pendiente
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 space-y-1 mb-3">
                            <div className="flex justify-between">
                              <span>Fecha vencimiento ciclo:</span>
                              <strong className="text-white font-mono">{expDateString}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Monto a cobrar:</span>
                              <strong className="text-white font-mono">
                                ${Number(project.domain_cost || 0).toFixed(2)} ARS
                              </strong>
                            </div>
                            {domainPayment && (
                              <div className="flex justify-between text-emerald-400 text-[11px] pt-1">
                                <span>Cobro registrado el:</span>
                                <span className="font-mono">{domainPayment.payment_date}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-brand-border/40">
                          {domainPayment ? (
                            <button
                              onClick={() => handleDeletePayment(domainPayment.id)}
                              disabled={isSubmitting}
                              className="w-full text-center text-xs text-slate-500 hover:text-rose-400 py-1 transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Anular registro de renovación</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePayDomainYear(year)}
                              disabled={isSubmitting || !project.domain_renews}
                              className="w-full py-2 px-3 rounded-lg bg-brand-orange hover:bg-brand-orangeBright text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-ember-sm disabled:opacity-50"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Cobrar y Renovar Año {year}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. PAGO ÚNICO / DESARROLLO                                 */}
          {/* ========================================================= */}
          {activeTab === 'pago_unico' && (
            <div className="space-y-5">
              {/* Tarjeta de Estado del Pago Único */}
              <div className="bg-brand-dark border border-brand-border rounded-xl p-5 shadow-metal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block">
                      Desarrollo / Landing Page
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Estado de Pago de Entrega
                    </h3>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-400 uppercase font-mono block">Precio Pactado</span>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      ${Number(project.one_time_price || 0).toFixed(2)}{' '}
                      <span className="text-xs text-brand-orange">ARS</span>
                    </span>
                  </div>
                </div>

                {/* Barra de progreso visual */}
                {Number(project.one_time_price) > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">
                        Abonado: ${totalPagadoUnico.toFixed(2)} ARS
                      </span>
                      <span className={saldoPendienteUnico > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {saldoPendienteUnico > 0
                          ? `Pendiente: $${saldoPendienteUnico.toFixed(2)} ARS`
                          : '100% Cobrado'}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-brand-surface rounded-full overflow-hidden border border-brand-border flex">
                      <div
                        className="bg-gradient-to-r from-brand-orange to-emerald-400 h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (totalPagadoUnico / (Number(project.one_time_price) || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Este proyecto no tiene establecido un precio único de desarrollo.
                  </p>
                )}

                {/* Botón de Cancelación Total si queda saldo */}
                {saldoPendienteUnico > 0 && (
                  <div className="mt-5 pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Resta cobrar{' '}
                      <span className="text-white font-mono font-bold">
                        ${saldoPendienteUnico.toFixed(2)} ARS
                      </span>{' '}
                      para liquidar el total.
                    </div>
                    <button
                      onClick={handlePayFullRemainingUpfront}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeBright text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-ember"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Cobrar Saldo Total (${saldoPendienteUnico.toFixed(2)})</span>
                    </button>
                  </div>
                )}

                {saldoPendienteUnico === 0 && Number(project.one_time_price) > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-semibold">
                      ¡Pago único 100% liquidado y completado! No quedan saldos pendientes de desarrollo.
                    </span>
                  </div>
                )}
              </div>

              {/* Cobro Parcial / Anticipo */}
              {saldoPendienteUnico > 0 && (
                <div className="bg-brand-surface/60 border border-brand-border rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    Registrar Cobro Parcial o Anticipo
                  </h4>
                  <form onSubmit={handlePayPartialUpfront} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Concepto</label>
                      <input
                        type="text"
                        value={partialConcept}
                        onChange={(e) => setPartialConcept(e.target.value)}
                        placeholder="Ej: Seña 50%, Anticipo"
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Monto ($ ARS)</label>
                      <input
                        type="number"
                        step="0.01"
                        max={saldoPendienteUnico}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder={String(saldoPendienteUnico / 2)}
                        required
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 px-3 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-orange text-white font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        Registrar Anticipo
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Desglose de cobros de desarrollo */}
              {pagosUnicos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Comprobantes de Pago Único Registrados
                  </h4>
                  <div className="space-y-2">
                    {pagosUnicos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-brand-dark border border-brand-border rounded-lg p-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{p.concept}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Fecha: {p.payment_date}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-emerald-400 font-mono text-sm">
                            +${Number(p.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Anular pago"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. HISTORIAL GENERAL Y REGISTRO PERSONALIZADO             */}
          {/* ========================================================= */}
          {activeTab === 'historial' && (
            <div className="space-y-5">
              {/* Barra superior de registro personalizado */}
              <div className="flex items-center justify-between bg-brand-dark border border-brand-border rounded-xl p-4 shadow-metal">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Histórico</span>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                    ${totalCobradoGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })} <span className="text-xs text-brand-orange">ARS</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-orange hover:bg-brand-orangeBright text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-ember-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isAddingCustom ? 'Cancelar' : 'Cobro Manual / Extra'}</span>
                </button>
              </div>

              {/* Formulario nuevo cobro personalizado */}
              {isAddingCustom && (
                <form
                  onSubmit={handleAddCustomPayment}
                  className="bg-brand-surface/70 border border-brand-border rounded-xl p-4 space-y-3"
                >
                  <h4 className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                    Registrar Cobro Personalizado
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Concepto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Cambio de textos, hora de desarrollo extra, ajuste"
                        value={customConcept}
                        onChange={(e) => setCustomConcept(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Monto ($ ARS) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="50.00"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-orange font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fecha</label>
                      <input
                        type="date"
                        required
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-orange font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Categoría</label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as any)}
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-orange"
                      >
                        <option value="extra">Extra / Ajuste / Soporte</option>
                        <option value="mantenimiento">Mantenimiento Mensual</option>
                        <option value="pago_unico">Pago de Desarrollo</option>
                        <option value="dominio">Renovación Dominio</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orangeBright text-black font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Guardar Cobro
                    </button>
                  </div>
                </form>
              )}

              {/* Listado de todas las transacciones */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Todas las Transacciones Realizadas
                </h4>

                {payments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center bg-brand-dark/50 rounded-lg border border-brand-border">
                    No hay ningún pago registrado aún para este proyecto.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-brand-dark border border-brand-border hover:border-brand-borderLight rounded-lg p-3 text-xs transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{p.concept}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded border font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              {p.payment_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.payment_date}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-400 font-mono text-sm">
                            +${Number(p.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Eliminar pago"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
