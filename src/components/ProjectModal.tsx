'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, Server, Database, Mail, DollarSign, Calendar, FileText, Check } from 'lucide-react';
import { Project, ProjectType, ProjectStatus, BillingType, RecurringPeriod } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  initialProject?: Project | null;
}

export function ProjectModal({ isOpen, onClose, onSave, initialProject }: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client_name: '',
    type: 'landing',
    status: 'activo',
    url: '',
    google_account: '',
    hosting_provider: '',
    db_provider: '',
    domain_name: '',
    domain_registrar: '',
    domain_renews: true,
    domain_renewal_date: '',
    domain_cost: 0,
    billing_type: 'pago_unico',
    one_time_price: 0,
    recurring_amount: 0,
    recurring_period: 'ninguno',
    next_billing_date: '',
    currency: 'USD',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setFormData({
        ...initialProject,
        domain_renewal_date: initialProject.domain_renewal_date || '',
        next_billing_date: initialProject.next_billing_date || '',
      });
    } else {
      setFormData({
        name: '',
        client_name: '',
        type: 'landing',
        status: 'activo',
        url: '',
        google_account: '',
        hosting_provider: 'Vercel',
        db_provider: 'Ninguna',
        domain_name: '',
        domain_registrar: 'Namecheap',
        domain_renews: true,
        domain_renewal_date: '',
        domain_cost: 0,
        billing_type: 'pago_unico',
        one_time_price: 0,
        recurring_amount: 0,
        recurring_period: 'ninguno',
        next_billing_date: '',
        currency: 'USD',
        notes: '',
      });
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h2 className="text-lg font-bold text-white">
            {initialProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Datos Generales */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              1. Información General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Odontología Pérez, SaaS ERP"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cliente o Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Roberto Gómez"
                  value={formData.client_name || ''}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo</label>
                <select
                  value={formData.type || 'landing'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="landing">Landing Page</option>
                  <option value="sistema">Sistema Web</option>
                  <option value="saas">SaaS App</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estado</label>
                <select
                  value={formData.status || 'activo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="en_desarrollo">En Desarrollo</option>
                  <option value="entregado">Entregado</option>
                  <option value="pausado">Pausado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">URL de la Web</label>
                <input
                  type="text"
                  placeholder="https://odontoperez.com"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dominio y Renovaciones */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              2. Dominio & Renovación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de Dominio</label>
                <input
                  type="text"
                  placeholder="odontoperez.com"
                  value={formData.domain_name || ''}
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registrador</label>
                <input
                  type="text"
                  placeholder="Namecheap, GoDaddy, Hostinger, Porkbun"
                  value={formData.domain_registrar || ''}
                  onChange={(e) => setFormData({ ...formData, domain_registrar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                <input
                  type="checkbox"
                  id="domain_renews"
                  checked={formData.domain_renews ?? true}
                  onChange={(e) => setFormData({ ...formData, domain_renews: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="domain_renews" className="text-xs text-slate-300 cursor-pointer">
                  ¿Tengo que renovar este dominio anualmente?
                </label>
              </div>

              {formData.domain_renews && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fecha de Renovación / Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.domain_renewal_date || ''}
                      onChange={(e) => setFormData({ ...formData, domain_renewal_date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Costo Renovación ($ USD/año)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="12.99"
                      value={formData.domain_cost ?? 0}
                      onChange={(e) => setFormData({ ...formData, domain_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cuentas de Google e Infraestructura */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              3. Cuentas Google & Servidores / BD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cuenta de Google Asociada
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com (donde está guardado o registrado)"
                  value={formData.google_account || ''}
                  onChange={(e) => setFormData({ ...formData, google_account: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Identifica en qué cuenta de Google tienes las credenciales, Drive, Firebase o correo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Servidor / Hosting</label>
                <input
                  type="text"
                  placeholder="Vercel, Railway, VPS, Hostinger, Firebase"
                  value={formData.hosting_provider || ''}
                  onChange={(e) => setFormData({ ...formData, hosting_provider: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base de Datos</label>
                <input
                  type="text"
                  placeholder="Supabase, Neon, PostgreSQL, MongoDB, Ninguna"
                  value={formData.db_provider || ''}
                  onChange={(e) => setFormData({ ...formData, db_provider: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cobros y Finanzas */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              4. Cobros & Esquema de Precios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Cobro</label>
                <select
                  value={formData.billing_type || 'pago_unico'}
                  onChange={(e) => setFormData({ ...formData, billing_type: e.target.value as BillingType })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="pago_unico">Pago Único (ej: Landing)</option>
                  <option value="mensual">Mensual Recurrente</option>
                  <option value="anual">Anual</option>
                  <option value="mixto">Mixto (Pago Único + Mantenimiento Mensual)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Precio Pago Único ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="350.00"
                  value={formData.one_time_price ?? 0}
                  onChange={(e) => setFormData({ ...formData, one_time_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mantenimiento Recurrente ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.recurring_amount ?? 0}
                  onChange={(e) => setFormData({ ...formData, recurring_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Frecuencia Mantenimiento</label>
                <select
                  value={formData.recurring_period || 'ninguno'}
                  onChange={(e) => setFormData({ ...formData, recurring_period: e.target.value as RecurringPeriod })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="ninguno">Ninguno</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              {formData.recurring_period !== 'ninguno' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Próxima Fecha de Cobro de Mantenimiento
                  </label>
                  <input
                    type="date"
                    value={formData.next_billing_date || ''}
                    onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notas, Accesos o Detalles adicionales
            </label>
            <textarea
              rows={3}
              placeholder="Notas de accesos, credenciales, instrucciones de despliegue o cliente..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Proyecto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
