'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, ProjectWithPayments, Payment } from '@/types';
import { Navbar } from '@/components/Navbar';
import { StatsCards } from '@/components/StatsCards';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectModal } from '@/components/ProjectModal';
import { PaymentsModal } from '@/components/PaymentsModal';
import { UpcomingRenewals } from '@/components/UpcomingRenewals';
import { 
  Search, 
  Mail, 
  Plus, 
  Layers, 
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  Server,
  Database,
  Globe,
  Receipt
} from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithPayments | null>(null);
  const [paymentsModalProject, setPaymentsModalProject] = useState<ProjectWithPayments | null>(null);

  // Cargar proyectos y pagos desde Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: projectsData, error: pError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      const { data: paymentsData, error: payError } = await supabase
        .from('payments')
        .select('*');

      if (payError) throw payError;

      const combined: ProjectWithPayments[] = (projectsData || []).map((proj) => {
        const projPayments = (paymentsData || []).filter((pay) => pay.project_id === proj.id);
        return {
          ...proj,
          payments: projPayments,
        };
      });

      setProjects(combined);

      if (paymentsModalProject) {
        const updatedTarget = combined.find((p) => p.id === paymentsModalProject.id);
        if (updatedTarget) setPaymentsModalProject(updatedTarget);
      }
    } catch (err) {
      console.error('Error al cargar datos de Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProject = async (data: Partial<Project>) => {
    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProject.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('projects').insert([data]);
      if (error) throw error;
    }
    await fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el proyecto');
    }
  };

  const googleAccountsList = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      if (p.google_account?.trim()) {
        const acc = p.google_account.trim();
        map.set(acc, (map.get(acc) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([email, count]) => ({ email, count }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        project.name.toLowerCase().includes(search) ||
        project.client_name?.toLowerCase().includes(search) ||
        project.domain_name?.toLowerCase().includes(search) ||
        project.google_account?.toLowerCase().includes(search) ||
        project.notes?.toLowerCase().includes(search);

      const matchType = selectedType === 'todos' || project.type === selectedType;
      const matchGoogle =
        selectedGoogleAccount === 'todos' ||
        project.google_account?.trim() === selectedGoogleAccount;
      const matchStatus = selectedStatus === 'todos' || project.status === selectedStatus;

      return matchSearch && matchType && matchGoogle && matchStatus;
    });
  }, [projects, searchTerm, selectedType, selectedGoogleAccount, selectedStatus]);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans selection:bg-brand-orange selection:text-black">
      {/* Navbar Superior */}
      <Navbar
        onNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onRefresh={fetchData}
        isLoading={isLoading}
        totalProjects={projects.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Métricas Principales */}
        <StatsCards projects={projects} />

        {/* Notificaciones y Renovaciones Próximas */}
        <UpcomingRenewals
          projects={projects}
          onSelectProject={(proj) => {
            setEditingProject(proj);
            setIsProjectModalOpen(true);
          }}
        />

        {/* Barra de Filtros, Búsqueda y Modos de Vista */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 mb-6 shadow-metal space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por proyecto, cliente, dominio, notas o cuenta de Google..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {/* Filtro por Cuenta de Google */}
            <div className="w-full sm:w-72">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                <select
                  value={selectedGoogleAccount}
                  onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-brand-orange appearance-none truncate font-mono"
                >
                  <option value="todos">Todas las Cuentas Google ({projects.length})</option>
                  {googleAccountsList.map(({ email, count }) => (
                    <option key={email} value={email}>
                      {email} ({count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Switch de Modo Vista */}
            <div className="hidden sm:flex items-center gap-1 bg-brand-dark p-1 rounded-lg border border-brand-border">
              <button
                onClick={() => setViewMode('grid')}
                title="Vista Cuadrícula"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-surface text-brand-orange shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Vista Lista"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-brand-surface text-brand-orange shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtros de Tipo y Estado en Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-brand-border/60 text-xs">
            {/* Categorías / Tipos */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider font-semibold hidden sm:inline">
                Tipo:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'landing', label: 'Landings' },
                { id: 'sistema', label: 'Sistemas Web' },
                { id: 'saas', label: 'SaaS' },
                { id: 'ecommerce', label: 'E-commerce' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1 rounded-md uppercase font-mono tracking-wider text-[11px] font-bold transition-all ${
                    selectedType === t.id
                      ? 'bg-brand-orange text-black shadow-ember-sm'
                      : 'bg-brand-surface text-slate-300 hover:bg-brand-border hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Estados */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider font-semibold hidden sm:inline">
                Estado:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'activo', label: 'Activo' },
                { id: 'entregado', label: 'Entregado' },
                { id: 'en_desarrollo', label: 'Desarrollo' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    selectedStatus === s.id
                      ? 'bg-white text-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid o Tabla de Proyectos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3 shadow-ember-sm" />
            <p className="text-xs uppercase tracking-wider font-mono text-slate-300">Cargando base de datos...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-12 text-center max-w-lg mx-auto shadow-metal">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
              No se encontraron proyectos
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {searchTerm || selectedType !== 'todos' || selectedGoogleAccount !== 'todos'
                ? 'Prueba a cambiar o limpiar los filtros de búsqueda.'
                : 'Comienza agregando tu primera landing page o sistema.'}
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orangeBright text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-ember transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Nuevo Proyecto</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setEditingProject(p);
                  setIsProjectModalOpen(true);
                }}
                onDelete={handleDeleteProject}
                onManagePayments={(p) => {
                  setPaymentsModalProject(p);
                }}
              />
            ))}
          </div>
        ) : (
          /* Vista Tabla Compacta para PC */
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-metal">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-dark/90 text-slate-400 uppercase font-mono tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Proyecto</th>
                    <th className="py-3 px-4">Dominio / Vencimiento</th>
                    <th className="py-3 px-4">Cuenta Google</th>
                    <th className="py-3 px-4">Infraestructura</th>
                    <th className="py-3 px-4">Cobros</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredProjects.map((p) => {
                    const totalPagado = p.payments?.reduce(
                      (sum, pay) => sum + (pay.status === 'completado' ? Number(pay.amount) : 0),
                      0
                    ) || 0;

                    return (
                      <tr key={p.id} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="uppercase font-mono text-[10px] text-brand-orange font-semibold">{p.type}</span>
                            <span>•</span>
                            <span>{p.client_name || 'Sin cliente'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-slate-200">
                            {p.domain_name || 'Sin dominio'}
                          </div>
                          {p.domain_renews && p.domain_renewal_date && (
                            <div className="text-[11px] text-slate-400">
                              Vence: {p.domain_renewal_date}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {p.google_account ? (
                            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                              <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">{p.google_account}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No asignada</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-[11px]">
                            {p.hosting_provider && (
                              <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-300">
                                {p.hosting_provider}
                              </span>
                            )}
                            {p.db_provider && (
                              <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-300">
                                {p.db_provider}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-white font-bold">
                            ${totalPagado > 0 ? totalPagado : Number(p.one_time_price || 0)} USD
                          </div>
                          {Number(p.recurring_amount) > 0 && (
                            <div className="text-[11px] text-amber-400">
                              +${p.recurring_amount}/{p.recurring_period === 'mensual' ? 'mes' : 'año'}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPaymentsModalProject(p)}
                              className="px-2 py-1 rounded bg-brand-surface hover:bg-brand-border text-slate-200 border border-brand-border text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3 text-brand-orange" />
                              <span>Pagos</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingProject(p);
                                setIsProjectModalOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-brand-surface hover:bg-brand-border text-slate-300 text-[11px]"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-brand-dark py-4 text-center text-xs text-slate-500 font-mono">
        <p>STACKHARD ORG • PLATAFORMA DE CONTROL DE PROYECTOS, INFRAESTRUCTURA & COBROS</p>
      </footer>

      {/* Modal Proyecto */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />

      {/* Modal Pagos */}
      <PaymentsModal
        isOpen={!!paymentsModalProject}
        onClose={() => setPaymentsModalProject(null)}
        project={paymentsModalProject}
        onPaymentUpdated={fetchData}
      />
    </div>
  );
}
