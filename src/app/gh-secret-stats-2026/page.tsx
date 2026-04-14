import React from 'react';
import { 
  Users, 
  Eye, 
  CursorClick, 
  TrendingUp, 
  Search, 
  MousePointer2,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interno | GranaHub Analytics',
  robots: 'noindex, nofollow',
};

// Mock data para visualização
const stats = [
  { name: 'Usuários Ativos (Hoje)', value: '142', change: '+12%', type: 'positive', icon: Users },
  { name: 'Visualizações de Página', value: '1.284', change: '+18.4%', type: 'positive', icon: Eye },
  { name: 'Cliques no WhatsApp', value: '86', change: '+5.2%', type: 'positive', icon: CursorClick },
  { name: 'Tempo Médio', value: '2m 14s', change: '-1.1%', type: 'negative', icon: Clock },
];

const topPosts = [
  { title: 'Como organizar seu orçamento em 2026', views: 425, ctr: '12.4%', trend: 'up' },
  { title: 'Os melhores investimentos para iniciantes', views: 312, ctr: '8.1%', trend: 'up' },
  { title: 'Dicas para economizar no supermercado', views: 284, ctr: '5.2%', trend: 'down' },
  { title: 'Entenda o imposto de renda deste ano', views: 215, ctr: '15.8%', trend: 'up' },
];

export default function StatsDashboard() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#1A202C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-granahub-primary uppercase tracking-widest">Dash Administrativo</span>
            </div>
            <h1 className="text-3xl font-extrabold text-granahub-text">Visitação & Performance</h1>
            <p className="text-granahub-text-secondary">Dados internos baseados em GA4 e Search Console.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 italic text-sm text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Esta página está oculta para motores de busca (noindex).
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
                  <div className={`flex items-center text-xs font-bold ${stat.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.type === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-granahub-text-secondary mb-1">{stat.name}</h3>
                <p className="text-2xl font-black text-granahub-text">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart Simulator (Static SVG for Premium Look) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-granahub-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-granahub-primary" />
                Tráfego nos últimos 30 dias
              </h3>
              <div className="flex gap-2">
                <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full">Abril 2026</span>
              </div>
            </div>
            
            <div className="relative h-64 w-full bg-gray-50/30 rounded-xl overflow-hidden pt-10 px-2">
              {/* Mock Chart SVG */}
              <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B4D3E" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Lines */}
                {[0, 1, 2, 3].map(i => (
                  <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#E2E8F0" strokeWidth="1" />
                ))}
                {/* Path */}
                <path 
                  d="M0,250 Q100,240 200,180 T400,150 T600,80 T800,100 T1000,40" 
                  fill="none" 
                  stroke="#1B4D3E" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                <path 
                  d="M0,250 Q100,240 200,180 T400,150 T600,80 T800,100 T1000,40 V300 H0 Z" 
                  fill="url(#chartGradient)" 
                />
                {/* Dots */}
                <circle cx="200" cy="180" r="5" fill="#1B4D3E" stroke="white" strokeWidth="2" />
                <circle cx="600" cy="80" r="5" fill="#1B4D3E" stroke="white" strokeWidth="2" />
                <circle cx="1000" cy="40" r="5" fill="#1B4D3E" stroke="white" strokeWidth="2" />
              </svg>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <span>01 Abr</span>
                <span>07 Abr</span>
                <span>14 Abr</span>
                <span>21 Abr</span>
                <span>30 Abr</span>
              </div>
            </div>
          </div>

          {/* Search Console Side Card */}
          <div className="bg-gradient-to-br from-granahub-primary to-granahub-dark p-8 rounded-3xl text-white shadow-xl shadow-granahub-primary/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Search className="w-5 h-5 opacity-70" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Search Console</span>
              </div>
              <h3 className="text-2xl font-bold mb-8 leading-tight">Melhore seu SEO orgânico</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">Impressões (30d)</p>
                  <p className="text-2xl font-bold italic">12.8K</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">Cliques Google</p>
                  <p className="text-2xl font-bold italic">1.4K</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">CTR Médio</p>
                  <div className="relative pt-1 border-b border-white/20 pb-2">
                    <span className="text-2xl font-black text-granahub-accent">10.9%</span>
                    <span className="ml-2 text-xs font-bold text-green-400">Acima da média</span>
                  </div>
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

        {/* Top Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-granahub-text flex items-center gap-2">
              <MousePointer2 className="w-5 h-5 text-granahub-primary" />
              Páginas Mais Acessadas
            </h3>
            <button className="text-xs font-bold text-granahub-primary hover:underline">Ver tudo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Página</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Views</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Taxa de Clique</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Tendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topPosts.map((post, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-granahub-text line-clamp-1">{post.title}</p>
                      <p className="text-[10px] font-medium text-gray-400 uppercase">/posts/slug-exemplo</p>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-black italic text-granahub-text">
                      {post.views}
                    </td>
                    <td className="px-8 py-5 text-right font-medium text-sm text-granahub-text-secondary">
                      {post.ctr}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded bg-opacity-10 text-[10px] font-black uppercase ${post.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {post.trend === 'up' ? 'Crescendo' : 'Queda'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] pt-8 border-t border-gray-100">
          <p>© 2026 GRANAHUB INTERNAL ANALYTICS ENGINE</p>
          <div className="flex gap-6">
            <span>Security: encrypted</span>
            <span>Status: online</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
