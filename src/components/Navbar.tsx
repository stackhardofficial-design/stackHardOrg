'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  onNewProject: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalProjects: number;
}

export function Navbar({ onNewProject, onRefresh, isLoading, totalProjects }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-brand-dark/90 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-brand-border bg-black flex items-center justify-center shadow-ember-sm group">
              <img
                src="/logo.png"
                alt="StackHard Logo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white uppercase">
                  STACK<span className="text-brand-orange">HARD</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/25 font-semibold">
                  ORG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Gestión Centralizada • Landings, Sistemas & Finanzas
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Sincronizar datos"
              className="p-2 text-slate-400 hover:text-white bg-brand-card hover:bg-brand-surface rounded-lg border border-brand-border transition-colors active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-orange' : ''}`} />
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-orange to-amber-600 hover:from-brand-orangeBright hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-lg shadow-ember transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
