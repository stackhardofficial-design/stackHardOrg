'use client';

import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Trash2, CheckCircle, Receipt, Tag } from 'lucide-react';
import { ProjectWithPayments, Payment } from '@/types';
import { supabase } from '@/lib/supabase';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithPayments | null;
  onPaymentUpdated: () => void;
}

export function PaymentsModal({ isOpen, onClose, project, onPaymentUpdated }: PaymentsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'pago_unico' | 'mantenimiento' | 'dominio' | 'extra'>('mantenimiento');
  const [status, setStatus] = useState<'completado' | 'pendiente'>('completado');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const totalCobrado = project.payments?.reduce((acc, p) => acc + (p.status === 'completado' ? Number(p.amount) : 0), 0) || 0;

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !amount) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert([
        {
          project_id: project.id,
          concept,
          amount: parseFloat(amount),
          payment_date: paymentDate,
          payment_type: paymentType,
          status,
        },
      ]);

      if (error) throw error;

      setConcept('');
      setAmount('');
      setIsAdding(false);
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de cobro?')) return;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId);
      if (error) throw error;
      onPaymentUpdated();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el pago');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Gestión de Cobros y Pagos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Proyecto: <span className="text-slate-200 font-medium">{project.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Resumen de cobros del proyecto */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Recibido (Registrado):</span>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                ${totalCobrado.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
              </div>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancelar' : 'Registrar Cobro'}</span>
            </button>
          </div>

          {/* Formulario de registro rápido */}
          {isAdding && (
            <form onSubmit={handleAddPayment} className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-white">Nuevo Cobro Realizado</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-300 mb-1">Concepto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mantenimiento Octubre, Pago 50% inicial, Renovación dominio"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Monto ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Fecha de Cobro</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Tipo de Cobro</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mantenimiento">Mantenimiento Mensual</option>
                    <option value="pago_unico">Pago Inicial / Desarrollo</option>
                    <option value="dominio">Renovación Dominio</option>
                    <option value="extra">Extra / Ajuste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="completado">Completado (Cobrado)</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cobro'}
                </button>
              </div>
            </form>
          )}

          {/* Listado de Pagos */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Historial de Pagos
            </h4>
            {(!project.payments || project.payments.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-3 text-center bg-slate-950/30 rounded-lg">
                No hay pagos registrados para este proyecto.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {project.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{p.concept}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full border ${
                          p.status === 'completado'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{p.payment_date}</span>
                        <span>•</span>
                        <span className="capitalize">{p.payment_type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-sm">
                        ${Number(p.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar registro"
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
      </div>
    </div>
  );
}
