/* ==========================================================================
   Bloque Diez — Inversiones Inteligentes | Core Application (SPA Preview)
   Arquitectura modular preparada para migración a Hostinger + Supabase
   Desarrollo técnico por WEBIFY
   ========================================================================== */

(() => {
  'use strict';

  // Constantes de configuración (editables para producción)
  const STORAGE_KEY = 'bloque_diez_webify_state_v1';
  const BCH_EXCHANGE_RATE = 25.00; // L 25.00 = US$ 1.00 (tasa referencial BCH)
  const PLATFORM_FEE_RATE = 0.05;  // 5% comisión operativa estimada
  const CATEGORIES = ['Productivos', 'Sociales', 'Ambientales', 'Innovación'];
  const STAGES = [
    'Aporte Recibido',
    'Verificado',
    'Asignado al Proyecto',
    'Ejecutado en Campo',
  ];

  // Referencias a gráficos de Chart.js para limpiar antes de redibujar
  let categoryChartInstance = null;
  let comparisonChartInstance = null;

  // Estado UI efímero (filtros, búsqueda, folio activo)
  const ui = {
    verticalFilter: 'Todos', // 'Todos' | 'Donaciones' | 'Inversiones'
    categoryFilter: 'Todas',
    searchQuery: '',
    registryFilter: 'Todos',
    activeFolioSearch: '',
    selectedAmount: 1500,
  };

  /* ------------------------------------------------------------------------
     1. DATOS SEMILLA (SEED DATA) REALISTAS DE HONDURAS
     ------------------------------------------------------------------------ */
  function createSeedState() {
    return {
      role: 'visitante', // visitante | organizacion | aprobador | admin
      currency: 'HNL',   // HNL | USD
      nextFolioSeq: 49,
      projects: [
        {
          id: 'proj-marcala',
          title: 'Café Orgánico de Altura — Marcala',
          organization: 'Cooperativa Cafetalera Sierra de La Paz',
          vertical: 'Inversiones',
          category: 'Productivos',
          location: 'Marcala, La Paz',
          goalHNL: 350000,
          raisedHNL: 267500,
          daysLeft: 18,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: 14.5,
          termMonths: 18,
          esgLevel: 'ASG Oro · Comercio Justo',
          communitiesImpacted: 4,
          summary:
            'Capital de trabajo para 38 pequeños productores con menos de 4 manzanas que acceden a certificación orgánica y exportación directa sin intermediarios.',
          impactMetric: '38 familias productoras · +42% ingreso neto anual estimado',
          createdAt: '2026-10-08',
          updates: [
            {
              date: '2026-11-12',
              title: 'Instalación de secadoras solares completada',
              detail: 'Se completó la entrega de 12 módulos de secado parabólico en las comunidades de Chinacla y Marcala.',
            },
            {
              date: '2026-10-25',
              title: 'Auditoría técnica de suelo aprobada',
              detail: 'Ingenieros agrónomos validaron trazabilidad orgánica en el 100% de las parcelas participantes.',
            },
          ],
        },
        {
          id: 'proj-latigra',
          title: 'Reforestación Parque Nacional La Tigra',
          organization: 'Fundación Bosques del Distrito',
          vertical: 'Donaciones',
          category: 'Ambientales',
          location: 'Francisco Morazán',
          goalHNL: 220000,
          raisedHNL: 171600,
          daysLeft: 12,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: null,
          termMonths: null,
          esgLevel: 'ASG Platino · Cuencas',
          communitiesImpacted: 6,
          summary:
            'Siembra y monitoreo satelital de 18,000 árboles nativos en la zona de recarga hídrica que abastece al 30% de Tegucigalpa.',
          impactMetric: '18,000 árboles nativos · 240 hectáreas protegidas',
          createdAt: '2026-10-10',
          updates: [
            {
              date: '2026-11-14',
              title: 'Jornada comunitaria alcanzó 11,500 plántulas',
              detail: 'Más de 140 voluntarios locales y guardabosques completaron la segunda fase de siembra.',
            },
          ],
        },
        {
          id: 'proj-elporvenir',
          title: 'Sistema de Agua Comunitaria — El Porvenir',
          organization: 'Patronato Regional Agua Viva',
          vertical: 'Donaciones',
          category: 'Sociales',
          location: 'El Porvenir, Francisco Morazán',
          goalHNL: 185000,
          raisedHNL: 118500,
          daysLeft: 24,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: null,
          termMonths: null,
          esgLevel: 'ASG Oro · Salud Comunitaria',
          communitiesImpacted: 3,
          summary:
            'Construcción de tanque de almacenamiento, filtros de potabilización y red de distribución domiciliar para 210 hogares rurales.',
          impactMetric: '210 hogares con agua potable · 980 personas beneficiadas',
          createdAt: '2026-10-15',
          updates: [
            {
              date: '2026-11-09',
              title: 'Compra de tubería PVC certificada',
              detail: 'Se desembolsó el primer tramo verificado para adquisición de materiales y excavación comunitaria.',
            },
          ],
        },
        {
          id: 'proj-roatan',
          title: 'Planta de Reciclaje y Residuos — Roatán',
          organization: 'EcoIslas Circular S. de R.L.',
          vertical: 'Inversiones',
          category: 'Ambientales',
          location: 'Roatán, Islas de la Bahía',
          goalHNL: 420000,
          raisedHNL: 235000,
          daysLeft: 31,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: 13.0,
          termMonths: 24,
          esgLevel: 'ASG Platino · Economía Circular',
          communitiesImpacted: 5,
          summary:
            'Compactadora industrial de plástico PET y vidrio recuperado de zonas costeras para transformación en madera plástica vendida al sector hotelero.',
          impactMetric: '48 toneladas/año recuperadas · 14 empleos verdes formales',
          createdAt: '2026-10-18',
          updates: [
            {
              date: '2026-11-10',
              title: 'Convenio firmado con 11 hoteles de West Bay',
              detail: 'Asegurada la recolección diaria y la compra anticipada de mobiliario exterior reciclado.',
            },
          ],
        },
        {
          id: 'proj-choluteca',
          title: 'Energía Solar para Microempresas — Choluteca',
          organization: 'CRAC Sol del Sur',
          vertical: 'Inversiones',
          category: 'Productivos',
          location: 'Choluteca, Choluteca',
          goalHNL: 310000,
          raisedHNL: 248000,
          daysLeft: 9,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: 15.2,
          termMonths: 15,
          esgLevel: 'ASG Oro · Energía Limpia',
          communitiesImpacted: 4,
          summary:
            'Financiamiento flexible para instalar kits fotovoltaicos en 22 pulperías, talleres y procesadoras de lácteos reduciendo hasta 65% su factura eléctrica.',
          impactMetric: '22 microempresas · -38 toneladas de CO₂ anuales',
          createdAt: '2026-10-20',
          updates: [
            {
              date: '2026-11-15',
              title: 'Primeros 9 sistemas conectados y generando ahorro',
              detail: 'Comercios reportan reducción inmediata en costos energéticos y continuidad ante cortes.',
            },
          ],
        },
        {
          id: 'proj-copan',
          title: 'Academia de Tecnología Rural — Copán',
          organization: 'Red Juvenil Digital Occidente',
          vertical: 'Donaciones',
          category: 'Innovación',
          location: 'Santa Rosa de Copán, Copán',
          goalHNL: 160000,
          raisedHNL: 122000,
          daysLeft: 16,
          status: 'Aprobado',
          rejectionReason: '',
          expectedReturn: null,
          termMonths: null,
          esgLevel: 'ASG Oro · Inclusión Digital',
          communitiesImpacted: 5,
          summary:
            'Laboratorio equipado con 20 estaciones de trabajo, internet satelital y becas de programación web e inteligencia artificial para jóvenes rurales.',
          impactMetric: '120 jóvenes capacitados/año · Inserción laboral remota',
          createdAt: '2026-10-22',
          updates: [
            {
              date: '2026-11-11',
              title: 'Conectividad satelital instalada en sede comunitaria',
              detail: 'Pruebas de velocidad confirmadas en 180 Mbps para clases sincrónicas.',
            },
          ],
        },
        // 2 Proyectos Pendientes en Cola de Aprobación
        {
          id: 'proj-pend-1',
          title: 'Sensores IoT de Riego Inteligente — Comayagua',
          organization: 'AgroTech Valle Central',
          vertical: 'Inversiones',
          category: 'Innovación',
          location: 'Comayagua, Comayagua',
          goalHNL: 260000,
          raisedHNL: 0,
          daysLeft: 35,
          status: 'En Revisión',
          rejectionReason: '',
          expectedReturn: 16.0,
          termMonths: 18,
          esgLevel: 'ASG Oro · Agro-Innovación',
          communitiesImpacted: 3,
          summary:
            'Despliegue de sensores de humedad de bajo costo y válvulas automatizadas para optimizar en 40% el uso de agua en 15 fincas hortícolas.',
          impactMetric: '40% ahorro de agua · +28% rendimiento por manzana',
          createdAt: '2026-11-16',
          updates: [],
        },
        {
          id: 'proj-pend-2',
          title: 'Clínica Móvil Materno-Infantil — Olancho',
          organization: 'Asociación Salud para Todos HN',
          vertical: 'Donaciones',
          category: 'Sociales',
          location: 'Catacamas, Olancho',
          goalHNL: 195000,
          raisedHNL: 0,
          daysLeft: 28,
          status: 'En Revisión',
          rejectionReason: '',
          expectedReturn: null,
          termMonths: null,
          esgLevel: 'ASG Platino · Salud Rural',
          communitiesImpacted: 8,
          summary:
            'Equipamiento médico portátil y telemedicina para brigadas mensuales en 8 aldeas sin acceso cercano a centros de salud.',
          impactMetric: '650 madres y niños atendidos en el primer año',
          createdAt: '2026-11-17',
          updates: [],
        },
      ],
      contributions: [
        {
          folio: 'B10-2026-0041',
          projectId: 'proj-marcala',
          projectTitle: 'Café Orgánico de Altura — Marcala',
          vertical: 'Inversiones',
          category: 'Productivos',
          amountHNL: 95000,
          donorName: 'Grupo Inversor Tegucigalpa',
          donorEmail: 'tesoreria@grupoinversortgu.hn',
          anonymous: false,
          paymentMethod: 'Transferencia Bancaria (BAC / Ficohsa)',
          date: '2026-11-02 10:14',
          stageIndex: 3, // Ejecutado en Campo
        },
        {
          folio: 'B10-2026-0042',
          projectId: 'proj-latigra',
          projectTitle: 'Reforestación Parque Nacional La Tigra',
          vertical: 'Donaciones',
          category: 'Ambientales',
          amountHNL: 75000,
          donorName: 'Valeria Mendoza',
          donorEmail: 'valeria.mendoza@correo.hn',
          anonymous: true,
          paymentMethod: 'Tarjeta de Crédito/Débito (PixelPay / BAC)',
          date: '2026-11-04 14:32',
          stageIndex: 3,
        },
        {
          folio: 'B10-2026-0043',
          projectId: 'proj-choluteca',
          projectTitle: 'Energía Solar para Microempresas — Choluteca',
          vertical: 'Inversiones',
          category: 'Productivos',
          amountHNL: 120000,
          donorName: 'Cooperativa Horizonte S.A.',
          donorEmail: 'inversiones@horizontehn.com',
          anonymous: false,
          paymentMethod: 'Transferencia Bancaria (BAC / Ficohsa)',
          date: '2026-11-06 09:45',
          stageIndex: 3,
        },
        {
          folio: 'B10-2026-0044',
          projectId: 'proj-roatan',
          projectTitle: 'Planta de Reciclaje y Residuos — Roatán',
          vertical: 'Inversiones',
          category: 'Ambientales',
          amountHNL: 85000,
          donorName: 'Carlos Alberto Pineda',
          donorEmail: 'cpineda@impactlatam.org',
          anonymous: true,
          paymentMethod: 'PayPal / Tarjeta Internacional',
          date: '2026-11-08 16:20',
          stageIndex: 2, // Asignado al Proyecto
        },
        {
          folio: 'B10-2026-0045',
          projectId: 'proj-elporvenir',
          projectTitle: 'Sistema de Agua Comunitaria — El Porvenir',
          vertical: 'Donaciones',
          category: 'Sociales',
          amountHNL: 52500,
          donorName: 'Fundación Aliados del Centro',
          donorEmail: 'donaciones@aliadoscentro.org',
          anonymous: false,
          paymentMethod: 'Transferencia Bancaria (BAC / Ficohsa)',
          date: '2026-11-11 11:05',
          stageIndex: 2,
        },
        {
          folio: 'B10-2026-0046',
          projectId: 'proj-copan',
          projectTitle: 'Academia de Tecnología Rural — Copán',
          vertical: 'Donaciones',
          category: 'Innovación',
          amountHNL: 64000,
          donorName: 'Andrea Sofía Zelaya',
          donorEmail: 'andrea.zelaya@techhn.io',
          anonymous: false,
          paymentMethod: 'Tarjeta de Crédito/Débito (PixelPay / BAC)',
          date: '2026-11-13 18:10',
          stageIndex: 2,
        },
        {
          folio: 'B10-2026-0047',
          projectId: 'proj-marcala',
          projectTitle: 'Café Orgánico de Altura — Marcala',
          vertical: 'Inversiones',
          category: 'Productivos',
          amountHNL: 47500,
          donorName: 'Roberto Mejía',
          donorEmail: 'rmejia@capitalverde.hn',
          anonymous: true,
          paymentMethod: 'PayPal / Tarjeta Internacional',
          date: '2026-11-15 13:50',
          stageIndex: 1, // Verificado
        },
        {
          folio: 'B10-2026-0048',
          projectId: 'proj-latigra',
          projectTitle: 'Reforestación Parque Nacional La Tigra',
          vertical: 'Donaciones',
          category: 'Ambientales',
          amountHNL: 38000,
          donorName: 'Elena & Ricardo Fuentes',
          donorEmail: 'fuentes.fam@mail.hn',
          anonymous: false,
          paymentMethod: 'Tarjeta de Crédito/Débito (PixelPay / BAC)',
          date: '2026-11-17 08:40',
          stageIndex: 1,
        },
      ],
      decisions: [
        {
          date: '2026-10-22 15:10',
          projectTitle: 'Academia de Tecnología Rural — Copán',
          decision: 'Aprobado',
          reason: 'Cumple criterios de impacto medible, presupuesto auditado y aval comunitario.',
          actor: 'Comité de Aprobación B10',
        },
        {
          date: '2026-10-20 11:25',
          projectTitle: 'Energía Solar para Microempresas — Choluteca',
          decision: 'Aprobado',
          reason: 'Due Diligence financiero satisfactorio y respaldo de CRAC Sol del Sur.',
          actor: 'Comité de Aprobación B10',
        },
      ],
      auditLog: [
        {
          timestamp: '2026-11-17 09:15',
          actor: 'Asociación Salud para Todos HN (Organización)',
          action: 'Creación de Proyecto',
          detail: 'Postuló "Clínica Móvil Materno-Infantil — Olancho" para revisión.',
        },
        {
          timestamp: '2026-11-17 08:40',
          actor: 'Sistema de Pagos / Trazabilidad',
          action: 'Nuevo Aporte Verificado',
          detail: 'Folio B10-2026-0048 registrado por L 38,000.00 en Reforestación La Tigra.',
        },
        {
          timestamp: '2026-11-16 16:05',
          actor: 'AgroTech Valle Central (Organización)',
          action: 'Creación de Proyecto',
          detail: 'Postuló "Sensores IoT de Riego Inteligente — Comayagua" (Inversión 16% anual).',
        },
        {
          timestamp: '2026-11-15 13:50',
          actor: 'Sistema de Pagos / Trazabilidad',
          action: 'Nuevo Aporte Verificado',
          detail: 'Folio B10-2026-0047 (Anónimo Público) registrado por L 47,500.00 en Café Marcala.',
        },
        {
          timestamp: '2026-11-14 10:00',
          actor: 'Fundación Bosques del Distrito (Organización)',
          action: 'Actualización de Avance',
          detail: 'Publicó reporte de campo en Reforestación Parque Nacional La Tigra.',
        },
      ],
    };
  }

  /* ------------------------------------------------------------------------
     2. PERSISTENCIA EN LOCALSTORAGE Y UTILIDADES
     ------------------------------------------------------------------------ */
  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.contributions)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('No se pudo leer localStorage, usando datos iniciales.', err);
    }
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }

  function saveState(nextState = state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage.', err);
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nowTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function formatMoney(amountHNL, compact = false) {
    const isUSD = state.currency === 'USD';
    const val = isUSD ? amountHNL / BCH_EXCHANGE_RATE : amountHNL;
    const prefix = isUSD ? 'US$ ' : 'L ';

    if (compact && val >= 1000000) {
      return `${prefix}${(val / 1000000).toFixed(2)}M`;
    }
    return `${prefix}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function logAudit(actor, action, detail) {
    state.auditLog.unshift({
      timestamp: nowTimestamp(),
      actor,
      action,
      detail,
    });
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const palette = {
      success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-200',
      info: 'border-blue-500/40 bg-slate-900/95 text-blue-200',
      warning: 'border-amber-500/40 bg-slate-900/95 text-amber-200',
      error: 'border-rose-500/40 bg-slate-900/95 text-rose-200',
    };
    const iconName = {
      success: 'check-circle-2',
      info: 'info',
      warning: 'alert-triangle',
      error: 'x-circle',
    }[type] || 'check-circle-2';

    const el = document.createElement('div');
    el.className = `pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl animate-fade-up ${palette[type] || palette.success}`;
    el.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 mt-0.5 shrink-0"></i>
      <p class="text-xs sm:text-sm font-medium leading-snug text-slate-100">${escapeHtml(message)}</p>
    `;
    container.appendChild(el);
    lucide.createIcons();

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, 3600);
  }

  /* ------------------------------------------------------------------------
     3. ILUSTRACIONES SVG FINTECH LIMPIAS POR CATEGORÍA (NUNCA SE ROMPEN)
     ------------------------------------------------------------------------ */
  function getCategoryVisual(category, vertical) {
    const configs = {
      Productivos: {
        gradient: 'from-blue-600/35 via-indigo-900/60 to-slate-950',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        stroke: '#60A5FA',
        accent: '#10B981',
        svg: `
          <path d="M24 92 L58 64 L88 74 L132 36 L176 48 L216 20" stroke="#10B981" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle cx="132" cy="36" r="5" fill="#10B981"/>
          <circle cx="216" cy="20" r="6" fill="#60A5FA"/>
          <rect x="34" y="84" width="14" height="26" rx="3" fill="rgba(59,130,246,0.35)"/>
          <rect x="64" y="72" width="14" height="38" rx="3" fill="rgba(59,130,246,0.45)"/>
          <rect x="94" y="64" width="14" height="46" rx="3" fill="rgba(59,130,246,0.55)"/>
          <rect x="124" y="48" width="14" height="62" rx="3" fill="rgba(16,185,129,0.5)"/>
          <rect x="154" y="54" width="14" height="56" rx="3" fill="rgba(16,185,129,0.6)"/>
          <rect x="184" y="34" width="14" height="76" rx="3" fill="rgba(59,130,246,0.75)"/>
        `,
      },
      Ambientales: {
        gradient: 'from-emerald-600/35 via-teal-950/70 to-slate-950',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        stroke: '#34D399',
        accent: '#3B82F6',
        svg: `
          <circle cx="185" cy="36" r="24" fill="rgba(16,185,129,0.18)" stroke="rgba(52,211,153,0.45)" stroke-width="1.5"/>
          <path d="M18 102 Q72 48 124 84 T236 62 L236 120 L18 120 Z" fill="rgba(16,185,129,0.22)"/>
          <path d="M18 108 Q95 70 158 94 T236 80 L236 120 L18 120 Z" fill="rgba(59,130,246,0.22)"/>
          <path d="M74 92 C74 62 96 42 120 42 C120 68 102 92 74 92 Z" fill="rgba(16,185,129,0.45)" stroke="#34D399" stroke-width="2"/>
          <line x1="74" y1="92" x2="112" y2="50" stroke="#A7F3D0" stroke-width="1.5"/>
        `,
      },
      Sociales: {
        gradient: 'from-cyan-600/30 via-blue-950/70 to-slate-950',
        badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        stroke: '#38BDF8',
        accent: '#3B82F6',
        svg: `
          <circle cx="80" cy="58" r="16" fill="rgba(56,189,248,0.22)" stroke="#38BDF8" stroke-width="2"/>
          <circle cx="128" cy="46" r="20" fill="rgba(59,130,246,0.28)" stroke="#60A5FA" stroke-width="2"/>
          <circle cx="176" cy="58" r="16" fill="rgba(16,185,129,0.22)" stroke="#34D399" stroke-width="2"/>
          <path d="M50 104 C50 84 64 78 80 78 C96 78 110 84 110 104" stroke="#38BDF8" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <path d="M94 108 C94 82 110 72 128 72 C146 72 162 82 162 108" stroke="#60A5FA" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M146 104 C146 84 160 78 176 78 C192 78 206 84 206 104" stroke="#34D399" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        `,
      },
      'Innovación': {
        gradient: 'from-violet-600/30 via-blue-950/70 to-slate-950',
        badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        stroke: '#A78BFA',
        accent: '#3B82F6',
        svg: `
          <circle cx="64" cy="44" r="7" fill="#60A5FA"/>
          <circle cx="128" cy="34" r="9" fill="#10B981"/>
          <circle cx="190" cy="52" r="7" fill="#A78BFA"/>
          <circle cx="96" cy="86" r="8" fill="#38BDF8"/>
          <circle cx="164" cy="90" r="8" fill="#3B82F6"/>
          <path d="M64 44 L128 34 L190 52 L164 90 L96 86 Z" stroke="rgba(148,163,184,0.45)" stroke-width="1.8" fill="rgba(59,130,246,0.08)"/>
          <line x1="128" y1="34" x2="96" y2="86" stroke="rgba(56,189,248,0.45)" stroke-width="1.5"/>
          <line x1="128" y1="34" x2="164" y2="90" stroke="rgba(16,185,129,0.5)" stroke-width="1.5"/>
        `,
      },
    };
    const c = configs[category] || configs.Productivos;
    const verticalBadge =
      vertical === 'Inversiones'
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
        : 'bg-blue-500/20 text-blue-300 border-blue-400/35';

    return { ...c, verticalBadge };
  }

  /* ------------------------------------------------------------------------
     4. ENRUTAMIENTO HASH Y SINCRONIZACIÓN DE HEADER
     ------------------------------------------------------------------------ */
  function parseRoute() {
    const raw = window.location.hash || '#/explorar';
    const [pathPart, queryPart] = raw.replace(/^#/, '').split('?');
    const route = (pathPart || '/explorar').replace(/^\//, '');
    const params = new URLSearchParams(queryPart || '');
    return { route: ['explorar', 'transparencia', 'panel'].includes(route) ? route : 'explorar', params };
  }

  function syncHeaderUI(activeRoute) {
    // Nav links
    document.querySelectorAll('[data-nav], [data-nav-mobile]').forEach((el) => {
      const target = el.getAttribute('data-nav') || el.getAttribute('data-nav-mobile');
      el.classList.toggle('active', target === activeRoute);
    });

    // Role selectors
    const desktopSel = document.getElementById('role-selector');
    const mobileSel = document.getElementById('role-selector-mobile');
    if (desktopSel) desktopSel.value = state.role;
    if (mobileSel) mobileSel.value = state.role;

    // Panel label & pending badge
    const pendingCount = state.projects.filter((p) => p.status === 'En Revisión').length;
    const badge = document.getElementById('nav-pending-badge');
    const panelLabel = document.getElementById('nav-panel-label');
    const roleNames = {
      visitante: 'Panel Operativo',
      organizacion: 'Mi Organización',
      aprobador: 'Cola Aprobación',
      admin: 'Admin / Auditor',
    };
    if (panelLabel) panelLabel.textContent = roleNames[state.role] || 'Panel Operativo';
    if (badge) {
      if (pendingCount > 0 && (state.role === 'aprobador' || state.role === 'admin')) {
        badge.textContent = String(pendingCount);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    // Currency buttons
    const btnHNL = document.getElementById('btn-curr-HNL');
    const btnUSD = document.getElementById('btn-curr-USD');
    if (btnHNL) btnHNL.classList.toggle('active', state.currency === 'HNL');
    if (btnUSD) btnUSD.classList.toggle('active', state.currency === 'USD');
  }

  function renderApp() {
    const { route, params } = parseRoute();
    syncHeaderUI(route);

    if (params.get('folio')) {
      ui.activeFolioSearch = params.get('folio').trim().toUpperCase();
    }

    const root = document.getElementById('app-root');
    if (!root) return;

    destroyCharts();

    if (route === 'explorar') {
      root.innerHTML = renderExploreView();
    } else if (route === 'transparencia') {
      root.innerHTML = renderTransparencyView();
      initTransparencyCharts();
    } else if (route === 'panel') {
      root.innerHTML = renderPanelView();
    }

    lucide.createIcons();
  }

  function destroyCharts() {
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }
    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
      comparisonChartInstance = null;
    }
  }

  /* ------------------------------------------------------------------------
     5. VISTA A: EXPLORAR PROYECTOS (#/explorar)
     ------------------------------------------------------------------------ */
  function renderExploreView() {
    const approved = state.projects.filter((p) => p.status === 'Aprobado');
    const totalRaisedHNL = approved.reduce((acc, p) => acc + p.raisedHNL, 0);
    const totalContributions = state.contributions.length;
    const totalCommunities = approved.reduce((acc, p) => acc + (p.communitiesImpacted || 1), 0);

    // Filtrado
    const filtered = approved.filter((p) => {
      const matchVertical = ui.verticalFilter === 'Todos' || p.vertical === ui.verticalFilter;
      const matchCategory = ui.categoryFilter === 'Todas' || p.category === ui.categoryFilter;
      const q = ui.searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q);
      return matchVertical && matchCategory && matchQuery;
    });

    return `
      <!-- Hero Fintech -->
      <section class="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10 mb-10 animate-fade-up">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-7 space-y-5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i>
              Finanzas Sostenibles e Impacto Medible · Honduras
            </div>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Democratizando el acceso al financiamiento de
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">alto impacto</span>
              en Honduras.
            </h1>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Conectamos proyectos productivos, ambientales, sociales y de innovación con donantes e inversionistas bajo trazabilidad por folio, métricas verificables y privacidad configurable.
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-1">
              <button onclick="document.getElementById('catalogo-proyectos')?.scrollIntoView({behavior:'smooth'})" class="btn-primary px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <i data-lucide="layers" class="w-4 h-4"></i>
                Explorar Proyectos
              </button>
              <a href="#/transparencia" class="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 inline-flex items-center gap-2 transition">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
                Ver Transparencia y Folios
              </a>
            </div>
          </div>

          <!-- Tarjeta de Métricas Globales Dinámicas -->
          <div class="lg:col-span-5">
            <div class="rounded-2xl bg-[#070B14]/85 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-2xl">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumen en Tiempo Real</span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  100% Auditable
                </span>
              </div>

              <div class="p-4 rounded-xl bg-gradient-to-br from-blue-600/15 to-emerald-500/10 border border-blue-500/20">
                <p class="text-xs text-slate-400 mb-1">Capital Total Movilizado</p>
                <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tabular-nums">${formatMoney(totalRaisedHNL)}</p>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <p class="text-[11px] text-slate-400">Aportes</p>
                  <p class="font-display text-xl font-bold text-white tabular-nums mt-0.5">${totalContributions}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <p class="text-[11px] text-slate-400">Activos</p>
                  <p class="font-display text-xl font-bold text-emerald-400 tabular-nums mt-0.5">${approved.length}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <p class="text-[11px] text-slate-400">Comunidades</p>
                  <p class="font-display text-xl font-bold text-blue-400 tabular-nums mt-0.5">${totalCommunities}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Barra de Verticales (Donaciones / Inversiones), Categorías y Buscador -->
      <section id="catalogo-proyectos" class="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Switch Doble Vertical -->
          <div class="inline-flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800 self-start">
            ${['Todos', 'Donaciones', 'Inversiones']
              .map((v) => {
                const active = ui.verticalFilter === v;
                return `
                  <button onclick="B10.setVerticalFilter('${v}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white'
                }">
                    ${v === 'Donaciones' ? '<i data-lucide="heart-handshake" class="w-4 h-4"></i>' : ''}
                    ${v === 'Inversiones' ? '<i data-lucide="trending-up" class="w-4 h-4"></i>' : ''}
                    ${v === 'Todos' ? '<i data-lucide="grid-2x2" class="w-4 h-4"></i>' : ''}
                    ${v}
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Buscador en tiempo real -->
          <div class="relative w-full lg:w-80">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            <input
              type="text"
              value="${escapeHtml(ui.searchQuery)}"
              oninput="B10.setSearchQuery(this.value)"
              placeholder="Buscar por proyecto o departamento..."
              class="input-fintech w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <!-- Filtros de 4 Categorías Oficiales -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-400 font-medium mr-1">Categoría:</span>
          ${['Todas', ...CATEGORIES]
            .map((cat) => {
              const active = ui.categoryFilter === cat;
              return `
                <button onclick="B10.setCategoryFilter('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                active
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }">
                  ${cat}
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Grid de Proyectos -->
        ${
          filtered.length === 0
            ? `
            <div class="glass-card rounded-2xl p-12 text-center space-y-3">
              <i data-lucide="search-x" class="w-10 h-10 text-slate-500 mx-auto"></i>
              <h3 class="font-display font-bold text-lg text-white">No encontramos proyectos con esos filtros</h3>
              <p class="text-sm text-slate-400">Probá limpiar el buscador o cambiar de vertical/categoría.</p>
              <button onclick="B10.clearExploreFilters()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition">Mostrar todos los proyectos</button>
            </div>
          `
            : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${filtered.map((p) => renderProjectCard(p)).join('')}
            </div>
          `
        }
      </section>
    `;
  }

  function renderProjectCard(p) {
    const pct = Math.min(100, Math.round((p.raisedHNL / p.goalHNL) * 100));
    const vis = getCategoryVisual(p.category, p.vertical);
    const isInvestment = p.vertical === 'Inversiones';

    return `
      <article class="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col">
        <!-- Cabecera visual SVG -->
        <div class="relative h-36 bg-gradient-to-br ${vis.gradient} border-b border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
          <svg viewBox="0 0 250 120" class="absolute inset-0 w-full h-full opacity-90 pointer-events-none" preserveAspectRatio="none">
            ${vis.svg}
          </svg>
          <div class="relative z-10 flex items-center justify-between gap-2">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${vis.verticalBadge}">
              ${isInvestment ? 'Inversión' : 'Donación'}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${vis.badge}">
              ${escapeHtml(p.category)}
            </span>
          </div>
          <div class="relative z-10 flex items-center gap-1.5 text-xs text-slate-200 font-medium">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>${escapeHtml(p.location)}</span>
          </div>
        </div>

        <!-- Cuerpo de la tarjeta -->
        <div class="p-5 flex-1 flex flex-col justify-between gap-4">
          <div class="space-y-2.5">
            <p class="text-[11px] font-medium text-slate-400 truncate">${escapeHtml(p.organization)}</p>
            <h3 class="font-display font-bold text-lg text-white leading-snug">${escapeHtml(p.title)}</h3>
            <p class="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">${escapeHtml(p.summary)}</p>

            ${
              isInvestment
                ? `
                <div class="grid grid-cols-3 gap-2 pt-2">
                  <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2">
                    <p class="text-[10px] text-emerald-300/80 uppercase font-semibold">Retorno est.</p>
                    <p class="text-sm font-bold text-emerald-300 tabular-nums">${p.expectedReturn}% anual</p>
                  </div>
                  <div class="rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-2">
                    <p class="text-[10px] text-slate-400 uppercase font-semibold">Plazo</p>
                    <p class="text-sm font-bold text-white tabular-nums">${p.termMonths} meses</p>
                  </div>
                  <div class="rounded-xl bg-blue-500/10 border border-blue-500/20 px-2.5 py-2">
                    <p class="text-[10px] text-blue-300/80 uppercase font-semibold">Nivel ASG</p>
                    <p class="text-[11px] font-bold text-blue-200 truncate" title="${escapeHtml(p.esgLevel)}">${escapeHtml(p.esgLevel.split('·')[0].trim())}</p>
                  </div>
                </div>
              `
                : `
                <div class="pt-2">
                  <div class="rounded-xl bg-slate-900/80 border border-slate-800/90 px-3 py-2 flex items-center gap-2 text-xs text-slate-300">
                    <i data-lucide="award" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                    <span class="truncate">${escapeHtml(p.impactMetric)}</span>
                  </div>
                </div>
              `
            }
          </div>

          <!-- Progreso y Acciones -->
          <div class="space-y-3 pt-2 border-t border-slate-800/70">
            <div>
              <div class="flex items-end justify-between text-xs mb-1.5">
                <div>
                  <span class="font-display font-bold text-sm text-white tabular-nums">${formatMoney(p.raisedHNL)}</span>
                  <span class="text-slate-400"> de <span class="tabular-nums">${formatMoney(p.goalHNL)}</span></span>
                </div>
                <span class="font-bold text-emerald-400 tabular-nums">${pct}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="progress-fill h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style="width: ${pct}%"></div>
              </div>
              <div class="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                <span class="inline-flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${p.daysLeft} días restantes</span>
                <span>${escapeHtml(p.esgLevel.split('·')[0].trim())}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <button onclick="B10.openProjectDetail('${p.id}')" class="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition">
                Ver Detalle
              </button>
              <button onclick="B10.openContributeModal('${p.id}')" class="${isInvestment ? 'btn-emerald' : 'btn-primary'} px-3 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <i data-lucide="${isInvestment ? 'trending-up' : 'heart'}" class="w-3.5 h-3.5"></i>
                ${isInvestment ? 'Invertir' : 'Aportar'}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  /* ------------------------------------------------------------------------
     6. VISTA B: TRANSPARENCIA, TRAZABILIDAD Y RANKING (#/transparencia)
     ------------------------------------------------------------------------ */
  function renderTransparencyView() {
    const sampleFolios = state.contributions.slice(0, 4).map((c) => c.folio);
    const activeFolioObj = ui.activeFolioSearch
      ? state.contributions.find((c) => c.folio.toUpperCase() === ui.activeFolioSearch.toUpperCase())
      : state.contributions[0];

    // Ranking de Top Colaboradores (agrupando por identidad pública o cada aporte anónimo)
    const leaderboardMap = new Map();
    state.contributions.forEach((c) => {
      const key = c.anonymous ? `ANON_${c.folio}` : `PUB_${c.donorName.toLowerCase()}`;
      if (!leaderboardMap.has(key)) {
        leaderboardMap.set(key, {
          displayName: c.anonymous ? 'Donante Anónimo' : c.donorName,
          anonymous: c.anonymous,
          totalHNL: 0,
          count: 0,
          folios: [],
        });
      }
      const entry = leaderboardMap.get(key);
      entry.totalHNL += c.amountHNL;
      entry.count += 1;
      entry.folios.push(c.folio);
    });
    const leaderboard = Array.from(leaderboardMap.values()).sort((a, b) => b.totalHNL - a.totalHNL);

    // Registro público filtrable
    const filteredRegistry = state.contributions.filter(
      (c) => ui.registryFilter === 'Todos' || c.vertical === ui.registryFilter
    );

    return `
      <div class="space-y-8 animate-fade-up">
        <!-- Encabezado Portal de Transparencia -->
        <section class="glass-card rounded-3xl p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                Trazabilidad Verificable sin Exponer Datos Personales (PII)
              </div>
              <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Portal de Transparencia y Consulta por Folio</h1>
              <p class="text-sm text-slate-400">
                Verificá en tiempo real el estado exacto de cada aporte desde su recepción hasta la ejecución en campo, protegiendo la privacidad de los donantes anónimos.
              </p>
            </div>

            <!-- Buscador de Folio -->
            <div class="w-full lg:w-[440px] space-y-2.5">
              <form onsubmit="B10.searchFolio(event)" class="flex gap-2">
                <div class="relative flex-1">
                  <i data-lucide="hash" class="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                  <input
                    id="folio-search-input"
                    type="text"
                    value="${escapeHtml(ui.activeFolioSearch)}"
                    placeholder="Ingresá un folio (ej. B10-2026-0041)"
                    class="input-fintech w-full pl-9 pr-3 py-2.5 rounded-xl text-sm uppercase tabular-nums"
                  />
                </div>
                <button type="submit" class="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0">Rastrear</button>
              </form>
              <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span class="text-slate-500">Probar folio:</span>
                ${sampleFolios
                  .map(
                    (f) => `
                  <button onclick="B10.selectFolio('${f}')" class="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500/40 text-blue-300 font-mono transition">${f}</button>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Ficha de Trazabilidad del Folio Consultado -->
          <div class="mt-7 pt-7 border-t border-slate-800/80">
            ${
              ui.activeFolioSearch && !activeFolioObj
                ? `
                <div class="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 flex items-center gap-3 text-rose-200 text-sm">
                  <i data-lucide="alert-circle" class="w-5 h-5 shrink-0"></i>
                  No se encontró ningún registro para el folio <strong class="font-mono">${escapeHtml(ui.activeFolioSearch)}</strong>. Verificá el código o seleccioná uno de los folios recientes.
                </div>
              `
                : activeFolioObj
                ? renderFolioTraceabilityCard(activeFolioObj)
                : ''
            }
          </div>
        </section>

        <!-- Gráficos Interactivos (Chart.js) -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col">
            <div class="mb-4">
              <h2 class="font-display font-bold text-lg text-white">Distribución por Categoría</h2>
              <p class="text-xs text-slate-400">Fondos recaudados entre las 4 verticales estratégicas</p>
            </div>
            <div class="relative h-64 flex-1">
              <canvas id="chart-categories"></canvas>
            </div>
          </div>

          <div class="lg:col-span-7 glass-card rounded-2xl p-6 flex flex-col">
            <div class="mb-4">
              <h2 class="font-display font-bold text-lg text-white">Recaudado vs. Meta por Proyecto</h2>
              <p class="text-xs text-slate-400">Avance financiero en vivo expresado en ${state.currency === 'USD' ? 'Dólares (US$)' : 'Lempiras (L)'}</p>
            </div>
            <div class="relative h-64 flex-1">
              <canvas id="chart-comparison"></canvas>
            </div>
          </div>
        </section>

        <!-- Ranking de Top Colaboradores (Gamification + Anonimato) -->
        <section class="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                <i data-lucide="trophy" class="w-4 h-4"></i>
                Ranking en Vivo de Impacto
              </div>
              <h2 class="font-display font-bold text-xl sm:text-2xl text-white">Top Colaboradores de Bloque Diez</h2>
            </div>
            <p class="text-xs text-slate-400 max-w-sm">
              Los colaboradores que activan el modo privado aparecen como <strong class="text-slate-200">Donante Anónimo</strong> conservando su folio 100% auditable.
            </p>
          </div>

          <!-- Podio Top 3 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${leaderboard
              .slice(0, 3)
              .map((item, idx) => {
                const medals = [
                  { ring: 'border-amber-400/50 bg-amber-500/10', label: '1.º Lugar · Impacto Líder', iconColor: 'text-amber-400' },
                  { ring: 'border-slate-400/40 bg-slate-500/10', label: '2.º Lugar', iconColor: 'text-slate-300' },
                  { ring: 'border-orange-500/40 bg-orange-500/10', label: '3.º Lugar', iconColor: 'text-orange-400' },
                ][idx];
                return `
                  <div class="rounded-2xl border ${medals.ring} p-5 flex flex-col justify-between gap-3">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold ${medals.iconColor} inline-flex items-center gap-1.5">
                        <i data-lucide="medal" class="w-4 h-4"></i>
                        ${medals.label}
                      </span>
                      ${
                        item.anonymous
                          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-700 text-emerald-300 inline-flex items-center gap-1"><i data-lucide="eye-off" class="w-3 h-3"></i> Privacidad Verificada</span>'
                          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">Público</span>'
                      }
                    </div>
                    <div>
                      <p class="font-display font-bold text-base text-white truncate">${escapeHtml(item.displayName)}</p>
                      <p class="font-display font-extrabold text-2xl text-emerald-400 tabular-nums mt-1">${formatMoney(item.totalHNL)}</p>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>${item.count} ${item.count === 1 ? 'aporte' : 'aportes'}</span>
                      <button onclick="B10.selectFolio('${item.folios[0]}')" class="font-mono text-blue-300 hover:underline">${item.folios[0]}</button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>

          <!-- Resto del Ranking -->
          ${
            leaderboard.length > 3
              ? `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead>
                    <tr class="border-b border-slate-800 text-xs uppercase text-slate-400">
                      <th class="py-2.5 pr-4">#</th>
                      <th class="py-2.5 px-4">Colaborador</th>
                      <th class="py-2.5 px-4">Privacidad</th>
                      <th class="py-2.5 px-4">Folio Auditable</th>
                      <th class="py-2.5 pl-4 text-right">Total Aportado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/70">
                    ${leaderboard
                      .slice(3)
                      .map(
                        (item, i) => `
                      <tr class="hover:bg-slate-900/50 transition">
                        <td class="py-3 pr-4 font-bold text-slate-400 tabular-nums">${i + 4}</td>
                        <td class="py-3 px-4 font-semibold text-white">${escapeHtml(item.displayName)}</td>
                        <td class="py-3 px-4">
                          ${
                            item.anonymous
                              ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-900 border border-slate-700 text-emerald-300"><i data-lucide="shield" class="w-3 h-3"></i> Anónimo Verificado</span>'
                              : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-500/10 border border-blue-500/30 text-blue-300">Perfil Público</span>'
                          }
                        </td>
                        <td class="py-3 px-4">
                          <button onclick="B10.selectFolio('${item.folios[0]}')" class="font-mono text-xs text-blue-400 hover:underline">${item.folios[0]}</button>
                        </td>
                        <td class="py-3 pl-4 text-right font-bold text-emerald-400 tabular-nums">${formatMoney(item.totalHNL)}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
              : ''
          }
        </section>

        <!-- Registro Público de Aportes -->
        <section class="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="font-display font-bold text-xl text-white">Registro Público de Aportes</h2>
              <p class="text-xs text-slate-400">Historial abierto sin correos ni datos personales sensibles.</p>
            </div>
            <div class="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
              ${['Todos', 'Donaciones', 'Inversiones']
                .map(
                  (f) => `
                <button onclick="B10.setRegistryFilter('${f}')" class="px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  ui.registryFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }">${f}</button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[680px]">
              <thead>
                <tr class="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th class="py-3 pr-4">Folio</th>
                  <th class="py-3 px-3">Fecha</th>
                  <th class="py-3 px-3">Proyecto</th>
                  <th class="py-3 px-3">Vertical</th>
                  <th class="py-3 px-3">Colaborador</th>
                  <th class="py-3 px-3">Etapa</th>
                  <th class="py-3 pl-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                ${filteredRegistry
                  .map(
                    (c) => `
                  <tr class="hover:bg-slate-900/60 transition">
                    <td class="py-3 pr-4">
                      <button onclick="B10.selectFolio('${c.folio}')" class="font-mono text-xs font-semibold text-blue-400 hover:underline">${c.folio}</button>
                    </td>
                    <td class="py-3 px-3 text-xs text-slate-400 tabular-nums">${escapeHtml(c.date)}</td>
                    <td class="py-3 px-3 font-medium text-slate-200">${escapeHtml(c.projectTitle)}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.vertical === 'Inversiones'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-blue-500/15 text-blue-300'
                      }">${c.vertical}</span>
                    </td>
                    <td class="py-3 px-3 text-xs">
                      ${
                        c.anonymous
                          ? '<span class="inline-flex items-center gap-1 text-slate-300"><i data-lucide="eye-off" class="w-3.5 h-3.5 text-emerald-400"></i> Donante Anónimo</span>'
                          : `<span class="text-white font-medium">${escapeHtml(c.donorName)}</span>`
                      }
                    </td>
                    <td class="py-3 px-3 text-xs text-emerald-300 font-medium">${STAGES[c.stageIndex] || STAGES[0]}</td>
                    <td class="py-3 pl-3 text-right font-bold text-white tabular-nums">${formatMoney(c.amountHNL)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function renderFolioTraceabilityCard(c) {
    return `
      <div class="rounded-2xl bg-[#070B14]/85 border border-blue-500/30 p-5 sm:p-6 space-y-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300">${c.folio}</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                c.anonymous
                  ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                  : 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
              }">
                ${c.anonymous ? 'Anonimato Público Activo' : `Colaborador: ${escapeHtml(c.donorName)}`}
              </span>
            </div>
            <h3 class="font-display font-bold text-lg text-white pt-1">${escapeHtml(c.projectTitle)}</h3>
            <p class="text-xs text-slate-400">Registrado el ${escapeHtml(c.date)} · Vertical: ${c.vertical} · Categoría: ${escapeHtml(c.category)}</p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Monto Trazable</p>
            <p class="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">${formatMoney(c.amountHNL)}</p>
          </div>
        </div>

        <!-- Línea de Tiempo de 4 Etapas -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          ${STAGES.map((stage, idx) => {
            const done = idx <= c.stageIndex;
            const current = idx === c.stageIndex;
            return `
              <div class="relative rounded-xl p-3.5 border transition ${
                done
                  ? 'bg-emerald-500/10 border-emerald-500/35'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-bold tabular-nums ${done ? 'text-emerald-400' : 'text-slate-500'}">ETAPA 0${idx + 1}</span>
                  <i data-lucide="${done ? 'check-circle-2' : 'circle-dashed'}" class="w-4 h-4 ${done ? 'text-emerald-400' : 'text-slate-500'}"></i>
                </div>
                <p class="text-xs font-bold ${done ? 'text-white' : 'text-slate-400'}">${stage}</p>
                ${current ? '<span class="inline-block mt-1 text-[10px] font-semibold text-blue-300">Estado actual</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function initTransparencyCharts() {
    const catCanvas = document.getElementById('chart-categories');
    const compCanvas = document.getElementById('chart-comparison');
    if (!catCanvas || !compCanvas || typeof Chart === 'undefined') return;

    const approved = state.projects.filter((p) => p.status === 'Aprobado');
    const divisor = state.currency === 'USD' ? BCH_EXCHANGE_RATE : 1;

    // Datos por categoría
    const catTotals = CATEGORIES.map((cat) =>
      approved
        .filter((p) => p.category === cat)
        .reduce((acc, p) => acc + p.raisedHNL / divisor, 0)
    );

    categoryChartInstance = new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: CATEGORIES,
        datasets: [
          {
            data: catTotals,
            backgroundColor: ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6'],
            borderColor: '#0F172A',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#CBD5E1', padding: 14, font: { family: 'Inter', size: 12 } },
          },
        },
      },
    });

    // Datos comparativa recaudado vs meta
    const labels = approved.map((p) => (p.title.length > 22 ? `${p.title.slice(0, 22)}…` : p.title));
    comparisonChartInstance = new Chart(compCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Recaudado',
            data: approved.map((p) => Number((p.raisedHNL / divisor).toFixed(2))),
            backgroundColor: '#10B981',
            borderRadius: 6,
          },
          {
            label: 'Meta',
            data: approved.map((p) => Number((p.goalHNL / divisor).toFixed(2))),
            backgroundColor: 'rgba(59, 130, 246, 0.35)',
            borderColor: '#3B82F6',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#94A3B8', font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#94A3B8', font: { size: 11 } },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#CBD5E1', font: { family: 'Inter', size: 12 } },
          },
        },
      },
    });
  }

  /* ------------------------------------------------------------------------
     7. VISTA C: PANELES INTERNOS POR ROL (#/panel)
     ------------------------------------------------------------------------ */
  function renderPanelView() {
    if (state.role === 'organizacion') return renderOrganizationPanel();
    if (state.role === 'aprobador') return renderApproverPanel();
    if (state.role === 'admin') return renderAdminPanel();

    // Si está como Visitante, ofrecer accesos rápidos para probar los 3 roles internos
    return `
      <section class="glass-card rounded-3xl p-8 sm:p-10 text-center max-w-3xl mx-auto space-y-6 animate-fade-up">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto">
          <i data-lucide="lock-keyhole" class="w-7 h-7 text-blue-400"></i>
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Paneles Operativos por Rol</h1>
          <p class="text-sm text-slate-400 max-w-xl mx-auto">
            Actualmente estás navegando como <strong class="text-white">Visitante / Donante</strong>. Seleccioná uno de los roles internos para probar la arquitectura completa en vivo:
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          <button onclick="B10.setRole('organizacion')" class="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
            <i data-lucide="folder-plus" class="w-6 h-6 text-blue-400"></i>
            <h3 class="font-display font-bold text-white">Organización</h3>
            <p class="text-xs text-slate-400">Postulá proyectos nuevos y publicá avances de campo en tiempo real.</p>
          </button>
          <button onclick="B10.setRole('aprobador')" class="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
            <i data-lucide="clipboard-check" class="w-6 h-6 text-amber-400"></i>
            <h3 class="font-display font-bold text-white">Aprobador</h3>
            <p class="text-xs text-slate-400">Revisá la cola de proyectos pendientes, aprobá o rechazá con motivo.</p>
          </button>
          <button onclick="B10.setRole('admin')" class="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
            <i data-lucide="shield-alert" class="w-6 h-6 text-emerald-400"></i>
            <h3 class="font-display font-bold text-white">Admin / Auditor</h3>
            <p class="text-xs text-slate-400">Consultá métricas globales, bitácora de auditoría y exportá CSV real.</p>
          </button>
        </div>
      </section>
    `;
  }

  // --- PANEL ORGANIZACIÓN / DUEÑO ---
  function renderOrganizationPanel() {
    return `
      <div class="space-y-8 animate-fade-up">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-blue-400">Rol Activo · Organización / Dueño de Proyecto</span>
            <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Gestión de Iniciativas y Avances</h1>
          </div>
          <a href="#/explorar" class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">Ver Catálogo Público</a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Formulario de Registro de Proyecto -->
          <div class="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <i data-lucide="plus-circle" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="font-display font-bold text-lg text-white">Registrar Nuevo Proyecto</h2>
                <p class="text-xs text-slate-400">Se enviará automáticamente a la cola del Aprobador.</p>
              </div>
            </div>

            <form id="org-project-form" onsubmit="B10.submitNewProject(event)" class="space-y-3.5 text-sm">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Título del Proyecto *</label>
                <input name="title" required placeholder="Ej. Planta Procesadora de Miel — Intibucá" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Organización / Cooperativa *</label>
                <input name="organization" required placeholder="Ej. Cooperativa Apícola Lenca" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Vertical *</label>
                  <select name="vertical" onchange="B10.toggleInvestmentFields(this.value)" class="input-fintech w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="Donaciones">Donaciones</option>
                    <option value="Inversiones">Inversiones</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Categoría *</label>
                  <select name="category" class="input-fintech w-full px-3 py-2.5 rounded-xl text-sm">
                    ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Ubicación en Honduras *</label>
                  <input name="location" required placeholder="Ej. La Esperanza, Intibucá" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Meta en Lempiras (L) *</label>
                  <input name="goalHNL" type="number" min="10000" step="500" required placeholder="150000" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm tabular-nums" />
                </div>
              </div>

              <!-- Campos condicionales si es Inversión -->
              <div id="investment-extra-fields" class="hidden grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div>
                  <label class="block text-xs font-medium text-emerald-300 mb-1">Retorno Anual Est. (%)</label>
                  <input name="expectedReturn" type="number" step="0.1" min="1" max="40" value="14.0" class="input-fintech w-full px-3 py-2 rounded-lg text-sm tabular-nums" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-emerald-300 mb-1">Plazo (meses)</label>
                  <input name="termMonths" type="number" min="3" max="60" value="18" class="input-fintech w-full px-3 py-2 rounded-lg text-sm tabular-nums" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Impacto Medible Esperado *</label>
                <input name="impactMetric" required placeholder="Ej. 45 familias beneficiadas · +35% productividad" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Descripción Ejecutiva *</label>
                <textarea name="summary" rows="3" required placeholder="Explicá el propósito, uso de fondos y sostenibilidad del proyecto..." class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm"></textarea>
              </div>

              <button type="submit" class="btn-primary w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
                <i data-lucide="send" class="w-4 h-4"></i>
                Enviar Proyecto a Revisión
              </button>
            </form>
          </div>

          <!-- Listado de Proyectos y Publicación de Avances -->
          <div class="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
            <div>
              <h2 class="font-display font-bold text-lg text-white">Estado de Proyectos</h2>
              <p class="text-xs text-slate-400">Supervisá aprobaciones, motivos de rechazo y publicá avances visibles en el portal público.</p>
            </div>

            <div class="space-y-3">
              ${state.projects
                .map((p) => {
                  const statusStyle = {
                    Aprobado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    'En Revisión': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    Rechazado: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                  }[p.status];
                  return `
                    <div class="rounded-2xl bg-slate-900/75 border border-slate-800 p-4 space-y-2.5">
                      <div class="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle}">${p.status}</span>
                            <span class="text-[11px] text-slate-400">${p.vertical} · ${escapeHtml(p.category)}</span>
                          </div>
                          <h3 class="font-display font-bold text-base text-white mt-1.5">${escapeHtml(p.title)}</h3>
                          <p class="text-xs text-slate-400">${escapeHtml(p.location)} · Meta: <span class="tabular-nums text-slate-200">${formatMoney(p.goalHNL)}</span></p>
                        </div>
                        ${
                          p.status === 'Aprobado'
                            ? `<button onclick="B10.openPublishUpdateModal('${p.id}')" class="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/35 text-blue-300 text-xs font-semibold inline-flex items-center gap-1.5 transition">
                                <i data-lucide="megaphone" class="w-3.5 h-3.5"></i> Publicar Avance
                              </button>`
                            : ''
                        }
                      </div>
                      ${
                        p.status === 'Rechazado' && p.rejectionReason
                          ? `<div class="rounded-xl bg-rose-500/10 border border-rose-500/25 px-3 py-2 text-xs text-rose-200">
                              <strong>Motivo de rechazo:</strong> ${escapeHtml(p.rejectionReason)}
                            </div>`
                          : ''
                      }
                      <div class="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                        <span>Avances publicados: <strong class="text-slate-300">${p.updates.length}</strong></span>
                        <span>Recaudado: <strong class="text-emerald-400 tabular-nums">${formatMoney(p.raisedHNL)}</strong></span>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- PANEL APROBADOR ---
  function renderApproverPanel() {
    const pending = state.projects.filter((p) => p.status === 'En Revisión');

    return `
      <div class="space-y-8 animate-fade-up">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-amber-400">Rol Activo · Comité de Aprobación</span>
          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Cola de Revisión y Due Diligence</h1>
        </div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-display font-bold text-lg text-white">Pendientes de Revisión (${pending.length})</h2>
          </div>

          ${
            pending.length === 0
              ? `
              <div class="glass-card rounded-2xl p-10 text-center space-y-2">
                <i data-lucide="check-check" class="w-10 h-10 text-emerald-400 mx-auto"></i>
                <h3 class="font-display font-bold text-white">Cola al día</h3>
                <p class="text-sm text-slate-400">No hay proyectos pendientes. Cambiá al rol Organización para registrar uno nuevo y probar el flujo.</p>
              </div>
            `
              : `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                ${pending
                  .map(
                    (p) => `
                  <div class="glass-card rounded-2xl p-6 space-y-4 border-amber-500/25">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">Pendiente</span>
                        <h3 class="font-display font-bold text-lg text-white mt-2">${escapeHtml(p.title)}</h3>
                        <p class="text-xs text-slate-400">${escapeHtml(p.organization)} · ${escapeHtml(p.location)}</p>
                      </div>
                      <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-blue-300">${p.vertical}</span>
                    </div>

                    <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(p.summary)}</p>

                    <div class="grid grid-cols-2 gap-3 text-xs">
                      <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span class="text-slate-400 block">Meta Solicitada</span>
                        <strong class="text-white text-sm tabular-nums">${formatMoney(p.goalHNL)}</strong>
                      </div>
                      <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span class="text-slate-400 block">Categoría</span>
                        <strong class="text-emerald-300 text-sm">${escapeHtml(p.category)}</strong>
                      </div>
                    </div>

                    <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                      <strong>Impacto declarado:</strong> ${escapeHtml(p.impactMetric)}
                      ${p.vertical === 'Inversiones' ? `<br/><strong>Condiciones:</strong> ${p.expectedReturn}% anual a ${p.termMonths} meses` : ''}
                    </div>

                    <div class="grid grid-cols-2 gap-3 pt-2">
                      <button onclick="B10.approveProject('${p.id}')" class="btn-emerald py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                        Aprobar y Publicar
                      </button>
                      <button onclick="B10.openRejectModal('${p.id}')" class="py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition">
                        <i data-lucide="x-circle" class="w-4 h-4"></i>
                        Rechazar
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
          }
        </section>

        <!-- Historial de Decisiones -->
        <section class="glass-card rounded-2xl p-6 space-y-4">
          <h2 class="font-display font-bold text-lg text-white">Historial de Decisiones</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr class="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th class="py-2.5 pr-4">Fecha y Hora</th>
                  <th class="py-2.5 px-3">Proyecto</th>
                  <th class="py-2.5 px-3">Decisión</th>
                  <th class="py-2.5 pl-3">Motivo / Observación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                ${state.decisions
                  .map(
                    (d) => `
                  <tr>
                    <td class="py-3 pr-4 text-xs text-slate-400 tabular-nums">${escapeHtml(d.date)}</td>
                    <td class="py-3 px-3 font-semibold text-white">${escapeHtml(d.projectTitle)}</td>
                    <td class="py-3 px-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        d.decision === 'Aprobado'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }">${d.decision}</span>
                    </td>
                    <td class="py-3 pl-3 text-xs text-slate-300">${escapeHtml(d.reason)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  // --- PANEL ADMIN / AUDITOR ---
  function renderAdminPanel() {
    const totalDonationsHNL = state.contributions
      .filter((c) => c.vertical === 'Donaciones')
      .reduce((acc, c) => acc + c.amountHNL, 0);
    const totalInvestmentsHNL = state.contributions
      .filter((c) => c.vertical === 'Inversiones')
      .reduce((acc, c) => acc + c.amountHNL, 0);
    const totalVolumeHNL = totalDonationsHNL + totalInvestmentsHNL;
    const estFeeHNL = totalVolumeHNL * PLATFORM_FEE_RATE;

    return `
      <div class="space-y-8 animate-fade-up">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Rol Activo · Administración y Auditoría</span>
            <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Panel Ejecutivo y Bitácora</h1>
          </div>
          <button onclick="B10.exportCSV()" class="btn-emerald px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i>
            Exportar Reporte CSV
          </button>
        </div>

        <!-- KPIs Ejecutivos -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-card rounded-2xl p-5">
            <p class="text-xs text-slate-400">Volumen Total Registrado</p>
            <p class="font-display text-2xl font-extrabold text-white tabular-nums mt-1">${formatMoney(totalVolumeHNL)}</p>
            <p class="text-[11px] text-emerald-400 mt-1">${state.contributions.length} transacciones con folio</p>
          </div>
          <div class="glass-card rounded-2xl p-5">
            <p class="text-xs text-slate-400">Vertical Donaciones</p>
            <p class="font-display text-2xl font-extrabold text-blue-400 tabular-nums mt-1">${formatMoney(totalDonationsHNL)}</p>
            <p class="text-[11px] text-slate-400 mt-1">${Math.round((totalDonationsHNL / (totalVolumeHNL || 1)) * 100)}% del volumen</p>
          </div>
          <div class="glass-card rounded-2xl p-5">
            <p class="text-xs text-slate-400">Vertical Inversiones</p>
            <p class="font-display text-2xl font-extrabold text-emerald-400 tabular-nums mt-1">${formatMoney(totalInvestmentsHNL)}</p>
            <p class="text-[11px] text-slate-400 mt-1">${Math.round((totalInvestmentsHNL / (totalVolumeHNL || 1)) * 100)}% del volumen</p>
          </div>
          <div class="glass-card rounded-2xl p-5 border-blue-500/30">
            <p class="text-xs text-slate-400">Comisión Estimada (5%)</p>
            <p class="font-display text-2xl font-extrabold text-amber-300 tabular-nums mt-1">${formatMoney(estFeeHNL)}</p>
            <p class="text-[11px] text-slate-400 mt-1">Modelo de monetización B10</p>
          </div>
        </section>

        <!-- Control de Trazabilidad de Aportes -->
        <section class="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h2 class="font-display font-bold text-lg text-white">Verificación y Trazabilidad de Aportes</h2>
            <p class="text-xs text-slate-400">Avanzá la etapa operativa de cada folio; el cambio se refleja al instante en el portal público de Transparencia.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[700px]">
              <thead>
                <tr class="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th class="py-2.5 pr-3">Folio</th>
                  <th class="py-2.5 px-3">Proyecto</th>
                  <th class="py-2.5 px-3">Método</th>
                  <th class="py-2.5 px-3">Monto</th>
                  <th class="py-2.5 px-3">Etapa Actual</th>
                  <th class="py-2.5 pl-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                ${state.contributions
                  .map(
                    (c) => `
                  <tr class="hover:bg-slate-900/50">
                    <td class="py-3 pr-3 font-mono text-xs text-blue-400">${c.folio}</td>
                    <td class="py-3 px-3 text-xs font-medium text-white">${escapeHtml(c.projectTitle)}</td>
                    <td class="py-3 px-3 text-xs text-slate-400">${escapeHtml(c.paymentMethod)}</td>
                    <td class="py-3 px-3 font-bold text-white tabular-nums text-xs">${formatMoney(c.amountHNL)}</td>
                    <td class="py-3 px-3 text-xs text-emerald-300 font-semibold">${STAGES[c.stageIndex]}</td>
                    <td class="py-3 pl-3 text-right">
                      ${
                        c.stageIndex < STAGES.length - 1
                          ? `<button onclick="B10.advanceContributionStage('${c.folio}')" class="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/35 text-blue-300 text-[11px] font-semibold transition">Avanzar Etapa →</button>`
                          : `<span class="text-[11px] text-emerald-400 font-semibold">Completado ✓</span>`
                      }
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- Bitácora de Auditoría -->
        <section class="glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display font-bold text-lg text-white">Bitácora de Auditoría del Sistema</h2>
              <p class="text-xs text-slate-400">Registro cronológico inmutable de eventos operativos.</p>
            </div>
            <span class="text-xs text-slate-500 tabular-nums">${state.auditLog.length} eventos</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[620px]">
              <thead>
                <tr class="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th class="py-2.5 pr-4">Timestamp</th>
                  <th class="py-2.5 px-3">Actor</th>
                  <th class="py-2.5 px-3">Acción</th>
                  <th class="py-2.5 pl-3">Detalle</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                ${state.auditLog
                  .map(
                    (e) => `
                  <tr>
                    <td class="py-2.5 pr-4 text-xs text-slate-400 tabular-nums whitespace-nowrap">${escapeHtml(e.timestamp)}</td>
                    <td class="py-2.5 px-3 text-xs font-medium text-blue-300">${escapeHtml(e.actor)}</td>
                    <td class="py-2.5 px-3 text-xs font-semibold text-white">${escapeHtml(e.action)}</td>
                    <td class="py-2.5 pl-3 text-xs text-slate-300">${escapeHtml(e.detail)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     8. MODALES: DETALLE, APORTE/INVERSIÓN, RECIBO, AVANCE, RECHAZO Y LEGALES
     ------------------------------------------------------------------------ */
  function openModal(html) {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = html;
    root.classList.remove('hidden');
    root.classList.add('flex');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.classList.add('hidden');
    root.classList.remove('flex');
    root.innerHTML = '';
    document.body.style.overflow = '';
  }

  function openProjectDetail(projectId) {
    const p = state.projects.find((item) => item.id === projectId);
    if (!p) return;

    const pct = Math.min(100, Math.round((p.raisedHNL / p.goalHNL) * 100));
    const recent = state.contributions.filter((c) => c.projectId === p.id).slice(0, 5);
    const isInvestment = p.vertical === 'Inversiones';

    openModal(`
      <div class="glass-modal rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 space-y-6 animate-fade-up relative max-h-[90vh] overflow-y-auto">
        <button onclick="B10.closeModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition" aria-label="Cerrar">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="space-y-2 pr-10">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isInvestment ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}">${p.vertical}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">${escapeHtml(p.category)}</span>
            <span class="text-xs text-slate-400 inline-flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400"></i> ${escapeHtml(p.location)}</span>
          </div>
          <h2 class="font-display text-2xl font-extrabold text-white">${escapeHtml(p.title)}</h2>
          <p class="text-xs text-slate-400">Ejecutado por <strong class="text-slate-200">${escapeHtml(p.organization)}</strong></p>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(p.summary)}</p>

        <!-- Barra financiera -->
        <div class="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p class="text-xs text-slate-400">Recaudado al momento</p>
              <p class="font-display text-2xl font-extrabold text-white tabular-nums">${formatMoney(p.raisedHNL)}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-400">Meta: <span class="tabular-nums text-slate-200">${formatMoney(p.goalHNL)}</span></p>
              <p class="text-sm font-bold text-emerald-400 tabular-nums">${pct}% completado · ${p.daysLeft} días restantes</p>
            </div>
          </div>
          <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style="width: ${pct}%"></div>
          </div>
          <div class="flex flex-wrap gap-3 pt-1 text-xs text-slate-300">
            <span class="inline-flex items-center gap-1.5"><i data-lucide="award" class="w-4 h-4 text-emerald-400"></i> ${escapeHtml(p.impactMetric)}</span>
            ${isInvestment ? `<span class="inline-flex items-center gap-1.5 text-emerald-300 font-semibold"><i data-lucide="trending-up" class="w-4 h-4"></i> ${p.expectedReturn}% anual · ${p.termMonths} meses</span>` : ''}
          </div>
        </div>

        <!-- Cronograma de Avances -->
        <div class="space-y-3">
          <h3 class="font-display font-bold text-sm uppercase tracking-wider text-slate-300">Avances Reportados en Campo</h3>
          ${
            p.updates.length === 0
              ? '<p class="text-xs text-slate-500">Aún no hay reportes de avance publicados para esta iniciativa.</p>'
              : `<div class="space-y-2.5">
                  ${p.updates
                    .map(
                      (u) => `
                    <div class="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
                      <div class="flex items-center justify-between text-[11px] text-blue-300 font-semibold mb-1">
                        <span>${escapeHtml(u.title)}</span>
                        <span class="text-slate-500 tabular-nums">${escapeHtml(u.date)}</span>
                      </div>
                      <p class="text-xs text-slate-400">${escapeHtml(u.detail)}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>`
          }
        </div>

        <!-- Últimos Aportes (respetando anonimato) -->
        <div class="space-y-2.5">
          <h3 class="font-display font-bold text-sm uppercase tracking-wider text-slate-300">Últimos Aportes Verificados</h3>
          ${
            recent.length === 0
              ? '<p class="text-xs text-slate-500">Sé el primero en impulsar este proyecto.</p>'
              : `<div class="divide-y divide-slate-800/80 rounded-xl bg-slate-900/50 border border-slate-800 px-4">
                  ${recent
                    .map(
                      (c) => `
                    <div class="py-2.5 flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-blue-400">${c.folio}</span>
                        <span class="text-slate-300">${c.anonymous ? 'Donante Anónimo' : escapeHtml(c.donorName)}</span>
                      </div>
                      <span class="font-bold text-emerald-400 tabular-nums">${formatMoney(c.amountHNL)}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>`
          }
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button onclick="B10.openContributeModal('${p.id}')" class="${isInvestment ? 'btn-emerald' : 'btn-primary'} flex-1 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
            <i data-lucide="${isInvestment ? 'trending-up' : 'heart'}" class="w-4 h-4"></i>
            ${isInvestment ? 'Invertir en este Proyecto' : 'Aportar a esta Causa'}
          </button>
          <button onclick="B10.closeModal()" class="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-300">Cerrar</button>
        </div>
      </div>
    `);
  }

  function openContributeModal(projectId) {
    const p = state.projects.find((item) => item.id === projectId);
    if (!p) return;

    ui.selectedAmount = 1500;
    const isInvestment = p.vertical === 'Inversiones';
    const quickAmounts = [500, 1500, 5000, 15000];

    openModal(`
      <div class="glass-modal rounded-3xl max-w-xl w-full p-6 sm:p-8 my-8 space-y-5 animate-fade-up relative max-h-[92vh] overflow-y-auto">
        <button onclick="B10.closeModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition" aria-label="Cerrar">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="pr-8">
          <span class="text-xs font-semibold uppercase tracking-wider ${isInvestment ? 'text-emerald-400' : 'text-blue-400'}">
            ${isInvestment ? 'Simulador de Inversión de Impacto' : 'Aporte Directo con Trazabilidad'}
          </span>
          <h2 class="font-display text-xl sm:text-2xl font-extrabold text-white mt-1">${escapeHtml(p.title)}</h2>
        </div>

        <form id="contribute-form" onsubmit="B10.submitContribution(event, '${p.id}')" class="space-y-4">
          <!-- Monto Rápido -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300">Seleccioná un monto (base en Lempiras L)</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${quickAmounts
                .map(
                  (amt) => `
                <button type="button" onclick="B10.pickQuickAmount(${amt})" data-quick-amt="${amt}" class="quick-amt-btn py-2 px-2 rounded-xl border text-xs font-bold tabular-nums transition ${
                  amt === 1500
                    ? 'bg-blue-600/25 border-blue-400 text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
                }">
                  ${formatMoney(amt)}
                </button>
              `
                )
                .join('')}
            </div>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">L</span>
              <input id="contrib-amount" name="amountHNL" type="number" min="100" step="50" value="1500" required class="input-fintech w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-bold tabular-nums" />
            </div>
          </div>

          <!-- Método de Pago Realista para Honduras -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300">Método de Pago</label>
            <select name="paymentMethod" onchange="B10.toggleTransferRef(this.value)" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm">
              <option value="Tarjeta de Crédito/Débito (PixelPay / BAC)">Tarjeta de Crédito/Débito (PixelPay / BAC)</option>
              <option value="Transferencia Bancaria (BAC / Ficohsa)">Transferencia Bancaria (BAC / Ficohsa)</option>
              <option value="PayPal / Tarjeta Internacional">PayPal / Tarjeta Internacional</option>
            </select>

            <div id="transfer-ref-box" class="hidden p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-2">
              <p class="text-[11px] text-blue-200">Cuentas habilitadas: BAC Credomatic / Banco Ficohsa a nombre de Bloque Diez.</p>
              <input name="transferRef" placeholder="Número de comprobante o referencia bancaria" class="input-fintech w-full px-3 py-2 rounded-lg text-xs" />
            </div>
          </div>

          <!-- Datos del Aportante -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Nombre completo *</label>
              <input name="donorName" required placeholder="Tu nombre o empresa" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Correo electrónico *</label>
              <input name="donorEmail" type="email" required placeholder="recibo@correo.hn" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <!-- Toggle Destacado de Anonimato Público -->
          <div class="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 space-y-2">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="anonymous" class="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer" />
              <span class="text-xs sm:text-sm font-semibold text-white leading-snug">
                Ocultar mi nombre públicamente (aparecer como 'Donante Anónimo' en el proyecto y en el ranking de colaboradores)
              </span>
            </label>
            <p class="text-[11px] text-slate-400 pl-7 leading-relaxed">
              Tu identidad permanece resguardada internamente para emisión de recibo, trazabilidad y cumplimiento bancario, pero nunca se expone al público ni en el ranking.
            </p>
          </div>

          <!-- Aceptación Legal Obligatoria -->
          <label class="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" required class="mt-0.5 w-4 h-4 rounded accent-blue-500 cursor-pointer" />
            <span>
              Acepto los <button type="button" onclick="B10.openLegalModal('terms')" class="text-blue-400 hover:underline">Términos de Uso</button> y la <button type="button" onclick="B10.openLegalModal('privacy')" class="text-blue-400 hover:underline">Política de Privacidad</button> de Bloque Diez.
            </span>
          </label>

          <button type="submit" class="${isInvestment ? 'btn-emerald' : 'btn-primary'} w-full py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            Confirmar ${isInvestment ? 'Inversión' : 'Aporte'} y Generar Folio
          </button>
        </form>
      </div>
    `);
  }

  function openReceiptModal(contribution) {
    openModal(`
      <div class="glass-modal rounded-3xl max-w-lg w-full p-6 sm:p-8 my-8 text-center space-y-5 animate-fade-up border-emerald-500/40">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <i data-lucide="badge-check" class="w-9 h-9 text-emerald-400"></i>
        </div>

        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-widest text-emerald-400">Certificado Digital de Trazabilidad</span>
          <h2 class="font-display text-2xl font-extrabold text-white">¡Aporte Registrado con Éxito!</h2>
          <p class="text-xs text-slate-400">El saldo del proyecto, el ranking y la bitácora ya fueron actualizados en vivo.</p>
        </div>

        <div class="rounded-2xl bg-[#070B14]/90 border border-slate-800 p-5 space-y-3 text-left text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="text-slate-400">Código de Folio Único</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-bold text-blue-300">${contribution.folio}</span>
              <button onclick="B10.copyFolio('${contribution.folio}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition" title="Copiar folio">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-400">Proyecto</span>
            <strong class="text-white text-right">${escapeHtml(contribution.projectTitle)}</strong>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-400">Monto</span>
            <strong class="text-emerald-400 text-sm tabular-nums">${formatMoney(contribution.amountHNL)}</strong>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-400">Visibilidad Pública</span>
            <strong class="text-slate-200">${contribution.anonymous ? 'Donante Anónimo (Privado)' : escapeHtml(contribution.donorName)}</strong>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-400">Método</span>
            <span class="text-slate-300 text-right">${escapeHtml(contribution.paymentMethod)}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-1">
          <button onclick="B10.goTrackFolio('${contribution.folio}')" class="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
            <i data-lucide="radar" class="w-4 h-4"></i>
            Rastrear este Folio en Transparencia
          </button>
          <button onclick="B10.closeModal()" class="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-300">Listo</button>
        </div>
      </div>
    `);
  }

  function openPublishUpdateModal(projectId) {
    const p = state.projects.find((item) => item.id === projectId);
    if (!p) return;

    openModal(`
      <div class="glass-modal rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-fade-up relative">
        <button onclick="B10.closeModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        <div>
          <span class="text-xs font-semibold uppercase text-blue-400">Reporte de Ejecución</span>
          <h2 class="font-display text-xl font-bold text-white mt-1">Publicar Avance en ${escapeHtml(p.title)}</h2>
        </div>
        <form onsubmit="B10.submitProjectUpdate(event, '${p.id}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Título del hito *</label>
            <input name="title" required placeholder="Ej. Desembolso y entrega de insumos fase 2" class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Detalle del avance *</label>
            <textarea name="detail" rows="3" required placeholder="Describí resultados verificables, beneficiarios alcanzados o uso de fondos..." class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm"></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold">Publicar en Ficha Pública</button>
            <button type="button" onclick="B10.closeModal()" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-300">Cancelar</button>
          </div>
        </form>
      </div>
    `);
  }

  function openRejectModal(projectId) {
    const p = state.projects.find((item) => item.id === projectId);
    if (!p) return;

    openModal(`
      <div class="glass-modal rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-fade-up relative border-rose-500/35">
        <button onclick="B10.closeModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        <div>
          <span class="text-xs font-semibold uppercase text-rose-400">Decisión de Comité</span>
          <h2 class="font-display text-xl font-bold text-white mt-1">Rechazar Proyecto</h2>
          <p class="text-xs text-slate-400 mt-1">${escapeHtml(p.title)}</p>
        </div>
        <form onsubmit="B10.confirmRejectProject(event, '${p.id}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Motivo obligatorio del rechazo *</label>
            <textarea name="reason" rows="3" required placeholder="Indicá qué documentación, presupuesto o criterio ASG requiere corrección..." class="input-fintech w-full px-3.5 py-2.5 rounded-xl text-sm"></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition">Confirmar Rechazo</button>
            <button type="button" onclick="B10.closeModal()" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-300">Cancelar</button>
          </div>
        </form>
      </div>
    `);
  }

  function openLegalModal(type) {
    const isTerms = type === 'terms';
    openModal(`
      <div class="glass-modal rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 space-y-5 animate-fade-up relative max-h-[85vh] overflow-y-auto">
        <button onclick="B10.closeModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        <div class="space-y-1 pr-8">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-400">Marco Institucional · Bloque Diez</span>
          <h2 class="font-display text-2xl font-extrabold text-white">${isTerms ? 'Términos de Uso de la Plataforma' : 'Política de Privacidad y Anonimato'}</h2>
        </div>
        <div class="space-y-3 text-sm text-slate-300 leading-relaxed">
          ${
            isTerms
              ? `
              <p><strong>1. Naturaleza de Bloque Diez:</strong> Bloque Diez (www.bloquediez.com) es una plataforma tecnológica de financiamiento colectivo (donaciones e inversiones de impacto) que conecta a organizaciones y emprendedores evaluados con aportantes bajo estándares de transparencia y trazabilidad por folio.</p>
              <p><strong>2. Transparencia y Trazabilidad:</strong> Cada aporte registrado genera un código de folio único que permite consultar en tiempo real el destino, asignación y estado de ejecución del proyecto sin exponer datos personales sensibles de terceros.</p>
              <p><strong>3. Riesgos y Responsabilidades:</strong> Las donaciones son contribuciones voluntarias a causas sociales, ambientales o de innovación. Las inversiones productivas conllevan riesgos inherentes al proyecto financiado y se rigen por los acuerdos contractuales suscritos entre las partes y los socios estratégicos.</p>
              <p><strong>4. Proveedor Tecnológico:</strong> La arquitectura de software e interfaz es provista técnicamente por WEBIFY, quien no custodia fondos ni intermedia operaciones financieras.</p>
            `
              : `
              <p><strong>1. Protección de Datos Personales:</strong> Bloque Diez recopila únicamente la información necesaria para emitir recibos, asignar folios de trazabilidad y cumplir con los requerimientos de pasarelas de pago e instituciones financieras en Honduras.</p>
              <p><strong>2. Anonimato Público Configurable:</strong> Todo colaborador puede activar la opción <em>"Ocultar mi nombre públicamente"</em> para aparecer como <strong>Donante Anónimo</strong> en las fichas de proyecto, el registro abierto y el ranking de colaboradores, manteniendo su folio 100% verificable.</p>
              <p><strong>3. No Exposición de PII:</strong> El portal de transparencia jamás publica correos electrónicos, números de identidad, direcciones ni información bancaria de ningún usuario.</p>
              <p><strong>4. Seguridad de Infraestructura:</strong> La plataforma está diseñada para operar con cifrado en tránsito (HTTPS/TLS), separación de roles y políticas de seguridad a nivel de fila (RLS).</p>
            `
          }
        </div>
        <div class="pt-2 flex justify-end">
          <button onclick="B10.closeModal()" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">Entendido</button>
        </div>
      </div>
    `);
  }

  /* ------------------------------------------------------------------------
     9. ACCIONES INTERACTIVAS EXPUESTAS (NAMESPACE B10)
     ------------------------------------------------------------------------ */
  window.B10 = {
    setRole(newRole) {
      state.role = newRole;
      saveState();
      showToast(`Vista cambiada a: ${newRole.toUpperCase()}`, 'info');
      if (newRole !== 'visitante' && parseRoute().route !== 'panel') {
        window.location.hash = '#/panel';
      } else {
        renderApp();
      }
    },

    setCurrency(curr) {
      state.currency = curr;
      saveState();
      renderApp();
    },

    toggleMobileMenu(force) {
      const menu = document.getElementById('mobile-menu');
      if (!menu) return;
      if (typeof force === 'boolean') {
        menu.classList.toggle('hidden', !force);
      } else {
        menu.classList.toggle('hidden');
      }
    },

    resetDemo() {
      state = createSeedState();
      ui.verticalFilter = 'Todos';
      ui.categoryFilter = 'Todas';
      ui.searchQuery = '';
      ui.activeFolioSearch = '';
      saveState();
      showToast('Demo reiniciada a sus datos iniciales.', 'info');
      renderApp();
    },

    setVerticalFilter(v) {
      ui.verticalFilter = v;
      renderApp();
    },

    setCategoryFilter(cat) {
      ui.categoryFilter = cat;
      renderApp();
    },

    setSearchQuery(q) {
      ui.searchQuery = q;
      renderApp();
    },

    clearExploreFilters() {
      ui.verticalFilter = 'Todos';
      ui.categoryFilter = 'Todas';
      ui.searchQuery = '';
      renderApp();
    },

    setRegistryFilter(f) {
      ui.registryFilter = f;
      renderApp();
    },

    searchFolio(e) {
      e.preventDefault();
      const input = document.getElementById('folio-search-input');
      ui.activeFolioSearch = (input?.value || '').trim().toUpperCase();
      renderApp();
    },

    selectFolio(folio) {
      ui.activeFolioSearch = folio;
      renderApp();
      document.getElementById('folio-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    pickQuickAmount(amt) {
      const input = document.getElementById('contrib-amount');
      if (input) input.value = amt;
      document.querySelectorAll('.quick-amt-btn').forEach((btn) => {
        const isSelected = Number(btn.getAttribute('data-quick-amt')) === amt;
        btn.className = `quick-amt-btn py-2 px-2 rounded-xl border text-xs font-bold tabular-nums transition ${
          isSelected
            ? 'bg-blue-600/25 border-blue-400 text-white'
            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
        }`;
      });
    },

    toggleTransferRef(method) {
      const box = document.getElementById('transfer-ref-box');
      if (!box) return;
      box.classList.toggle('hidden', !method.includes('Transferencia'));
    },

    submitContribution(e, projectId) {
      e.preventDefault();
      const form = e.target;
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return;

      const amountHNL = Number(form.amountHNL.value);
      if (!amountHNL || amountHNL < 100) {
        showToast('Ingresá un monto mínimo de L 100.', 'warning');
        return;
      }

      const folio = `B10-2026-${String(state.nextFolioSeq).padStart(4, '0')}`;
      state.nextFolioSeq += 1;

      const anonymous = form.anonymous.checked;
      const donorName = form.donorName.value.trim();
      const paymentMethod = form.paymentMethod.value;

      const newContribution = {
        folio,
        projectId: project.id,
        projectTitle: project.title,
        vertical: project.vertical,
        category: project.category,
        amountHNL,
        donorName,
        donorEmail: form.donorEmail.value.trim(),
        anonymous,
        paymentMethod,
        date: nowTimestamp(),
        stageIndex: 1, // Verificado al instante en preview
      };

      project.raisedHNL += amountHNL;
      state.contributions.unshift(newContribution);
      logAudit(
        'Sistema de Pagos / Trazabilidad',
        'Nuevo Aporte Registrado',
        `Folio ${folio} (${anonymous ? 'Anónimo Público' : donorName}) por L ${amountHNL.toLocaleString('en-US')} en "${project.title}".`
      );
      saveState();
      renderApp();
      openReceiptModal(newContribution);
      showToast(`Folio ${folio} generado y sumado al proyecto.`, 'success');
    },

    copyFolio(folio) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(folio).then(() => showToast(`Folio ${folio} copiado al portapapeles.`, 'info'));
      } else {
        showToast(`Folio: ${folio}`, 'info');
      }
    },

    goTrackFolio(folio) {
      closeModal();
      ui.activeFolioSearch = folio;
      window.location.hash = `#/transparencia?folio=${encodeURIComponent(folio)}`;
      renderApp();
    },

    toggleInvestmentFields(vertical) {
      const box = document.getElementById('investment-extra-fields');
      if (!box) return;
      box.classList.toggle('hidden', vertical !== 'Inversiones');
    },

    submitNewProject(e) {
      e.preventDefault();
      const f = e.target;
      const isInv = f.vertical.value === 'Inversiones';
      const newProj = {
        id: `proj-${Date.now()}`,
        title: f.title.value.trim(),
        organization: f.organization.value.trim(),
        vertical: f.vertical.value,
        category: f.category.value,
        location: f.location.value.trim(),
        goalHNL: Number(f.goalHNL.value),
        raisedHNL: 0,
        daysLeft: 30,
        status: 'En Revisión',
        rejectionReason: '',
        expectedReturn: isInv ? Number(f.expectedReturn.value || 14) : null,
        termMonths: isInv ? Number(f.termMonths.value || 18) : null,
        esgLevel: 'ASG Verificado · Impacto HN',
        communitiesImpacted: 2,
        summary: f.summary.value.trim(),
        impactMetric: f.impactMetric.value.trim(),
        createdAt: nowTimestamp().slice(0, 10),
        updates: [],
      };

      state.projects.unshift(newProj);
      logAudit(
        `${newProj.organization} (Organización)`,
        'Creación de Proyecto',
        `Postuló "${newProj.title}" (${newProj.vertical}) por meta de L ${newProj.goalHNL.toLocaleString('en-US')}.`
      );
      saveState();
      renderApp();
      showToast('Proyecto enviado a revisión. Cambiá al rol Aprobador para publicarlo.', 'success');
    },

    submitProjectUpdate(e, projectId) {
      e.preventDefault();
      const p = state.projects.find((item) => item.id === projectId);
      if (!p) return;

      const title = e.target.title.value.trim();
      const detail = e.target.detail.value.trim();
      p.updates.unshift({
        date: nowTimestamp().slice(0, 10),
        title,
        detail,
      });

      logAudit(
        `${p.organization} (Organización)`,
        'Actualización de Avance',
        `Publicó avance "${title}" en "${p.title}".`
      );
      saveState();
      closeModal();
      renderApp();
      showToast('Avance publicado en la ficha pública del proyecto.', 'success');
    },

    approveProject(projectId) {
      const p = state.projects.find((item) => item.id === projectId);
      if (!p) return;

      p.status = 'Aprobado';
      p.rejectionReason = '';
      state.decisions.unshift({
        date: nowTimestamp(),
        projectTitle: p.title,
        decision: 'Aprobado',
        reason: 'Aprobado por Comité tras validación de impacto y estructura financiera.',
        actor: 'Aprobador B10',
      });
      logAudit('Aprobador B10', 'Proyecto Aprobado', `Aprobó y publicó "${p.title}" en el catálogo público.`);
      saveState();
      renderApp();
      showToast(`"${p.title}" aprobado y publicado en Explorar.`, 'success');
    },

    confirmRejectProject(e, projectId) {
      e.preventDefault();
      const p = state.projects.find((item) => item.id === projectId);
      if (!p) return;

      const reason = e.target.reason.value.trim();
      p.status = 'Rechazado';
      p.rejectionReason = reason;
      state.decisions.unshift({
        date: nowTimestamp(),
        projectTitle: p.title,
        decision: 'Rechazado',
        reason,
        actor: 'Aprobador B10',
      });
      logAudit('Aprobador B10', 'Proyecto Rechazado', `Rechazó "${p.title}". Motivo: ${reason}`);
      saveState();
      closeModal();
      renderApp();
      showToast('Proyecto rechazado y notificado a la organización.', 'warning');
    },

    advanceContributionStage(folio) {
      const c = state.contributions.find((item) => item.folio === folio);
      if (!c || c.stageIndex >= STAGES.length - 1) return;

      c.stageIndex += 1;
      logAudit(
        'Admin / Auditor B10',
        'Actualización de Trazabilidad',
        `Folio ${c.folio} avanzó a etapa "${STAGES[c.stageIndex]}".`
      );
      saveState();
      renderApp();
      showToast(`Folio ${c.folio} actualizado a: ${STAGES[c.stageIndex]}.`, 'success');
    },

    exportCSV() {
      const rows = [
        ['TIPO_REGISTRO', 'FOLIO_O_ID', 'FECHA', 'PROYECTO', 'VERTICAL', 'CATEGORIA', 'MONTO_HNL', 'ESTADO_O_ETAPA', 'PRIVACIDAD'],
      ];

      state.projects.forEach((p) => {
        rows.push([
          'PROYECTO',
          p.id,
          p.createdAt,
          p.title,
          p.vertical,
          p.category,
          p.raisedHNL,
          `${p.status} (Meta: ${p.goalHNL})`,
          'Publico',
        ]);
      });

      state.contributions.forEach((c) => {
        rows.push([
          'APORTE',
          c.folio,
          c.date,
          c.projectTitle,
          c.vertical,
          c.category,
          c.amountHNL,
          STAGES[c.stageIndex],
          c.anonymous ? 'Anonimo Publico' : c.donorName,
        ]);
      });

      const csvContent = rows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BloqueDiez_Reporte_Auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logAudit('Admin / Auditor B10', 'Exportación CSV', 'Descargó reporte consolidado de proyectos y transacciones.');
      saveState();
      renderApp();
      showToast('Reporte CSV descargado correctamente.', 'success');
    },

    openProjectDetail,
    openContributeModal,
    openPublishUpdateModal,
    openRejectModal,
    openLegalModal,
    closeModal,
  };

  // Cerrar modal con tecla ESC o clic fuera
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  document.getElementById('modal-root')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-root') closeModal();
  });

  // Inicializar SPA
  window.addEventListener('hashchange', renderApp);
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) {
      window.location.hash = '#/explorar';
    }
    renderApp();
  });
})();