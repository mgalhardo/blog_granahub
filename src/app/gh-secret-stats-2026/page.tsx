import React from 'react';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Search, 
  MousePointer2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import type { Metadata } from 'next';
import rawData from '@/data/analytics.json';

export const metadata: Metadata = {
  title: 'Interno | GranaHub Analytics',
  robots: 'noindex, nofollow',
};

// --- Interfaces ---
interface TopPage {
  path: string;
  title: string;
  views: number;
}

interface TopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface AnalyticsData {
  generatedAt: string;
  isReal: boolean;
  ga4: {
    totalUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDurationSeconds: number;
    usersChange: number;
    pageViewsChange: number;
    durationChange: number;
    topPages: TopPage[];
  };
  searchConsole: {
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    topQueries: TopQuery[];
  };
}

const data = rawData as unknown as AnalyticsData;
const ga4 = data.ga4;
const sc = data.searchConsole;

// --- Helpers ---
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
  return n.toLocaleString('pt-BR');
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// --- Stats cards ---
const stats = [
  {
    name: 'Usuários (30d)',
    value: formatNumber(ga4.totalUsers),
    change: formatChange(ga4.usersChange),
    positive: ga4.usersChange >= 0,
    icon: Users,
  },
  {
    name: 'Visualizações de Página',
    value: formatNumber(ga4.pageViews),
    change: formatChange(ga4.pageViewsChange),
    positive: ga4.pageViewsChange >= 0,
    icon: Eye,
  },
  {
    name: 'Cliques Google (30d)',
    value: formatNumber(sc.clicks),
    change: `CTR ${sc.ctr}%`,
    positive: true,
    icon: MousePointer2,
  },
  {
    name: 'Tempo Médio de Sessão',
    value: formatDuration(ga4.avgSessionDurationSeconds),
    change: formatChange(ga4.durationChange),
    positive: ga4.durationChange >= 0,
    icon: Clock,
  },
];

export default function StatsDashboard() {
  const topPages: TopPage[] = ga4.topPages;
  const topQueries: TopQuery[] = sc.topQueries;

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#1A202C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-granahub-primary uppercase tracking-widest">Dash Administrativo</span>
            </div>
            <h1 className="text-3xl font-extrabold text-granahub-text">Visitação & Performance</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3 text-granahub-text-secondary" />
              <p className="text-granahub-text-secondary text-sm">
                {data.isReal
                  ? `Dados de: ${formatDate(data.generatedAt)} · Últimos 30 dias`
                  : 'Aguardando configuração do Google Analytics'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 italic text-sm text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              Esta página está oculta para motores de busca (noindex).
            </div>
            {!data.isReal && (
              <div className="flex items-center gap-3 bg-amber-50 px-3 py-2 rounded-xl shadow-sm border border-amber-200 text-sm text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Configure os secrets no GitHub para ver dados reais.
              </div>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-granahub-primary/5 transition-colors">
                    <Icon className="w-6 h-6 text-granahub-primary" />
                  </div>
                  <div className={`flex items-center text-xs font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-granahub-text-secondary mb-1">{stat.name}</h3>
                <p className="text-2xl font-black text-granahub-text">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Middle section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Top Pages */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-granahub-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-granahub-primary" />
                Páginas Mais Acessadas (30d)
              </h3>
              <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full">
                {topPages.filter(p => p.views > 0).length} páginas
              </span>
            </div>

            {topPages.some(p => p.views > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Página</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topPages.filter(p => p.views > 0).map((page, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-4 text-xs font-black text-gray-300">{idx + 1}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-granahub-text line-clamp-1">{page.title || page.path}</p>
                          <p className="text-[10px] font-medium text-gray-400">{page.path}</p>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-black italic text-granahub-text">
                          {formatNumber(page.views)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Eye className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhum dado disponível ainda</p>
                <p className="text-xs mt-1">Configure o GA4 para visualizar</p>
              </div>
            )}
          </div>

          {/* Search Console Card */}
          <div className="bg-gradient-to-br from-granahub-primary to-granahub-dark p-8 rounded-3xl text-white shadow-xl shadow-granahub-primary/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Search className="w-5 h-5 opacity-70" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Search Console</span>
              </div>
              <h3 className="text-2xl font-bold mb-8 leading-tight">Performance no Google</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">Impressões (30d)</p>
                  <p className="text-2xl font-bold italic">{formatNumber(sc.impressions)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">Cliques Google</p>
                  <p className="text-2xl font-bold italic">{formatNumber(sc.clicks)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">CTR Médio</p>
                  <div className="border-b border-white/20 pb-2">
                    <span className="text-2xl font-black text-granahub-accent">{sc.ctr}%</span>
                    {sc.ctr > 5 && (
                      <span className="ml-2 text-xs font-bold text-green-400">Acima da média</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">Posição Média</p>
                  <p className="text-2xl font-bold italic">{sc.position > 0 ? `#${sc.position}` : '—'}</p>
                </div>
              </div>
            </div>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              className="mt-8 block text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all backdrop-blur-sm border border-white/10 text-sm"
            >
              Abrir Console Oficial
            </a>
          </div>
        </div>

        {/* Top Search Queries */}
        {topQueries.some(q => q.clicks > 0) && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-granahub-text flex items-center gap-2">
                <Search className="w-5 h-5 text-granahub-primary" />
                Top Buscas no Google
              </h3>
              <span className="text-xs text-gray-400 font-medium">Últimos 30 dias</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Termo de busca</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Cliques</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Impressões</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">CTR</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Posição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topQueries.filter(q => q.clicks > 0).map((q, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-granahub-text">{q.query}</p>
                      </td>
                      <td className="px-8 py-5 text-right text-sm font-black italic text-granahub-text">{q.clicks}</td>
                      <td className="px-8 py-5 text-right font-medium text-sm text-granahub-text-secondary">{formatNumber(q.impressions)}</td>
                      <td className="px-8 py-5 text-right font-medium text-sm text-granahub-text-secondary">{q.ctr}%</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase ${
                          q.position <= 10 ? 'bg-green-100 text-green-700'
                          : q.position <= 20 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{Math.round(q.position)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] pt-8 border-t border-gray-100">
          <p>© 2026 GRANAHUB INTERNAL ANALYTICS ENGINE</p>
          <div className="flex gap-6">
            <span>{data.isReal ? 'Fonte: GA4 + Search Console' : 'Aguardando credenciais'}</span>
            <span>Status: online</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
