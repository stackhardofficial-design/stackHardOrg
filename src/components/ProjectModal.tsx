'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, Server, Database, Mail, DollarSign, Calendar, FileText, Check, Clock } from 'lucide-react';
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
    client_phone: '',
    type: 'landing',
    status: 'activo',
    url: '',
    google_account: '',
    google_account_server: '',
    google_account_db: '',
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
    currency: 'ARS',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setFormData({
        ...initialProject,
        client_phone: initialProject.client_phone || '',
        google_account_server: initialProject.google_account_server || initialProject.google_account || '',
        google_account_db: initialProject.google_account_db || initialProject.google_account || '',
        domain_renewal_date: initialProject.domain_renewal_date || '',
        next_billing_date: initialProject.next_billing_date || '',
      });
    } else {
      setFormData({
        name: '',
        client_name: '',
        client_phone: '',
        type: 'landing',
        status: 'activo',
        url: '',
        google_account: '',
        google_account_server: '',
        google_account_db: '',
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
        currency: 'ARS',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-dark/95">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
              {initialProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-brand-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* 1. Datos Generales */}
          <div>
            <h3 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
              1. Información General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Clínica Dental Sonrisas, SaaS ERP"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cliente o Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Roberto Gómez"
                  value={formData.client_name || ''}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono / WhatsApp Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ej: +54 9 11 1234-5678"
                  value={formData.client_phone || ''}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                <select
                  value={formData.type || 'landing'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="landing">Landing Page</option>
                  <option value="sistema">Sistema Web</option>
                  <option value="saas">SaaS App</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                <select
                  value={formData.status || 'activo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="en_desarrollo">En Desarrollo</option>
                  <option value="entregado">Entregado</option>
                  <option value="pausado">Pausado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL de la Web</label>
                <input
                  type="text"
                  placeholder="https://clinicasonrisas.com"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Dominio y Renovaciones */}
          <div>
            <h3 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
              2. Dominio & Renovación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Dominio</label>
                <input
                  type="text"
                  placeholder="clinicasonrisas.com"
                  value={formData.domain_name || ''}
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registrador</label>
                <input
                  type="text"
                  placeholder="Namecheap, GoDaddy, Hostinger, Porkbun"
                  value={formData.domain_registrar || ''}
                  onChange={(e) => setFormData({ ...formData, domain_registrar: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estado de Renovación del Dominio
                </label>
                <select
                  value={formData.domain_renews ? 'activo' : 'no_renovar'}
                  onChange={(e) => setFormData({ ...formData, domain_renews: e.target.value === 'activo' })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="activo">✓ Se renueva anualmente en la fecha</option>
                  <option value="no_renovar">✗ Ya no se renueva / Cancelado (Dado de baja)</option>
                </select>
              </div>

              {formData.domain_renews && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fecha de Renovación / Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.domain_renewal_date || ''}
                      onChange={(e) => setFormData({ ...formData, domain_renewal_date: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Costo Renovación ($ ARS/año)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="14.99"
                      value={formData.domain_cost ?? 0}
                      onChange={(e) => setFormData({ ...formData, domain_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Cuentas Google & Servidores / BD */}
          <div>
            <h3 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
              3. Cuentas Google & Servidores / BD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Servidor / Hosting */}
              <div className="bg-brand-dark/60 p-3 rounded-xl border border-brand-border space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-brand-orange" />
                  Servidor & Hosting
                </span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Proveedor Servidor</label>
                  <input
                    type="text"
                    placeholder="Vercel, Railway, VPS, Hostinger"
                    value={formData.hosting_provider || ''}
                    onChange={(e) => setFormData({ ...formData, hosting_provider: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cuenta Google Servidor</label>
                  <input
                    type="email"
                    placeholder="servidor.cuenta@gmail.com"
                    value={formData.google_account_server || ''}
                    onChange={(e) => setFormData({ ...formData, google_account_server: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Base de Datos */}
              <div className="bg-brand-dark/60 p-3 rounded-xl border border-brand-border space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Base de Datos
                </span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Proveedor BD</label>
                  <input
                    type="text"
                    placeholder="Supabase, Neon, PostgreSQL, Firebase"
                    value={formData.db_provider || ''}
                    onChange={(e) => setFormData({ ...formData, db_provider: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cuenta Google Base de Datos</label>
                  <input
                    type="email"
                    placeholder="db.cuenta@gmail.com"
                    value={formData.google_account_db || ''}
                    onChange={(e) => setFormData({ ...formData, google_account_db: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cobros y Finanzas */}
          <div>
            <h3 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
              4. Cobros & Esquema Financiero
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Cobro</label>
                <select
                  value={formData.billing_type || 'pago_unico'}
                  onChange={(e) => setFormData({ ...formData, billing_type: e.target.value as BillingType })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="pago_unico">Pago Único (ej: Landing)</option>
                  <option value="mensual">Mensual Recurrente</option>
                  <option value="anual">Anual Recurrente</option>
                  <option value="mixto">Mixto (Pago Único + Mantenimiento)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Pago Único ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="350.00"
                  value={formData.one_time_price ?? 0}
                  onChange={(e) => setFormData({ ...formData, one_time_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mantenimiento Recurrente ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.recurring_amount ?? 0}
                  onChange={(e) => setFormData({ ...formData, recurring_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frecuencia Mantenimiento</label>
                <select
                  value={formData.recurring_period || 'ninguno'}
                  onChange={(e) => setFormData({ ...formData, recurring_period: e.target.value as RecurringPeriod })}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="ninguno">Ninguno</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              {formData.recurring_period === 'mensual' && (
                <div className="sm:col-span-2 bg-brand-surface/40 p-2.5 rounded-lg border border-brand-border">
                  <p className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Regla de Cobro: <strong>Antes del día 10 de cada mes</strong>. Podrás marcar con 1 clic si ya te pagaron el mes actual o si está pendiente.</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas, Accesos o Detalles adicionales
            </label>
            <textarea
              rows={3}
              placeholder="Notas de accesos, credenciales, instrucciones de despliegue o cliente..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-brand-dark border border-brand-border focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-brand-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-bold text-black bg-gradient-to-r from-brand-orange to-amber-600 hover:from-brand-orangeBright hover:to-amber-500 rounded-lg shadow-ember transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Proyecto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
