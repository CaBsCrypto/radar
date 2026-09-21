import React, { useState } from 'react';
import { MacroInvestmentStats } from '../types';
import { INVESTOR_PILLARS } from '../data/mockData';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Sun, 
  Globe2, 
  Cpu, 
  Award, 
  Calculator, 
  ArrowUpRight, 
  Download, 
  CheckCircle2,
  Building,
  Zap,
  ExternalLink
} from 'lucide-react';

interface InvestorOverviewProps {
  stats: MacroInvestmentStats;
  onExploreStartups: () => void;
  onExploreMap: () => void;
}

export const InvestorOverview: React.FC<InvestorOverviewProps> = ({
  stats,
  onExploreStartups,
  onExploreMap
}) => {
  // Interactive R&D Tax Credit Calculator State (in USD)
  const [plannedInvestmentUSD, setPlannedInvestmentUSD] = useState<number>(250000);
  const [currency, setCurrency] = useState<'USD' | 'CLP'>('USD');
  const usdToClpRate = 960;

  // Corfo Ley I+D calculation:
  // 35% direct tax credit against First Category Tax
  // 65% remaining is accepted as necessary expense (reducing 27% corporate tax)
  // Total effective government co-financing benefit ≈ 35% + (65% * 27%) = 52.55%
  const directTaxCreditUSD = plannedInvestmentUSD * 0.35;
  const corporateExpenseBenefitUSD = (plannedInvestmentUSD * 0.65) * 0.27;
  const totalTaxSavingsUSD = directTaxCreditUSD + corporateExpenseBenefitUSD;
  const netEffectiveCostUSD = plannedInvestmentUSD - totalTaxSavingsUSD;
  const effectiveSubsidyPercentage = ((totalTaxSavingsUSD / plannedInvestmentUSD) * 100).toFixed(1);

  const formatAmount = (usdVal: number) => {
    if (currency === 'CLP') {
      return `$${Math.round(usdVal * usdToClpRate).toLocaleString('es-CL')} CLP`;
    }
    return `$${Math.round(usdVal).toLocaleString('en-US')} USD`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Value Proposition for Foreign Capital */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/70 to-slate-900 border border-blue-800/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Portal de Inversión Tecnológica en Chile</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
              Chile: El Hub Estratégico de Inteligencia Artificial de Sudamérica
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Con el ranking #1 en el Índice Latinoamericano de IA (ILIA), la infraestructura de cómputo verde más avanzada del hemisferio y una ley de incentivo tributario que bonifica hasta el 35% de tus desarrollos tecnológicos en crédito directo.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreMap}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Ver Oportunidades en el Mapa</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreStartups}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Building className="w-4 h-4 text-blue-400" />
                <span>Explorar Directorio de Startups</span>
              </button>
            </div>
          </div>

          {/* Chile Geography Showcase Card with Iconic Silhouette */}
          <div 
            onClick={onExploreMap}
            className="w-full lg:w-72 flex-shrink-0 bg-slate-950/80 border border-blue-500/30 hover:border-blue-400/70 rounded-2xl p-4 shadow-xl backdrop-blur transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Territorio & Red AI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                16 Regiones
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              {/* Scaled Chile Silhouette SVG */}
              <div className="w-12 h-36 flex-shrink-0 flex items-center justify-center p-1 bg-slate-900/90 rounded-xl border border-blue-500/20 group-hover:border-blue-400 transition-colors">
                <svg viewBox="0 0 100 320" className="w-full h-full filter drop-shadow-[0_2px_10px_rgba(96,165,250,0.5)]">
                  <path
                    d="M 45,5 C 50,7 56,12 55,20 C 53,26 50,32 51,40 C 52,48 56,60 55,75 C 54,90 51,105 50,120 C 49,135 48,150 46,165 C 44,180 43,195 42,210 C 41,225 39,240 40,255 C 41,270 48,285 58,295 C 65,300 58,308 48,305 C 40,300 36,285 34,270 C 32,255 30,240 32,225 C 33,210 35,195 36,180 C 37,165 39,150 40,135 C 41,120 40,105 38,90 C 37,75 36,60 38,45 C 40,30 42,15 45,5 Z"
                    fill="#60a5fa"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  {/* Santiago indicator */}
                  <circle cx="48" cy="140" r="3.5" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                  <circle cx="48" cy="140" r="2.5" fill="#ffffff" />
                  {/* Atacama Solar */}
                  <circle cx="46" cy="70" r="2" fill="#fbbf24" />
                  {/* Patagonia Wind */}
                  <circle cx="48" cy="275" r="2" fill="#34d399" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white font-['Outfit']">
                  Geografía Estratégica
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  4.300 km que combinan energía solar en el desierto para Data Centers verdes y fibra óptica transoceánica con el Cable Humboldt.
                </p>
                <div className="mt-2 text-[10px] text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explorar mapa interactivo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Macro Metrics Cards */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Inversión VC</div>
            <div className="text-xl font-extrabold text-white font-['Outfit'] mt-0.5">{stats.ventureCapitalUSD}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">+18% anual</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Empresas de IA</div>
            <div className="text-xl font-extrabold text-blue-400 font-['Outfit'] mt-0.5">{stats.totalAICompanies}+</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Startups, scaleups y R&D</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Ranking ILIA</div>
            <div className="text-xl font-extrabold text-amber-400 font-['Outfit'] mt-0.5">#1 LatAm</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Score: {stats.iliaScore}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Data Centers</div>
            <div className="text-xl font-extrabold text-teal-400 font-['Outfit'] mt-0.5">{stats.dataCentersTotal}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Google, AWS, MSFT, Huawei</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Desarrolladores</div>
            <div className="text-xl font-extrabold text-indigo-400 font-['Outfit'] mt-0.5">{stats.activeDevelopers.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Talento bilingüe STEM</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Conexión Global</div>
            <div className="text-xl font-extrabold text-rose-400 font-['Outfit'] mt-0.5">Humboldt</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cable Asia-Oceanía</div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Why Chile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INVESTOR_PILLARS.map((pillar, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-blue-400 font-mono mb-2">0{idx + 1}.</div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">{pillar.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{pillar.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-base font-extrabold text-emerald-400 font-['Outfit']">{pillar.metric}</div>
              <div className="text-[10px] text-slate-400">{pillar.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Corfo Ley I+D Tax Credit Simulator */}
      <div className="bg-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Simulador Ley I+D N° 20.241 (Corfo)
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Incentivo para empresas extranjeras y chilenas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] mt-1">
              Calcula el Ahorro Tributario de tu Inversión en IA en Chile
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Tanto empresas internacionales con filial en Chile como startups locales pueden aplicar al crédito del 35% directo contra impuestos corporativos por gastos en desarrollo e I+D tecnológico.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end lg:self-auto">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('CLP')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currency === 'CLP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              CLP ($)
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Slider input */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                <span className="font-semibold">Presupuesto anual estimado en I+D / Equipo de IA:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{formatAmount(plannedInvestmentUSD)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="25000"
                value={plannedInvestmentUSD}
                onChange={(e) => setPlannedInvestmentUSD(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>$50,000 USD (Seed)</span>
                <span>$1,000,000 USD (Scaleup)</span>
                <span>$2,000,000+ USD (Corporativo)</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>35% Crédito Fiscal Directo:</strong> Descuenta directamente el monto a pagar en el Impuesto de Primera Categoría (hasta 15.000 UTM anuales).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>65% Gasto Aceptado:</strong> El saldo restante se descuenta de la base imponible como gasto necesario, generando un 27% adicional de ahorro sobre ese tramo.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Certificación oficial Corfo:</strong> Proceso digital estandarizado con resolución vinculante para el Servicio de Impuestos Internos (SII).</span>
              </div>
            </div>
          </div>

          {/* Results summary panel */}
          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400">Inversión Bruta Total:</span>
              <span className="text-sm font-bold text-white font-mono">{formatAmount(plannedInvestmentUSD)}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-300">1. Crédito Tributario Directo (35%):</span>
              <span className="font-bold text-emerald-400 font-mono">-{formatAmount(directTaxCreditUSD)}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-300">2. Ahorro por Gasto Tributario (65% * 27%):</span>
              <span className="font-bold text-teal-400 font-mono">-{formatAmount(corporateExpenseBenefitUSD)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-300 block">Ahorro Fiscal Efectivo Total ({effectiveSubsidyPercentage}%):</span>
                <span className="text-[10px] text-slate-400">Beneficio consolidado del Estado</span>
              </div>
              <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                {formatAmount(totalTaxSavingsUSD)}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Costo Neto Efectivo:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {formatAmount(netEffectiveCostUSD)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Tech Titans Operating in Chile */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-400" />
          Infraestructura Global & Inversionistas Activos en Chile
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-white">Google Cloud</span>
            <p className="text-[11px] text-slate-400 mt-1">Data Center Quilicura + Segunda región de nube inaugurada.</p>
            <span className="text-[10px] text-blue-400 font-medium mt-2">Expansión $140M USD</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-white">Amazon Web Services</span>
            <p className="text-[11px] text-slate-400 mt-1">AWS Local Zone Santiago conectada con observatorios ALMA.</p>
            <span className="text-[10px] text-orange-400 font-medium mt-2">Baja Latencia & Edge</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-white">Microsoft</span>
            <p className="text-[11px] text-slate-400 mt-1">Región de centros de datos "Transforma Chile" con IA Azure.</p>
            <span className="text-[10px] text-cyan-400 font-medium mt-2">En construcción activa</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-white">Cable Humboldt</span>
            <p className="text-[11px] text-slate-400 mt-1">14,800 km de fibra óptica Valparaíso - Sydney - Auckland.</p>
            <span className="text-[10px] text-emerald-400 font-medium mt-2">Conexión Transpacífica</span>
          </div>
        </div>
      </div>
    </div>
  );
};
