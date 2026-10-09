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
  Filter, 
  Mail, 
  Plus, 
  Layers, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

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

      // Unir proyectos con sus pagos correspondientes
      const combined: ProjectWithPayments[] = (projectsData || []).map((proj) => {
        const projPayments = (paymentsData || []).filter((pay) => pay.project_id === proj.id);
        return {
          ...proj,
          payments: projPayments,
        };
      });

      setProjects(combined);

      // Si el modal de pagos está abierto para un proyecto, actualizar su referencia
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

  // Guardar o Editar Proyecto
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

  // Eliminar Proyecto
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

  // Lista única de cuentas de Google existentes para el filtro rápido
  const googleAccountsList = useMemo(() => {
    const accounts = new Set<string>();
    projects.forEach((p) => {
      if (p.google_account?.trim()) {
        accounts.add(p.google_account.trim());
      }
    });
    return Array.from(accounts);
  }, [projects]);

  // Proyectos filtrados
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filtro de búsqueda texto
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        project.name.toLowerCase().includes(search) ||
        project.client_name?.toLowerCase().includes(search) ||
        project.domain_name?.toLowerCase().includes(search) ||
        project.google_account?.toLowerCase().includes(search) ||
        project.notes?.toLowerCase().includes(search);

      // Filtro por tipo
      const matchType = selectedType === 'todos' || project.type === selectedType;

      // Filtro por cuenta de Google
      const matchGoogle =
        selectedGoogleAccount === 'todos' ||
        project.google_account?.trim() === selectedGoogleAccount;

      // Filtro por estado
      const matchStatus = selectedStatus === 'todos' || project.status === selectedStatus;

      return matchSearch && matchType && matchGoogle && matchStatus;
    });
  }, [projects, searchTerm, selectedType, selectedGoogleAccount, selectedStatus]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navbar Superior */}
      <Navbar
        onNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onRefresh={fetchData}
        isLoading={isLoading}
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

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 mb-6 backdrop-blur-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por proyecto, cliente, dominio, notas o cuenta de Google..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filtro por Cuenta de Google */}
            <div className="w-full sm:w-64">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <select
                  value={selectedGoogleAccount}
                  onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none truncate"
                >
                  <option value="todos">Todas las Cuentas Google</option>
                  {googleAccountsList.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filtros de Tipo y Estado en Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
            {/* Tipos */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 mr-1 hidden sm:inline">Tipo:</span>
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
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedType === t.id
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Estados */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 mr-1 hidden sm:inline">Estado:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'activo', label: 'Activo' },
                { id: 'entregado', label: 'Entregado' },
                { id: 'en_desarrollo', label: 'Desarrollo' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    selectedStatus === s.id
                      ? 'bg-slate-200 text-slate-900 font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Proyectos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Cargando tus proyectos y dominios...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Proyecto</span>
            </button>
          </div>
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <p>StackHard Org • Gestión centralizada de sitios, dominios, infraestructura y cobros</p>
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
