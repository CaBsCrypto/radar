import { 
  ChileRegion, 
  Organization, 
  TechTool, 
  EcosystemEvent, 
  CourseResource, 
  MacroInvestmentStats,
  WebMcpCompany,
  WebMcpServicePackage
} from '../types';

export const MACRO_STATS: MacroInvestmentStats = {
  ventureCapitalUSD: "$850M+",
  totalAICompanies: 280,
  activeDevelopers: 34500,
  iliaRank: 1, // Chile #1 en el Índice Latinoamericano de IA (CENIA)
  iliaScore: "73.07 / 100",
  corfoRDIncentive: "35% Crédito Tributario Ley I+D",
  dataCentersTotal: 32,
  fiberOpticCapacity: "Cable Humboldt (Conexión Transpacífica Chile-Asia-Oceanía)"
};

export const CHILE_REGIONS: ChileRegion[] = [
  {
    id: "arica",
    name: "Arica y Parinacota",
    shortName: "Arica",
    romanNumeral: "XV",
    zone: "Norte Grande",
    capital: "Arica",
    startupsCount: 6,
    aiHubsCount: 2,
    hackathonsCount: 1,
    keySectors: ["Biotech & Agro", "Logística & Transporte"],
    topSpecialty: "Agrotech en condiciones desérticas y control hídrico con sensores IoT e IA",
    dataCenters: 1,
    webmcpCount: 2,
    universitiesWithAI: ["Universidad de Tarapacá (UTA)"],
    description: "Zona estratégica fronteriza con foco en optimización hídrica hiperárida y trazabilidad logística portuaria.",
    mapY: 8,
    mapX: 48,
    investmentUSD: 6,
    investmentBreakdown: {
      totalInvestmentUSD: 6,
      investmentTier: 'Emergente Semilla',
      yoyGrowthPercent: 15,
      publicFundingUSD: 2.5,
      privateFundingUSD: 3.5,
      topFundingSectors: ["Biotech & Agro", "Logística & Transporte"],
      keyFundsOrBackers: ["Corfo Arica", "UTA Ventures", "Semilla Expande"]
    },
    activeDevelopers: 140,
    talentBreakdown: {
      totalDevs: 140,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Agrotech en Zonas Áridas', 'IoT & Sensores Hídricos', 'Edge Computing Fronterizo'],
      seniorityRatio: { junior: 50, mid: 35, senior: 12, lead: 3 },
      averageSalaryCLP: '$2.3M CLP / mes',
      openTechRolesCount: 4,
      hiringCompaniesCount: 3,
      keyUniversities: ['Universidad de Tarapacá (UTA)'],
      topSpecialtySummary: 'Desarrolladores con experiencia práctica en hardware IoT de bajo consumo, telemetría y algoritmos de optimización de riego por goteo.',
      topTechStack: ['Python', 'C++', 'TinyML', 'FastAPI', 'MQTT'],
      recruiterNotes: 'Costos de contratación moderados, perfil de ingenieros de ejecución muy prácticos y leales con baja rotación laboral.'
    }
  },
  {
    id: "tarapaca",
    name: "Tarapacá",
    shortName: "Tarapacá",
    romanNumeral: "I",
    zone: "Norte Grande",
    capital: "Iquique",
    startupsCount: 11,
    aiHubsCount: 3,
    hackathonsCount: 2,
    keySectors: ["Minería & Energía", "Logística & Transporte"],
    topSpecialty: "Logística de ZOFRI y automatización de procesos mineros en altura",
    dataCenters: 1,
    webmcpCount: 3,
    universitiesWithAI: ["Universidad Arturo Prat"],
    description: "Polo de comercio internacional y cadenas de suministro asistidas por modelos predictivos.",
    mapY: 13,
    mapX: 47,
    investmentUSD: 11,
    investmentBreakdown: {
      totalInvestmentUSD: 11,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 19,
      publicFundingUSD: 4,
      privateFundingUSD: 7,
      topFundingSectors: ["Logística & Transporte", "Minería & Energía"],
      keyFundsOrBackers: ["Hub Tarapacá", "Corfo Innova", "ZOFRI Tech Hub"]
    },
    activeDevelopers: 180,
    talentBreakdown: {
      totalDevs: 180,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Logística Portuaria & Aduanas', 'Optimización de Ruteo', 'Mantenimiento Minero'],
      seniorityRatio: { junior: 45, mid: 38, senior: 14, lead: 3 },
      averageSalaryCLP: '$2.6M CLP / mes',
      openTechRolesCount: 6,
      hiringCompaniesCount: 4,
      keyUniversities: ['Universidad Arturo Prat (UNAP)'],
      topSpecialtySummary: 'Especialistas en software logístico para comercio exterior, trazabilidad de carga y analítica predictiva de inventarios.',
      topTechStack: ['Python', 'PostgreSQL', 'Docker', 'Time Series ML', 'React'],
      recruiterNotes: 'Fuerte conocimiento operativo de aduanas y supply chain, bilingüe por interacción constante con puertos de Asia y Sudamérica.'
    }
  },
  {
    id: "antofagasta",
    name: "Antofagasta",
    shortName: "Antofagasta",
    romanNumeral: "II",
    zone: "Norte Grande",
    capital: "Antofagasta",
    startupsCount: 34,
    aiHubsCount: 7,
    hackathonsCount: 4,
    keySectors: ["Minería & Energía", "Clima & Sustentabilidad"],
    topSpecialty: "Minería inteligente 4.0, flotación con visión por computadora y procesamiento astronómico ALMA",
    dataCenters: 3,
    webmcpCount: 8,
    universitiesWithAI: ["Universidad de Antofagasta", "Universidad Católica del Norte"],
    description: "Capital minera del cobre y litio mundial. Hub crítico para algoritmos de gemelos digitales y mantenimiento predictivo pesado.",
    mapY: 20,
    mapX: 46,
    investmentUSD: 98,
    investmentBreakdown: {
      totalInvestmentUSD: 98,
      investmentTier: 'Epicentro Tier 1',
      yoyGrowthPercent: 42,
      publicFundingUSD: 26,
      privateFundingUSD: 72,
      topFundingSectors: ["Minería & Energía", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["Aster Accelerator", "BHP Ventures", "SQM CVC", "FNDR Antofagasta"]
    },
    activeDevelopers: 1420,
    talentBreakdown: {
      totalDevs: 1420,
      densityTier: 'Densidad Media (Tier 3)',
      topAISpecialties: ['Computer Vision & Flotación', 'Gemelos Digitales & Simulación', 'Mantenimiento Predictivo Pesado', 'Astroinformática'],
      seniorityRatio: { junior: 25, mid: 45, senior: 23, lead: 7 },
      averageSalaryCLP: '$4.2M CLP / mes',
      openTechRolesCount: 38,
      hiringCompaniesCount: 19,
      keyUniversities: ['Universidad Católica del Norte (UCN)', 'Universidad de Antofagasta (UA)'],
      topSpecialtySummary: 'Mayor concentración en Sudamérica de ingenieros en Computer Vision aplicada a fluidos, rocas, correas transportadoras y teleoperación remota minera.',
      topTechStack: ['PyTorch', 'OpenCV', 'YOLOv8', 'ROS/Robótica', 'NVIDIA Jetson', 'C++'],
      recruiterNotes: 'Salarios altos por competencia con mineras corporativas (BHP, Antofagasta Minerals). Alta rigurosidad técnica en condiciones industriales extremas.'
    }
  },
  {
    id: "atacama",
    name: "Atacama",
    shortName: "Atacama",
    romanNumeral: "III",
    zone: "Norte Chico",
    capital: "Copiapó",
    startupsCount: 9,
    aiHubsCount: 2,
    hackathonsCount: 1,
    keySectors: ["Minería & Energía", "Clima & Sustentabilidad"],
    topSpecialty: "Data Centers solares de cero emisiones y pronóstico de radiación solar",
    dataCenters: 2,
    webmcpCount: 2,
    universitiesWithAI: ["Universidad de Atacama"],
    description: "La radiación solar más alta del planeta, atrayendo infraestructura de cómputo verde para entrenamiento de modelos masivos.",
    mapY: 27,
    mapX: 45,
    investmentUSD: 9,
    investmentBreakdown: {
      totalInvestmentUSD: 9,
      investmentTier: 'Emergente Semilla',
      yoyGrowthPercent: 24,
      publicFundingUSD: 3.5,
      privateFundingUSD: 5.5,
      topFundingSectors: ["Minería & Energía", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["Corfo Atacama", "InnovaChile", "Fondos Mineros Regionales"]
    },
    activeDevelopers: 130,
    talentBreakdown: {
      totalDevs: 130,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Modelado de Radiación Fotovoltaica', 'Eficiencia Energética en Cómputo', 'SCADA & IA'],
      seniorityRatio: { junior: 42, mid: 40, senior: 15, lead: 3 },
      averageSalaryCLP: '$2.8M CLP / mes',
      openTechRolesCount: 5,
      hiringCompaniesCount: 4,
      keyUniversities: ['Universidad de Atacama (UDA)'],
      topSpecialtySummary: 'Ingenieros con foco en optimización matemática de parques solares y previsión de despacho energético.',
      topTechStack: ['Python', 'TensorFlow', 'TimeSeries ML', 'InfluxDB', 'Grafana'],
      recruiterNotes: 'Nicho hiper-especializado en CleanTech y transición energética para data centers sostenibles.'
    }
  },
  {
    id: "coquimbo",
    name: "Coquimbo",
    shortName: "Coquimbo",
    romanNumeral: "IV",
    zone: "Norte Chico",
    capital: "La Serena",
    startupsCount: 18,
    aiHubsCount: 4,
    hackathonsCount: 3,
    keySectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
    topSpecialty: "Astroinformática con el Observatorio Vera C. Rubin y gestión hídrica predictiva",
    dataCenters: 1,
    webmcpCount: 4,
    universitiesWithAI: ["Universidad de La Serena", "UCN Coquimbo"],
    description: "Polo astronómico de Big Data y observatorios que generan petabytes diarios procesados con deep learning.",
    mapY: 34,
    mapX: 44,
    investmentUSD: 22,
    investmentBreakdown: {
      totalInvestmentUSD: 22,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 25,
      publicFundingUSD: 8,
      privateFundingUSD: 14,
      topFundingSectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["ULS Innova", "Corfo Coquimbo", "Fondo AstroTech Chile"]
    },
    activeDevelopers: 460,
    talentBreakdown: {
      totalDevs: 460,
      densityTier: 'Densidad Media (Tier 3)',
      topAISpecialties: ['Big Data Astronómico', 'Deep Learning en Imágenes Satelitales', 'Hidroinformática'],
      seniorityRatio: { junior: 30, mid: 45, senior: 20, lead: 5 },
      averageSalaryCLP: '$3.2M CLP / mes',
      openTechRolesCount: 14,
      hiringCompaniesCount: 8,
      keyUniversities: ['Universidad de La Serena (ULS)', 'UCN Sede Coquimbo'],
      topSpecialtySummary: 'Científicos de datos formados en manejo de pipelines masivos de petabytes para telescopios y monitoreo de cuencas hidrológicas.',
      topTechStack: ['PyTorch', 'Apache Spark', 'Python', 'Docker', 'Astropy', 'PostGIS'],
      recruiterNotes: 'Excelente base en matemáticas aplicadas, estadística rigurosa y pipelines de datos complejos a gran escala.'
    }
  },
  {
    id: "valparaiso",
    name: "Valparaíso",
    shortName: "Valparaíso",
    romanNumeral: "V",
    zone: "Centro",
    capital: "Valparaíso",
    startupsCount: 52,
    aiHubsCount: 11,
    hackathonsCount: 6,
    keySectors: ["Logística & Transporte", "Salud & MedTech", "GovTech & Legal"],
    topSpecialty: "Polo de ingeniería de software, ciberseguridad portuaria y neurotecnología",
    dataCenters: 4,
    webmcpCount: 14,
    universitiesWithAI: ["Universidad Técnica Federico Santa María (USM)", "Pontificia Universidad Católica de Valparaíso (PUCV)", "Universidad de Valparaíso"],
    description: "Segundo hub tecnológico de Chile con alta densidad de talento en ciencias de la computación e incubadoras consolidadas (3IE, Chrysalis).",
    mapY: 41,
    mapX: 42,
    investmentUSD: 68,
    investmentBreakdown: {
      totalInvestmentUSD: 68,
      investmentTier: 'Alto Flujo Tier 2',
      yoyGrowthPercent: 31,
      publicFundingUSD: 22,
      privateFundingUSD: 46,
      topFundingSectors: ["Salud & MedTech", "Logística & Transporte"],
      keyFundsOrBackers: ["Instituto 3IE", "Chrysalis PUCV", "Alaya Capital", "Corfo Innova"]
    },
    activeDevelopers: 4250,
    talentBreakdown: {
      totalDevs: 4250,
      densityTier: 'Alta Densidad (Tier 2)',
      topAISpecialties: ['Ingeniería de Software & Algoritmos', 'Deep Learning & Bioacústica', 'Ciberseguridad & Criptografía', 'Edge Computing Portuario'],
      seniorityRatio: { junior: 28, mid: 44, senior: 22, lead: 6 },
      averageSalaryCLP: '$3.5M CLP / mes',
      openTechRolesCount: 72,
      hiringCompaniesCount: 28,
      keyUniversities: ['Universidad Técnica Federico Santa María (USM)', 'Pontificia Universidad Católica de Valparaíso (PUCV)', 'Universidad de Valparaíso (UV)'],
      topSpecialtySummary: 'Tradición de excelencia en ciencias de la computación liderada por la USM y PUCV. Fuerte semillero de arquitectos de software, criptógrafos y modeladores matemáticos.',
      topTechStack: ['PyTorch', 'Rust', 'C++', 'Go', 'Python', 'Kubernetes', 'Docker'],
      recruiterNotes: 'Gran receptividad para esquemas de trabajo híbrido (Viña del Mar / Valparaíso / Santiago). Alta tasa de graduados con perfil internacional.'
    }
  },
  {
    id: "metropolitana",
    name: "Región Metropolitana",
    shortName: "Santiago RM",
    romanNumeral: "XIII",
    zone: "Centro",
    capital: "Santiago",
    startupsCount: 148,
    aiHubsCount: 26,
    hackathonsCount: 14,
    keySectors: ["Fintech & Banca", "Retail & E-commerce", "Salud & MedTech", "GovTech & Legal"],
    topSpecialty: "Capital tech de Chile: sede de CENIA, Google Cloud Region, Start-Up Chile, Unicornios y DeepTech",
    dataCenters: 18,
    webmcpCount: 42,
    universitiesWithAI: ["Universidad de Chile (DCC/CENIA)", "Pontificia Universidad Católica de Chile", "Universidad Adolfo Ibáñez", "Universidad de Santiago (USACH)"],
    description: "Epicentro financiero y de inversión de Chile. Alberga los laboratorios más avanzados de IA de Sudamérica y las sedes corporativas de empresas multinacionales.",
    mapY: 46,
    mapX: 43,
    investmentUSD: 520,
    investmentBreakdown: {
      totalInvestmentUSD: 520,
      investmentTier: 'Epicentro Tier 1',
      yoyGrowthPercent: 28,
      publicFundingUSD: 95,
      privateFundingUSD: 425,
      topFundingSectors: ["Fintech & Banca", "Retail & E-commerce", "Salud & MedTech"],
      keyFundsOrBackers: ["Kaszek", "Nazca", "Chile Ventures", "Start-Up Chile", "Endeavor"]
    },
    activeDevelopers: 21800,
    talentBreakdown: {
      totalDevs: 21800,
      densityTier: 'Polo Crítico (Tier 1)',
      topAISpecialties: ['GenAI & Sistemas LLM (RAG/Agentes)', 'MLOps & Arquitectura Cloud', 'Fintech Risk Modeling & Fraude', 'NLP en Español Latinoamericano'],
      seniorityRatio: { junior: 20, mid: 42, senior: 28, lead: 10 },
      averageSalaryCLP: '$4.5M CLP / mes',
      openTechRolesCount: 310,
      hiringCompaniesCount: 94,
      keyUniversities: ['Universidad de Chile (DCC)', 'Pontificia Universidad Católica de Chile (DCC UC)', 'Universidad Adolfo Ibáñez (UAI)', 'USACH'],
      topSpecialtySummary: 'Mayor concentración de científicos de IA, ingenieros de prompts, investigadores de CENIA y arquitectos cloud de la cuenca del Pacífico sur.',
      topTechStack: ['Gemini API', 'LangChain', 'vLLM', 'PostgreSQL pgvector', 'PyTorch', 'Vertex AI', 'FastAPI'],
      recruiterNotes: 'Mercado de talento más maduro y dinámico del país; alta competencia entre unicornios, banca y scaleups por seniors de IA generativa y MLOps.'
    }
  },
  {
    id: "ohiggins",
    name: "Libertador General Bernardo O'Higgins",
    shortName: "O'Higgins",
    romanNumeral: "VI",
    zone: "Centro",
    capital: "Rancagua",
    startupsCount: 14,
    aiHubsCount: 3,
    hackathonsCount: 2,
    keySectors: ["Biotech & Agro", "Minería & Energía"],
    topSpecialty: "AgroTech de exportación, robótica en cosecha de uva y minería subterránea (El Teniente)",
    dataCenters: 1,
    webmcpCount: 3,
    universitiesWithAI: ["Universidad de O'Higgins (UOH)"],
    description: "Conexión directa entre la agroindustria de alta gama y automatización subterránea.",
    mapY: 50,
    mapX: 42,
    investmentUSD: 14,
    investmentBreakdown: {
      totalInvestmentUSD: 14,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 20,
      publicFundingUSD: 5,
      privateFundingUSD: 9,
      topFundingSectors: ["Biotech & Agro", "Minería & Energía"],
      keyFundsOrBackers: ["Hub O'Higgins", "FNDR O'Higgins", "Corfo"]
    },
    activeDevelopers: 340,
    talentBreakdown: {
      totalDevs: 340,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Robótica Agrícola & Packaging', 'Detección de Defectos en Fruta', 'Automatización Minera Subterránea'],
      seniorityRatio: { junior: 40, mid: 42, senior: 15, lead: 3 },
      averageSalaryCLP: '$2.9M CLP / mes',
      openTechRolesCount: 9,
      hiringCompaniesCount: 6,
      keyUniversities: ['Universidad de O\'Higgins (UOH)'],
      topSpecialtySummary: 'Ingenieros especializados en visión por computadora en líneas de empaque y clasificación de cerezas y uvas de exportación.',
      topTechStack: ['Python', 'OpenCV', 'PyTorch', 'YOLOv8', 'Edge AI'],
      recruiterNotes: 'Gran cercanía a Santiago (1 hora) permite reclutar talento que busca menor costo de vida pero proyectos industriales de alta exigencia.'
    }
  },
  {
    id: "maule",
    name: "Maule",
    shortName: "Maule",
    romanNumeral: "VII",
    zone: "Centro",
    capital: "Talca",
    startupsCount: 16,
    aiHubsCount: 3,
    hackathonsCount: 2,
    keySectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
    topSpecialty: "Visión computacional para selección de fruta y fenotipado digital",
    dataCenters: 1,
    webmcpCount: 4,
    universitiesWithAI: ["Universidad de Talca", "Universidad Católica del Maule"],
    description: "Corazón agroindustrial chileno donde algoritmos supervisan la sanidad vegetal y riego satelital.",
    mapY: 54,
    mapX: 41,
    investmentUSD: 15,
    investmentBreakdown: {
      totalInvestmentUSD: 15,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 22,
      publicFundingUSD: 6,
      privateFundingUSD: 9,
      topFundingSectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["Utalca Innova", "FIA Chile", "Corfo Maule"]
    },
    activeDevelopers: 390,
    talentBreakdown: {
      totalDevs: 390,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Fenotipado Digital con Drones', 'Modelos Climáticos Vitivinícolas', 'Agrotech Predictivo'],
      seniorityRatio: { junior: 38, mid: 45, senior: 14, lead: 3 },
      averageSalaryCLP: '$2.7M CLP / mes',
      openTechRolesCount: 11,
      hiringCompaniesCount: 7,
      keyUniversities: ['Universidad de Talca', 'Universidad Católica del Maule (UCM)'],
      topSpecialtySummary: 'Programadores y bioinformáticos que combinan visión computacional con teledetección espectral para viñedos y frutales.',
      topTechStack: ['Python', 'QGIS / GDAL', 'Scikit-learn', 'PyTorch', 'FastAPI'],
      recruiterNotes: 'Perfil enfocado en resolución de problemas agroclimáticos reales con alta dedicación técnica.'
    }
  },
  {
    id: "nuble",
    name: "Ñuble",
    shortName: "Ñuble",
    romanNumeral: "XVI",
    zone: "Sur",
    capital: "Chillán",
    startupsCount: 8,
    aiHubsCount: 2,
    hackathonsCount: 1,
    keySectors: ["Biotech & Agro", "Logística & Transporte"],
    topSpecialty: "Bioinformática agrícola y telemetría rural de bajo costo",
    dataCenters: 0,
    webmcpCount: 2,
    universitiesWithAI: ["Universidad del Bío-Bío (Chillán)", "Universidad de Concepción (Campus Chillán)"],
    description: "La región más joven de Chile acelerando su modernización a través de proyectos de IA comunitaria.",
    mapY: 58,
    mapX: 40,
    investmentUSD: 7,
    investmentBreakdown: {
      totalInvestmentUSD: 7,
      investmentTier: 'Emergente Semilla',
      yoyGrowthPercent: 18,
      publicFundingUSD: 3,
      privateFundingUSD: 4,
      topFundingSectors: ["Biotech & Agro", "Logística & Transporte"],
      keyFundsOrBackers: ["UdeC Chillán", "Corfo Ñuble", "FNDR Ñuble"]
    },
    activeDevelopers: 220,
    talentBreakdown: {
      totalDevs: 220,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Bioinformática Agrícola', 'Telemetría Rural', 'Procesamiento de Alimentos'],
      seniorityRatio: { junior: 45, mid: 38, senior: 14, lead: 3 },
      averageSalaryCLP: '$2.5M CLP / mes',
      openTechRolesCount: 7,
      hiringCompaniesCount: 5,
      keyUniversities: ['Universidad del Bío-Bío (Campus Chillán)', 'Universidad de Concepción (Campus Chillán)'],
      topSpecialtySummary: 'Desarrolladores con foco en sensórica de bajo costo para cooperativas agrícolas y análisis de suelos con machine learning.',
      topTechStack: ['Python', 'PostgreSQL', 'Scikit-learn', 'FastAPI', 'LoRaWAN'],
      recruiterNotes: 'Costos competitivos y excelente ética laboral, ideales para desarrolladores fullstack con afinidad en IoT y backend.'
    }
  },
  {
    id: "biobio",
    name: "Biobío",
    shortName: "Biobío",
    romanNumeral: "VIII",
    zone: "Sur",
    capital: "Concepción",
    startupsCount: 42,
    aiHubsCount: 9,
    hackathonsCount: 5,
    keySectors: ["Biotech & Agro", "Logística & Transporte", "Salud & MedTech"],
    topSpecialty: "Robótica industrial, IA médica diagnóstica, monitoreo forestal y bioingeniería",
    dataCenters: 3,
    webmcpCount: 12,
    universitiesWithAI: ["Universidad de Concepción (UdeC)", "Universidad del Bío-Bío", "Universidad Católica de la Santísima Concepción"],
    description: "Polo industrial y científico del sur con una comunidad vibrante de graduados en ingeniería civil informática y patentes tecnológicas.",
    mapY: 62,
    mapX: 39,
    investmentUSD: 54,
    investmentBreakdown: {
      totalInvestmentUSD: 54,
      investmentTier: 'Alto Flujo Tier 2',
      yoyGrowthPercent: 35,
      publicFundingUSD: 19,
      privateFundingUSD: 35,
      topFundingSectors: ["Biotech & Agro", "Salud & MedTech"],
      keyFundsOrBackers: ["Incuba UdeC", "Fondo Alerce", "Didi Ventures", "Corfo Biobío"]
    },
    activeDevelopers: 3650,
    talentBreakdown: {
      totalDevs: 3650,
      densityTier: 'Alta Densidad (Tier 2)',
      topAISpecialties: ['Computer Vision en Madera & Celulosa', 'Modelos Médicos & Diagnóstico por Imagen', 'Robótica Industrial & Cinemática', 'NLP de Documentación Técnica'],
      seniorityRatio: { junior: 26, mid: 45, senior: 22, lead: 7 },
      averageSalaryCLP: '$3.4M CLP / mes',
      openTechRolesCount: 56,
      hiringCompaniesCount: 22,
      keyUniversities: ['Universidad de Concepción (UdeC)', 'Universidad del Bío-Bío (UBB)', 'UCSC'],
      topSpecialtySummary: 'La UdeC es un bastión de ciencias de la computación e investigación con patentes mundiales en visión artificial y optimización de cadenas forestales/portuarias.',
      topTechStack: ['PyTorch', 'C++', 'OpenCV', 'ROS', 'Python', 'TensorFlow', 'Docker'],
      recruiterNotes: 'Tercer mayor polo de desarrolladores en Chile con perfil técnico muy profundo (ingenieros civiles informáticos con base matemática y de sistemas sólida).'
    }
  },
  {
    id: "araucania",
    name: "La Araucanía",
    shortName: "Araucanía",
    romanNumeral: "IX",
    zone: "Sur",
    capital: "Temuco",
    startupsCount: 15,
    aiHubsCount: 4,
    hackathonsCount: 2,
    keySectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
    topSpecialty: "Detección temprana de incendios forestales con IA satelital y biotecnología fúngica",
    dataCenters: 1,
    webmcpCount: 5,
    universitiesWithAI: ["Universidad de La Frontera (UFRO)", "Universidad Católica de Temuco"],
    description: "Foco en resiliencia climática, prevención de desastres naturales y economía circular.",
    mapY: 66,
    mapX: 39,
    investmentUSD: 13,
    investmentBreakdown: {
      totalInvestmentUSD: 13,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 26,
      publicFundingUSD: 5,
      privateFundingUSD: 8,
      topFundingSectors: ["Clima & Sustentabilidad", "Biotech & Agro"],
      keyFundsOrBackers: ["IncubatecUFRO", "Corfo Araucanía", "FNDR Araucanía"]
    },
    activeDevelopers: 1120,
    talentBreakdown: {
      totalDevs: 1120,
      densityTier: 'Densidad Media (Tier 3)',
      topAISpecialties: ['Detección de Incendios con Deep Learning', 'Biotech Fúngica & Modelado Molecular', 'Sistemas Geoespaciales Satelitales'],
      seniorityRatio: { junior: 32, mid: 44, senior: 19, lead: 5 },
      averageSalaryCLP: '$3.0M CLP / mes',
      openTechRolesCount: 22,
      hiringCompaniesCount: 11,
      keyUniversities: ['Universidad de La Frontera (UFRO)', 'Universidad Católica de Temuco (UCT)'],
      topSpecialtySummary: 'Ingenieros con sólida formación en análisis espectral de imágenes Sentinel/Landsat, redes neuronales convolucionales y desarrollo web distribuido.',
      topTechStack: ['Python', 'PyTorch', 'GeoPandas', 'Google Earth Engine', 'FastAPI'],
      recruiterNotes: 'Ecosistema impulsado por IncubatecUFRO; desarrolladores motivados por proyectos con alto impacto ecológico y social.'
    }
  },
  {
    id: "losrios",
    name: "Los Ríos",
    shortName: "Los Ríos",
    romanNumeral: "XIV",
    zone: "Sur",
    capital: "Valdivia",
    startupsCount: 21,
    aiHubsCount: 5,
    hackathonsCount: 3,
    keySectors: ["Biotech & Agro", "Clima & Sustentabilidad", "Salud & MedTech"],
    topSpecialty: "Bioinformática, software ecológico, modelación de bosques nativos y calidad de vida tech",
    dataCenters: 1,
    webmcpCount: 3,
    universitiesWithAI: ["Universidad Austral de Chile (UACh)"],
    description: "Valdivia se consolida como ciudad creativa y tecnológica con alto atractivo para nómadas digitales y DeepTech biológica.",
    mapY: 71,
    mapX: 38,
    investmentUSD: 19,
    investmentBreakdown: {
      totalInvestmentUSD: 19,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 29,
      publicFundingUSD: 7,
      privateFundingUSD: 12,
      topFundingSectors: ["Biotech & Agro", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["Austral Incuba", "Valdivia Tech Angels", "Corfo Los Ríos"]
    },
    activeDevelopers: 210,
    talentBreakdown: {
      totalDevs: 210,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Bioinformática & Genómica', 'Modelación de Biodiversidad', 'Sistemas Distribuidos Sostenibles'],
      seniorityRatio: { junior: 30, mid: 44, senior: 21, lead: 5 },
      averageSalaryCLP: '$3.1M CLP / mes',
      openTechRolesCount: 12,
      hiringCompaniesCount: 8,
      keyUniversities: ['Universidad Austral de Chile (UACh)'],
      topSpecialtySummary: 'Hub de bioinformática y nómadas digitales seniors que eligen Valdivia por calidad de vida, con fuertes habilidades en simulación ecológica y datos genómicos.',
      topTechStack: ['Python', 'BioPython', 'R', 'PyTorch', 'Docker', 'PostgreSQL'],
      recruiterNotes: 'Muy alta tasa de retención de personal; talento senior reubicado desde Santiago buscando teletrabajo en empresas tecnológicas.'
    }
  },
  {
    id: "loslagos",
    name: "Los Lagos",
    shortName: "Los Lagos",
    romanNumeral: "X",
    zone: "Sur",
    capital: "Puerto Montt",
    startupsCount: 24,
    aiHubsCount: 5,
    hackathonsCount: 2,
    keySectors: ["Biotech & Agro", "Logística & Transporte", "Clima & Sustentabilidad"],
    topSpecialty: "Acuicultura inteligente, conteo y biomasa submarina con Computer Vision en fiordos",
    dataCenters: 1,
    webmcpCount: 7,
    universitiesWithAI: ["Universidad de Los Lagos", "Universidad San Sebastián (Sede Patagonia)"],
    description: "Segundo exportador mundial de salmón. La IA submarina optimiza la alimentación y reduce drásticamente el impacto ambiental.",
    mapY: 76,
    mapX: 37,
    investmentUSD: 28,
    investmentBreakdown: {
      totalInvestmentUSD: 28,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 38,
      publicFundingUSD: 11,
      privateFundingUSD: 17,
      topFundingSectors: ["Biotech & Agro", "Logística & Transporte"],
      keyFundsOrBackers: ["Patagonia Angels", "Cowork Puerto Montt", "Corfo Los Lagos"]
    },
    activeDevelopers: 680,
    talentBreakdown: {
      totalDevs: 680,
      densityTier: 'Densidad Media (Tier 3)',
      topAISpecialties: ['Computer Vision Submarino & Sonar', 'Estimación de Biomasa en Peces', 'Edge Computing en Balsas Jaula', 'Optimización de Alimentación'],
      seniorityRatio: { junior: 30, mid: 46, senior: 19, lead: 5 },
      averageSalaryCLP: '$3.6M CLP / mes',
      openTechRolesCount: 24,
      hiringCompaniesCount: 14,
      keyUniversities: ['Universidad de Los Lagos (ULagos)', 'Universidad San Sebastián Patagonia'],
      topSpecialtySummary: 'Desarrolladores especializados en visión por computadora en ambientes turbios acuáticos, cámaras estereoscópicas subacuáticas y dispositivos de borde resistentes a la corrosión.',
      topTechStack: ['OpenCV', 'YOLOv8', 'PyTorch', 'NVIDIA DeepStream', 'C++', 'Python'],
      recruiterNotes: 'Altamente demandados por productoras acuícolas internacionales. Perfiles con gran habilidad para resolver problemas en hardware y condiciones climáticas severas.'
    }
  },
  {
    id: "aysen",
    name: "Aysén del General Carlos Ibáñez del Campo",
    shortName: "Aysén",
    romanNumeral: "XI",
    zone: "Austral",
    capital: "Coyhaique",
    startupsCount: 5,
    aiHubsCount: 2,
    hackathonsCount: 1,
    keySectors: ["Clima & Sustentabilidad", "GovTech & Legal"],
    topSpecialty: "Modelado de retroceso glaciar, hidrología extrema y redes Mesh con edge computing",
    dataCenters: 0,
    webmcpCount: 1,
    universitiesWithAI: ["Universidad de Aysén", "Centro de Investigación en Ecosistemas de la Patagonia (CIEP)"],
    description: "Laboratorio natural para estudiar el cambio climático con algoritmos de simulación planetaria.",
    mapY: 84,
    mapX: 35,
    investmentUSD: 5,
    investmentBreakdown: {
      totalInvestmentUSD: 5,
      investmentTier: 'Emergente Semilla',
      yoyGrowthPercent: 30,
      publicFundingUSD: 2.5,
      privateFundingUSD: 2.5,
      topFundingSectors: ["Clima & Sustentabilidad", "GovTech & Legal"],
      keyFundsOrBackers: ["CIEP Patagonia", "FNDR Aysén", "Corfo Aysén"]
    },
    activeDevelopers: 90,
    talentBreakdown: {
      totalDevs: 90,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Monitoreo Glaciar', 'Redes Mesh en Zonas Aisladas', 'Modelado Hidrológico'],
      seniorityRatio: { junior: 45, mid: 40, senior: 12, lead: 3 },
      averageSalaryCLP: '$2.8M CLP / mes',
      openTechRolesCount: 3,
      hiringCompaniesCount: 2,
      keyUniversities: ['Universidad de Aysén', 'CIEP'],
      topSpecialtySummary: 'Especialistas en algoritmos de procesamiento de datos remotos con baja conectividad e instrumentación meteorológica extrema.',
      topTechStack: ['Python', 'SciPy', 'QGIS', 'SQLite', 'TinyML'],
      recruiterNotes: 'Talento resiliente con gran iniciativa de autoaprendizaje y capacidad de operar en entornos sin infraestructura de nube continua.'
    }
  },
  {
    id: "magallanes",
    name: "Magallanes y de la Antártica Chilena",
    shortName: "Magallanes",
    romanNumeral: "XII",
    zone: "Austral",
    capital: "Punta Arenas",
    startupsCount: 8,
    aiHubsCount: 3,
    hackathonsCount: 1,
    keySectors: ["Minería & Energía", "Clima & Sustentabilidad"],
    topSpecialty: "Optimización aerodinámica para Hidrógeno Verde y logística marítima polar antártica",
    dataCenters: 1,
    webmcpCount: 2,
    universitiesWithAI: ["Universidad de Magallanes (UMAG)", "Instituto Antártico Chileno (INACH)"],
    description: "Portal mundial a la Antártica y polo emergente de energías del futuro con modelos de simulación de vientos extremos.",
    mapY: 92,
    mapX: 36,
    investmentUSD: 10,
    investmentBreakdown: {
      totalInvestmentUSD: 10,
      investmentTier: 'Crecimiento Tier 3',
      yoyGrowthPercent: 45,
      publicFundingUSD: 4,
      privateFundingUSD: 6,
      topFundingSectors: ["Minería & Energía", "Clima & Sustentabilidad"],
      keyFundsOrBackers: ["UMAG Tech Hub", "FNDR Magallanes", "H2V Magallanes Fund"]
    },
    activeDevelopers: 160,
    talentBreakdown: {
      totalDevs: 160,
      densityTier: 'Polo Emergente',
      topAISpecialties: ['Simulación de Vientos para H2V', 'IA Polar & Logística Antártica', 'Electrólisis Predictiva'],
      seniorityRatio: { junior: 35, mid: 45, senior: 16, lead: 4 },
      averageSalaryCLP: '$3.3M CLP / mes',
      openTechRolesCount: 8,
      hiringCompaniesCount: 5,
      keyUniversities: ['Universidad de Magallanes (UMAG)', 'INACH'],
      topSpecialtySummary: 'Modeladores numéricos e ingenieros en machine learning enfocados en la curva de generación de parques eólicos gigantes y plantas de hidrógeno verde.',
      topTechStack: ['Python', 'OpenFOAM', 'PyTorch', 'TimeSeries ML', 'Docker'],
      recruiterNotes: 'Cluster en rápido crecimiento por inversiones europeas en combustibles sintéticos y consorcios de H2V.'
    }
  }
];

export const ORGANIZATIONS: Organization[] = [
  {
    id: "cenia",
    name: "CENIA (Centro Nacional de Inteligencia Artificial)",
    type: "Centro I+D",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "GovTech & Legal",
    website: "https://cenia.cl",
    tagline: "El centro basal de investigación y desarrollo de IA líder en América Latina",
    aiUseCase: "Crea el Índice Latinoamericano de IA (ILIA), entrena modelos de lenguaje multimodales adaptados al español de la región y asesora políticas públicas de IA.",
    toolsUsed: ["PyTorch", "Hugging Face", "vLLM", "Slurm", "LangChain"],
    hiringStatus: true,
    openRoles: ["Postdoctoral AI Researcher", "ML Engineer en LLMs", "Especialista en Evaluación de Modelos"],
    foundedYear: 2021,
    verified: true,
    contactEmail: "contacto@cenia.cl"
  },
  {
    id: "notco",
    name: "The Not Company (NotCo)",
    type: "Scaleup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Biotech & Agro",
    website: "https://notco.com",
    tagline: "Unicornio chileno pionero en FoodTech impulsado por IA patentada (Giuseppe)",
    aiUseCase: "Su algoritmo Giuseppe analiza la estructura molecular de plantas y cruza datos organolépticos para replicar sabor, aroma y textura de productos animales.",
    toolsUsed: ["Python", "PyTorch", "TensorFlow", "PostgreSQL", "AWS / Docker"],
    fundingStage: "Series D ($300M+)",
    hiringStatus: true,
    openRoles: ["Senior ChemInformatics Engineer", "Data Scientist NLP & Flavour", "MLOps Lead"],
    foundedYear: 2015,
    verified: true,
    contactEmail: "careers@notco.com"
  },
  {
    id: "fintoc",
    name: "Fintoc",
    type: "Scaleup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Fintech & Banca",
    website: "https://fintoc.com",
    tagline: "Infraestructura de banca abierta y pagos instantáneos con IA de conciliación",
    aiUseCase: "Modelos de scoring antifraude en tiempo real, categorización semántica de millones de transferencias bancarias y agentes de soporte financiero con LLMs.",
    toolsUsed: ["Gemini API", "PostgreSQL", "pgvector", "Kubernetes", "TypeScript"],
    fundingStage: "Y Combinator / Series A",
    hiringStatus: true,
    openRoles: ["Senior Backend Engineer", "Fraud & Risk Data Scientist"],
    foundedYear: 2020,
    verified: true,
    contactEmail: "jobs@fintoc.com"
  },
  {
    id: "phagelab",
    name: "PhageLab",
    type: "Startup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Biotech & Agro",
    website: "https://phagelab.com",
    tagline: "Biotecnología con diseño de bacteriófagos asistido por modelos generativos",
    aiUseCase: "Acelera el descubrimiento y formulación de tratamientos de bacteriófagos para combatir la resistencia bacteriana en la industria ganadera y avícola mundial.",
    toolsUsed: ["PyTorch", "BioPython", "AlphaFold / ESMFold", "Docker", "GCP Vertex AI"],
    fundingStage: "Series A ($11M)",
    hiringStatus: true,
    openRoles: ["Bioinformatician IA", "Deep Learning Research Scientist"],
    foundedYear: 2017,
    verified: true,
    contactEmail: "info@phagelab.com"
  },
  {
    id: "cero-ai",
    name: "Cero.ai",
    type: "Startup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Salud & MedTech",
    website: "https://cero.ai",
    tagline: "Automatización de citas y coordinación de pacientes con IA conversacional",
    aiUseCase: "Reduce en más de 40% el ausentismo en clínicas y hospitales de Latinoamérica mediante agentes inteligentes de WhatsApp y telefonía con reconocimiento de intención.",
    toolsUsed: ["Gemini API", "Whisper", "LangChain", "FastAPI", "Redis"],
    fundingStage: "Seed ($3.5M)",
    hiringStatus: true,
    openRoles: ["Conversational AI Engineer", "Full Stack React & Node"],
    foundedYear: 2019,
    verified: true,
    contactEmail: "talento@cero.ai"
  },
  {
    id: "fracttal",
    name: "Fracttal",
    type: "Scaleup",
    regionId: "valparaiso",
    city: "Viña del Mar / Santiago",
    sector: "Minería & Energía",
    website: "https://fracttal.com",
    tagline: "Software de mantenimiento de activos 100% cloud con IA predictiva (Fracttal Sense)",
    aiUseCase: "Sensores IoT analizan vibraciones, temperatura y telemetría de maquinaria pesada, anticipando fallas mecánicas hasta 3 semanas antes.",
    toolsUsed: ["TensorFlow", "Scikit-Learn", "Node.js", "Docker", "AWS IoT"],
    fundingStage: "Series A ($5.3M)",
    hiringStatus: true,
    openRoles: ["IoT Firmware Dev", "Time Series ML Engineer"],
    foundedYear: 2014,
    verified: true,
    contactEmail: "people@fracttal.com"
  },
  {
    id: "coppertech-ai",
    name: "Andes Mining Analytics",
    type: "PyME",
    regionId: "antofagasta",
    city: "Antofagasta",
    sector: "Minería & Energía",
    website: "https://andesmining.cl",
    tagline: "Visión computacional para molienda SAG y flotación de concentrado de cobre",
    aiUseCase: "Cámaras industriales de alta velocidad inspeccionan el tamaño de roca y burbujas de flotación en faenas mineras, mejorando la recuperación metalúrgica un 2.8%.",
    toolsUsed: ["YOLOv8", "OpenCV", "PyTorch", "NVIDIA Jetson Edge", "Python"],
    fundingStage: "Corfo Crea y Valida / Bootstrapped",
    hiringStatus: true,
    openRoles: ["Edge Computer Vision Engineer", "Ingeniero Metalúrgico de Datos"],
    foundedYear: 2021,
    verified: true,
    contactEmail: "contacto@andesmining.cl"
  },
  {
    id: "drivin",
    name: "Drivin",
    type: "Scaleup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Logística & Transporte",
    website: "https://driv.in",
    tagline: "TMS inteligente con algoritmos de optimización de rutas de última milla",
    aiUseCase: "Ahorra millones de kilómetros de trayecto en más de 25 países utilizando heurísticas y machine learning para predecir tráfico, ventanas de entrega y congestión urbana.",
    toolsUsed: ["Python", "OR-Tools", "Go", "PostGIS", "Docker"],
    fundingStage: "Consolidada / Expansión Global",
    hiringStatus: false,
    foundedYear: 2014,
    verified: true,
    contactEmail: "info@driv.in"
  },
  {
    id: "wheeltheworld",
    name: "Wheel the World",
    type: "Startup",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Retail & E-commerce",
    website: "https://gowheeltheworld.com",
    tagline: "Plataforma global de viajes para personas con discapacidad potenciada por IA",
    aiUseCase: "Clasifica y mapea automáticamente parámetros de accesibilidad física (anchos de puerta, rampas, baños) y recomienda itinerarios hiper-personalizados.",
    toolsUsed: ["Anthropic Claude", "Gemini API", "Next.js", "Supabase", "TypeScript"],
    fundingStage: "Seed ($6M)",
    hiringStatus: true,
    openRoles: ["Lead UX/UI Designer", "Prompt & Agent Developer"],
    foundedYear: 2018,
    verified: true,
    contactEmail: "jobs@gowheeltheworld.com"
  },
  {
    id: "aquasense-patagonia",
    name: "Patagonia AquaVision",
    type: "Startup",
    regionId: "loslagos",
    city: "Puerto Montt",
    sector: "Biotech & Agro",
    website: "https://aquavision.cl",
    tagline: "Monitoreo submarino con cámaras autónomas e IA para centros de cultivo de salmón",
    aiUseCase: "Detecta parásitos (cáligus), mide apetito en tiempo real para evitar desperdicio de pellets y calcula el peso promedio de peces sin necesidad de extraerlos del agua.",
    toolsUsed: ["YOLOv8", "PyTorch", "ROS (Robot Operating System)", "NVIDIA Jetson", "GCP"],
    fundingStage: "Seed / Venture Capital Chile",
    hiringStatus: true,
    openRoles: ["Robotics & CV Developer", "Patagonia Field Tech"],
    foundedYear: 2022,
    verified: true,
    contactEmail: "hola@aquavision.cl"
  },
  {
    id: "codelco-digital",
    name: "Codelco Tech & Automatización",
    type: "Gran Empresa",
    regionId: "metropolitana",
    city: "Santiago / Rancagua / Calama",
    sector: "Minería & Energía",
    website: "https://codelco.com",
    tagline: "Mayor productor mundial de cobre operando centros integrados de operaciones (CIO)",
    aiUseCase: "Manejo autónomo de camiones de extracción CaEx en Gabriela Mistral, gemelos digitales de plantas concentradoras y optimización energética con algoritmos de refuerzo.",
    toolsUsed: ["Databricks", "Azure ML", "Python", "SAP S/4HANA", "IoT Industrial"],
    fundingStage: "Empresa Estatal Chilena",
    hiringStatus: true,
    openRoles: ["Jefe de Proyectos Analítica Avanzada", "Ingeniero de Automatización"],
    foundedYear: 1976,
    verified: true,
    contactEmail: "postulaciones@codelco.cl"
  },
  {
    id: "bci-ia-labs",
    name: "Banco BCI (Centro de Excelencia en IA)",
    type: "Gran Empresa",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "Fintech & Banca",
    website: "https://bci.cl",
    tagline: "Institución financiera líder en adopción de IA generativa y ciberdefensa",
    aiUseCase: "Copilotos internos para oficiales de crédito, detección de transferencias fraudulentas en milisegundos y asistentes virtuales hipotecarios.",
    toolsUsed: ["Gemini API", "OpenAI", "AWS Bedrock", "Python", "Kubernetes"],
    fundingStage: "Corporativo",
    hiringStatus: true,
    openRoles: ["Ingeniero de Datos Senior", "Arquitecto de Soluciones GenAI"],
    foundedYear: 1937,
    verified: true,
    contactEmail: "talento@bci.cl"
  },
  {
    id: "vina-conchaytoro-rd",
    name: "Centro de Investigación e Innovación Viña Concha y Toro",
    type: "Centro I+D",
    regionId: "maule",
    city: "Pencahue, Maule",
    sector: "Biotech & Agro",
    website: "https://cii.conchaytoro.com",
    tagline: "Investigación agrícola de vanguardia para la producción vitivinícola sustentable",
    aiUseCase: "Modelos espectrales con imágenes multiespectrales de drones y satélites para pronosticar estrés hídrico de la vid y determinar la fecha óptima de cosecha.",
    toolsUsed: ["Python", "Google Earth Engine", "Scikit-Learn", "R", "ArcGIS"],
    fundingStage: "Corporativo I+D",
    hiringStatus: false,
    foundedYear: 2014,
    verified: true,
    contactEmail: "cii@conchaytoro.cl"
  },
  {
    id: "bioforest-arauco",
    name: "Bioforest (Arauco)",
    type: "Centro I+D",
    regionId: "biobio",
    city: "Concepción",
    sector: "Clima & Sustentabilidad",
    website: "https://bioforest.arauco.com",
    tagline: "Centro de investigación forestal y bioproductos más grande del cono sur",
    aiUseCase: "Redes neuronales de teledetección para detección temprana de focos de incendios, clasificación de masa boscosa y diseño de materiales biodegradables.",
    toolsUsed: ["PyTorch", "QGIS", "TensorFlow", "PostGIS", "Python"],
    fundingStage: "Corporativo I+D",
    hiringStatus: true,
    openRoles: ["Investigador en Teledetección", "Data Engineer Forestal"],
    foundedYear: 1990,
    verified: true,
    contactEmail: "bioforest@arauco.com"
  },
  {
    id: "imfd",
    name: "IMFD (Instituto Milenio Fundamentos de los Datos)",
    type: "Centro I+D",
    regionId: "metropolitana",
    city: "Santiago",
    sector: "GovTech & Legal",
    website: "https://imfd.cl",
    tagline: "Investigación científica de frontera en bases de datos, grafos de conocimiento e IA",
    aiUseCase: "Investigación en teoría de grafos, explicabilidad de modelos de caja negra, análisis de desinformación electoral y gobernanza ética de datos.",
    toolsUsed: ["Python", "Neo4j", "PyTorch", "SPARQL", "Transformers"],
    hiringStatus: true,
    openRoles: ["Asistente de Investigación", "Desarrollador Web Científico"],
    foundedYear: 2018,
    verified: true,
    contactEmail: "comunicaciones@imfd.cl"
  }
];

export const TECH_TOOLS: TechTool[] = [
  {
    id: "gemini-api",
    name: "Gemini API & Vertex AI",
    category: "Modelos & LLMs",
    description: "Modelos multimodales de Google de baja latencia con ventana de contexto de 1M-2M tokens. Muy populares en Chile por integración con GCP Quilicura Datacenter.",
    adoptionPercentage: 74,
    usedByCount: 48,
    companiesUsing: ["Fintoc", "Cero.ai", "Wheel the World", "BCI", "Falabella"],
    docUrl: "https://ai.google.dev",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "pytorch",
    name: "PyTorch",
    category: "Orquestación & Frameworks",
    description: "Estándar 'de facto' en universidades chilenas (CENIA, UdeC, PUC) para deep learning, investigación aplicada y entrenamiento de modelos propios.",
    adoptionPercentage: 86,
    usedByCount: 65,
    companiesUsing: ["CENIA", "NotCo", "PhageLab", "Patagonia AquaVision", "Bioforest"],
    docUrl: "https://pytorch.org",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "langchain",
    name: "LangChain & LlamaIndex",
    category: "Orquestación & Frameworks",
    description: "Frameworks líderes para orquestar flujos de RAG (Retrieval-Augmented Generation), memoria y agentes conversacionales corporativos.",
    adoptionPercentage: 68,
    usedByCount: 42,
    companiesUsing: ["Cero.ai", "Wheel the World", "BCI", "CENIA", "Fintoc"],
    docUrl: "https://langchain.com",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "yolo-vision",
    name: "YOLOv8 & OpenCV",
    category: "Visión & Audio",
    description: "Modelos ultrarrápidos para detección de objetos en tiempo real, conteo de piezas y clasificación en minería, agro y acuicultura en el sur.",
    adoptionPercentage: 62,
    usedByCount: 38,
    companiesUsing: ["Andes Mining Analytics", "Patagonia AquaVision", "Viña Concha y Toro", "Bioforest"],
    docUrl: "https://ultralytics.com",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "supabase-pgvector",
    name: "PostgreSQL con pgvector & Supabase",
    category: "Vector DBs & Datos",
    description: "Almacenamiento y búsqueda vectorial de alta velocidad. Favorito entre desarrolladores chilenos por costo accesible y compatibilidad SQL.",
    adoptionPercentage: 71,
    usedByCount: 44,
    companiesUsing: ["Wheel the World", "Fintoc", "NotCo", "Startups Start-Up Chile"],
    docUrl: "https://github.com/pgvector/pgvector",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "vllm-ollama",
    name: "vLLM & Ollama (Inferencia Local)",
    category: "Modelos & LLMs",
    description: "Motores de inferencia auto-hospedados para ejecutar modelos abiertos (Llama 3, Mistral, Qwen) en servidores locales con privacidad estricta de datos.",
    adoptionPercentage: 53,
    usedByCount: 31,
    companiesUsing: ["CENIA", "Banca Privada Chilena", "Centros Médicos"],
    docUrl: "https://vllm.ai",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "huggingface",
    name: "Hugging Face Transformers",
    category: "Orquestación & Frameworks",
    description: "Hub global de modelos y pipelines para embeddings, tokenizadores y fine-tuning de modelos en español.",
    adoptionPercentage: 79,
    usedByCount: 51,
    companiesUsing: ["CENIA", "IMFD", "NotCo", "PhageLab"],
    docUrl: "https://huggingface.co",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  },
  {
    id: "docker-kubernetes",
    name: "Docker & Kubernetes (MLOps)",
    category: "Infraestructura & MLOps",
    description: "Contenerización y despliegue elástico de servicios de inferencia con aceleración por GPU (NVIDIA Container Toolkit).",
    adoptionPercentage: 88,
    usedByCount: 62,
    companiesUsing: ["NotCo", "Fintoc", "Fracttal", "Codelco Tech", "Drivin"],
    docUrl: "https://kubernetes.io",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
  }
];

export const ECOSYSTEM_EVENTS: EcosystemEvent[] = [
  {
    id: "hackathon-clima-patagonia-2026",
    title: "Hackathon Austral: IA para Clima & Hidrógeno Verde",
    type: "Hackathon",
    organizer: "Universidad de Magallanes (UMAG) & H2V Chile",
    dateStr: "28 - 30 de Septiembre, 2026",
    status: "Próximo",
    regionId: "magallanes",
    locationName: "Punta Arenas + Formato Híbrido",
    isVirtual: true,
    prizePool: "$12,000 USD",
    participantsCount: 280,
    tags: ["Hidrógeno Verde", "Modelos Predictivos", "Viento Austral", "IoT"],
    registrationUrl: "https://umag.cl",
    registrationDeadline: "23 de Septiembre, 2026",
    daysUntilDeadline: 4,
    isRegistrationUrgent: true,
    notificationText: "⚡ Cierre inminente en 4 días: Postulación para modelación eólica y energías limpias en la Patagonia."
  },
  {
    id: "hackathon-ia-chile-2026",
    title: "Gran Hackathon Nacional de IA & Desafíos País 2026",
    type: "Hackathon",
    organizer: "Start-Up Chile, CENIA & Corfo",
    dateStr: "15 - 17 de Octubre, 2026",
    status: "Próximo",
    regionId: "metropolitana",
    locationName: "Campus San Joaquín PUC + Nodos Regionales (Valparaíso, Concepción, Antofagasta) y Online",
    isVirtual: true,
    prizePool: "$35,000 USD + Aceleración Start-Up Chile",
    participantsCount: 1200,
    tags: ["LLMs", "Agentes", "Minería", "Salud", "Sustentabilidad"],
    registrationUrl: "https://startupchile.org",
    registrationDeadline: "5 de Octubre, 2026",
    daysUntilDeadline: 6,
    isRegistrationUrgent: true,
    notificationText: "🚨 Quedan 6 días para el cierre de postulaciones: $35,000 USD en premios y aceleración oficial."
  },
  {
    id: "datathon-mining-40",
    title: "Datathon Minería 4.0: Eficiencia Hídrica & Molienda Autónoma",
    type: "Datathon",
    organizer: "Cluster Minero Antofagasta & Codelco",
    dateStr: "22 - 24 de Noviembre, 2026",
    status: "Próximo",
    regionId: "antofagasta",
    locationName: "Ruinas de Huanchaca, Antofagasta",
    isVirtual: false,
    prizePool: "$20,000 USD + Piloto en Faena",
    participantsCount: 350,
    tags: ["Computer Vision", "Time Series", "Cobre", "Edge Computing"],
    registrationUrl: "https://codelco.com",
    registrationDeadline: "10 de Noviembre, 2026",
    daysUntilDeadline: 21,
    isRegistrationUrgent: false,
    notificationText: "Convocatoria abierta: Piloto en faena de Codelco para el equipo ganador."
  },
  {
    id: "cenia-summit-latam",
    title: "Cumbre Latinoamericana de Inteligencia Artificial (CENIA Summit)",
    type: "Cumbre / Conferencia",
    organizer: "CENIA & UNESCO",
    dateStr: "3 - 5 de Diciembre, 2026",
    status: "Próximo",
    regionId: "metropolitana",
    locationName: "Centro de Extensión UC, Alameda, Santiago",
    isVirtual: true,
    participantsCount: 3000,
    tags: ["Gobernanza", "Modelos Abiertos", "Inversión", "Academia"],
    registrationUrl: "https://cenia.cl",
    registrationDeadline: "20 de Noviembre, 2026",
    daysUntilDeadline: 35,
    isRegistrationUrgent: false,
    notificationText: "Registro general habilitado para conferencias y paneles con UNESCO."
  },
  {
    id: "hackathon-biobio-robotica-2025",
    title: "Biobío AI & Robotics Challenge 2025",
    type: "Hackathon",
    organizer: "Universidad de Concepción (UdeC) & Hub Sur",
    dateStr: "Agosto 2025",
    status: "Finalizado",
    regionId: "biobio",
    locationName: "Facultad de Ingeniería UdeC, Concepción",
    isVirtual: false,
    prizePool: "$10,000,000 CLP",
    participantsCount: 450,
    tags: ["Robótica", "Detección de Fuego", "Visión Artificial"],
    winnerProject: {
      name: "SylvaGuard AI",
      description: "Dron con cámara térmica y modelo YOLOv8 edge para detección de micro-focos de incendios en plantaciones forestales.",
      team: "Equipo BioDrone UdeC"
    }
  },
  {
    id: "hackathon-fintech-cl-2025",
    title: "Hackathon Fintech & Open Finance Chile 2025",
    type: "Hackathon",
    organizer: "FintechiLe & Banco BCI",
    dateStr: "Mayo 2025",
    status: "Finalizado",
    regionId: "metropolitana",
    locationName: "Espacio BCI Labs, Las Condes",
    isVirtual: true,
    prizePool: "$15,000 USD",
    participantsCount: 680,
    tags: ["Open Banking", "Gemini API", "Scoring de Crédito"],
    winnerProject: {
      name: "PymeScore Copilot",
      description: "Agente de crédito autónomo que analiza estados de cuenta en PDF y transacciones del SII para otorgar microcréditos a PyMEs en 4 minutos.",
      team: "FinBotics Chile"
    }
  },
  {
    id: "hackathon-valparaiso-maritima-2024",
    title: "Hackathon Smart Ports Valparaíso 2024",
    type: "Hackathon",
    organizer: "EPV & Universidad Técnica Federico Santa María",
    dateStr: "Noviembre 2024",
    status: "Finalizado",
    regionId: "valparaiso",
    locationName: "Casa Central USM, Valparaíso",
    isVirtual: false,
    prizePool: "$8,000 USD",
    participantsCount: 320,
    tags: ["Logística Portuaria", "Computer Vision", "Optimización"],
    winnerProject: {
      name: "TideFlow AI",
      description: "Algoritmo de predicción de oleaje y ventanas de atraque que redujo tiempos de espera de barcos mercantes en 18%.",
      team: "USM PortLab"
    }
  }
];

export const COURSES_RESOURCES: CourseResource[] = [
  {
    id: "curso-gemini-node",
    title: "Creación de Agentes y Aplicaciones con Gemini API en TypeScript & Python",
    provider: "Chile AI Hub Academy",
    level: "Introductorio",
    duration: "4 semanas (16 hrs)",
    format: "Tutorial Paso a Paso",
    description: "Aprende a integrar modelos multimodales, Function Calling, ventanas de contexto masivas y grounding en aplicaciones web de producción.",
    skills: ["Gemini API", "TypeScript", "Prompt Engineering", "Vite / Express"],
    url: "https://ai.google.dev",
    isFree: true,
    chileRelevance: "Diseñado para desarrolladores chilenos buscando empleo rápido en startups locales que adoptan GenAI."
  },
  {
    id: "curso-rag-pgvector",
    title: "Arquitectura RAG Empresarial con PostgreSQL, pgvector y LangChain",
    provider: "Talento Digital para Chile",
    level: "Intermedio",
    duration: "6 semanas (24 hrs)",
    format: "Curso Online",
    description: "Construye bases de conocimiento inteligentes conectadas a bases de datos corporativas con indexación semántica, re-ranking y privacidad de datos.",
    skills: ["PostgreSQL", "pgvector", "LangChain", "Embeddings", "FastAPI"],
    url: "https://talentodigitalparachile.cl",
    isFree: true,
    chileRelevance: "Alta demanda en banca chilena (BCI, Santander, BancoEstado) y empresas de retail para atención a clientes."
  },
  {
    id: "curso-cv-mineria",
    title: "Computer Vision y Edge AI aplicado a Minería e Industria Pesada",
    provider: "CENIA & Universidad de Antofagasta",
    level: "Avanzado",
    duration: "8 semanas (32 hrs)",
    format: "Workshop Grabado",
    description: "Implementación de modelos YOLOv8 y segmentación semántica en hardware NVIDIA Jetson para detección de roca, seguridad minera y control de calidad.",
    skills: ["PyTorch", "YOLOv8", "OpenCV", "Edge Computing", "NVIDIA Jetson"],
    url: "https://cenia.cl",
    isFree: true,
    chileRelevance: "Especialización para los sueldos técnicos más altos del país en faenas del norte de Chile."
  },
  {
    id: "curso-marco-legal-etica",
    title: "Gobernanza, Ética y la Ley Marco de Ciberseguridad en Chile para IA",
    provider: "IMFD & Centro de Políticas Públicas UC",
    level: "Introductorio",
    duration: "2 semanas (8 hrs)",
    format: "Guía de Arquitectura",
    description: "Comprende los requisitos de la nueva Agencia Nacional de Ciberseguridad (ANCI), protección de datos personales y directrices éticas de IA en Chile.",
    skills: ["Cumplimiento Legal", "ANCI", "Ética en IA", "Gobernanza de Datos"],
    url: "https://imfd.cl",
    isFree: true,
    chileRelevance: "Indispensable para directores de tecnología, CTOs y fundadores que reciben inversión extranjera en Chile."
  }
];

export const INVESTOR_PILLARS = [
  {
    title: "#1 en Adopción de IA en América Latina",
    description: "Chile lidera el Índice Latinoamericano de Inteligencia Artificial (ILIA) elaborado por CENIA, destacando en infraestructura, talento disponible y conectividad.",
    metric: "Puntaje ILIA: 73.07",
    subtext: "Superando a Brasil, México y Colombia"
  },
  {
    title: "Incentivo Tributario Ley I+D (Corfo)",
    description: "Las empresas que invierten en I+D tecnológica en Chile pueden rebajar hasta un 35% del gasto como crédito contra el Impuesto de Primera Categoría.",
    metric: "35% Crédito Fiscal",
    subtext: "Mecanismo certificado por Corfo"
  },
  {
    title: "Infraestructura de Datos & Energía Verde",
    description: "Más de 32 centros de datos instalados y en desarrollo (Google, Microsoft, AWS, Huawei) impulsados por energía solar de costo marginal cercano a cero en Atacama.",
    metric: "32+ Data Centers",
    subtext: "Conectados con el Cable Humboldt transpacífico"
  },
  {
    title: "Start-Up Chile & Ecosistema de Capital de Riesgo",
    description: "Aceleradora pública pionera mundial con más de 2.000 startups apoyadas, red activa de fondos de VC y facilidades de visa para talento tecnológico global.",
    metric: "$850M+ USD",
    subtext: "Levantados por startups tecnológicas chilenas"
  }
];

export const WEBMCP_COMPANIES: WebMcpCompany[] = [
  {
    id: "webmcp-notco",
    name: "The Not Company (NotCo)",
    sector: "Biotech & Agro",
    regionId: "metropolitana",
    city: "Santiago",
    status: "En Producción",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "Gemini Function Calling Tools",
      "OpenAI Agents SDK"
    ],
    tagline: "Endpoints WebMCP para diseño molecular y formulación asistida por agentes autónomos",
    description: "Expone la biblioteca molecular de ingredientes vegetales de Giuseppe a través de herramientas WebMCP estandarizadas, permitiendo a agentes de I+D de alimentos consultar sustitutos biológicos en segundos.",
    useCase: "Agentes autónomos de laboratorios y proveedores de alimentos en USA y Europa consultan compatibilidad molecular, alérgenos y costos de materias primas vegetales.",
    endpointUrl: "https://api.notco.com/webmcp/v1",
    monthlyAgentRequests: "1.450.000 llamadas/mes",
    latencyAvgMs: 82,
    exposedToolsCount: 4,
    businessImpact: "Reducción del 70% en tiempo de homologación de recetas con agentes de multinacionales como Kraft Heinz y Starbucks.",
    contactLeadEmail: "enterprise-agents@notco.com",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "NotCo Giuseppe Agent Toolkit",
      description: "Model Context Protocol tools for plant-based food formulation and molecular profiling",
      endpoint: "https://api.notco.com/webmcp/v1",
      authentication: { type: "bearer_token", provider: "NotCo OAuth 2.1" },
      tools: [
        {
          name: "query_ingredient_substitutes",
          description: "Busca análogos moleculares vegetales para proteínas lácteas, grasas o emulsionantes.",
          input_schema: {
            type: "object",
            properties: {
              target_molecule: { type: "string", example: "casein_protein" },
              flavor_target: { type: "string", example: "neutral_dairy" },
              max_cost_per_kg_usd: { type: "number", example: 4.5 }
            },
            required: ["target_molecule"]
          }
        },
        {
          name: "simulate_sensory_taste_score",
          description: "Evalúa cómo un agente o humano percibirá la textura y palatabilidad de la mezcla vegetal.",
          input_schema: {
            type: "object",
            properties: {
              formula_components: { type: "array", items: { type: "string" } }
            },
            required: ["formula_components"]
          }
        }
      ]
    },
    tools: [
      {
        name: "query_ingredient_substitutes",
        description: "Busca análogos moleculares vegetales para proteínas lácteas o cárnicas considerando costo y textura.",
        category: "Consulta",
        parametersSchema: {
          target_compound: "string (ej: caseína, grasa láctea)",
          clean_label_only: "boolean",
          target_ph: "number"
        },
        sampleResponse: {
          match: "Proteína concentrada de arveja texturizada + Aceite de coco virgen desodorizado",
          sensory_similarity: 0.94,
          certified_allergens_free: true
        }
      },
      {
        name: "simulate_sensory_taste_score",
        description: "Predice la curva de liberación de sabor y sensación cremosa en boca.",
        category: "Automatización",
        parametersSchema: {
          ingredients_list: "string[]",
          temperature_celsius: "number"
        },
        sampleResponse: {
          mouthfeel_score: 9.1,
          aroma_notes: ["cereal_suave", "crema_fresca"],
          stability_months: 12
        }
      },
      {
        name: "check_supplier_batch_cert",
        description: "Consulta stock en tiempo real y certificación de trazabilidad de lotes de granos en Chile y Argentina.",
        category: "Consulta",
        parametersSchema: {
          batch_id: "string",
          region: "CL | AR | US"
        },
        sampleResponse: {
          available_kg: 24000,
          organic_certified: true,
          warehouse: "San Bernardo, RM"
        }
      }
    ]
  },
  {
    id: "webmcp-fintual",
    name: "Fintual",
    sector: "Fintech & Banca",
    regionId: "metropolitana",
    city: "Santiago",
    status: "En Producción",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "OpenAI Agents SDK",
      "Gemini Function Calling Tools"
    ],
    tagline: "Herramientas WebMCP para agentes de planificación financiera y simulación tributaria APV",
    description: "Habilita a agentes autónomos personales y asistentes de banca privada a consultar rentabilidades auditadas de fondos CMF, simular beneficios tributarios (Art. 54 Bis / Régimen A y B) y formular portafolios de inversión recomendados.",
    useCase: "Agentes como Claude Desktop o GPT Assistants calculan la pensión óptima de usuarios chilenos y ejecutan proyecciones patrimoniales.",
    endpointUrl: "https://api.fintual.cl/webmcp/v1",
    monthlyAgentRequests: "2.180.000 llamadas/mes",
    latencyAvgMs: 46,
    exposedToolsCount: 4,
    businessImpact: "Aumento del 34% en aperturas de cuentas de ahorro asistidas directamente por agentes de IA autónomos.",
    contactLeadEmail: "dev-agents@fintual.com",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Fintual Open Financial Agent API",
      endpoint: "https://api.fintual.cl/webmcp/v1",
      tools: [
        {
          name: "simulate_apv_tax_rebate",
          description: "Calcula el ahorro tributario fiscal chileno para aportes en APV Régimen A o B.",
          input_schema: {
            type: "object",
            properties: {
              monthly_income_clp: { type: "number" },
              planned_contribution_clp: { type: "number" },
              regime: { type: "string", enum: ["A", "B"] }
            }
          }
        }
      ]
    },
    tools: [
      {
        name: "simulate_apv_tax_rebate",
        description: "Calcula el beneficio fiscal según el tramo de impuesto global complementario en Chile.",
        category: "Consulta",
        parametersSchema: {
          sueldo_bruto_mensual: "number (CLP)",
          monto_apv_anual: "number (CLP)",
          regimen: "A | B"
        },
        sampleResponse: {
          bonificacion_estatal_15_pct: "$180.000 CLP",
          devolucion_impuesto_estimada: "$740.000 CLP",
          recomendacion_optima: "Régimen B (Sueldo sobre tramo exento)"
        }
      },
      {
        name: "query_portfolio_risk_metrics",
        description: "Retorna volatilidad histórica, ratio de Sharpe y tenencias de los fondos Risky Norris, Moderate Pitt, Conservative Clooney y Streep.",
        category: "Consulta",
        parametersSchema: {
          fund_name: "risky_norris | moderate_pitt | conservative_clooney | conservative_streep"
        },
        sampleResponse: {
          annualized_return_3y: "14.2% CLP",
          top_assets: ["S&P 500 ETF", "Global Bonds", "Depósitos a Plazo"],
          cmf_registration: "Fondo Mutuo Regulado CMF Chile"
        }
      },
      {
        name: "quote_goal_timeline",
        description: "Calcula la probabilidad de alcanzar un objetivo financiero (ej: pie de casa o viaje) en N meses.",
        category: "Transaccional",
        parametersSchema: {
          target_amount_clp: "number",
          initial_capital_clp: "number",
          monthly_deposit_clp: "number"
        },
        sampleResponse: {
          months_to_goal: 38,
          confidence_interval_90: "34 a 42 meses",
          risk_profile: "Moderado"
        }
      }
    ]
  },
  {
    id: "webmcp-buk",
    name: "Buk Chile",
    sector: "GovTech & Legal",
    regionId: "metropolitana",
    city: "Santiago",
    status: "En Producción",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "Gemini Function Calling Tools",
      "LangGraph / CrewAI Agent"
    ],
    tagline: "Infraestructura WebMCP para agentes de recursos humanos y cálculo de remuneraciones según Código del Trabajo",
    description: "Permite a agentes de RRHH consultar saldos legales de vacaciones, calcular liquidaciones de sueldo con topes imponibles de AFP e Isapre actualizados y automatizar solicitudes de permisos laborales.",
    useCase: "Agentes internos de más de 4.000 empresas en Chile responden dudas de colaboradores sobre finiquitos, contratos y certificados laborales 24/7.",
    endpointUrl: "https://api.buk.cl/webmcp/v2",
    monthlyAgentRequests: "3.200.000 llamadas/mes",
    latencyAvgMs: 64,
    exposedToolsCount: 5,
    businessImpact: "Ahorro de 12.000 horas al mes en mesas de ayuda de RRHH corporativo en Chile, Perú y Colombia.",
    contactLeadEmail: "agents@buk.cl",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Buk Agent HR Protocol",
      endpoint: "https://api.buk.cl/webmcp/v2",
      tools: [
        {
          name: "generate_employee_liquidation_preview",
          description: "Genera desglose de liquidación de sueldo cumpliendo normativa chilena (AFP, FONASA/Isapre, AFC, Seguro Cesantía).",
          input_schema: {
            type: "object",
            properties: {
              employee_id: { type: "string" },
              month: { type: "string", example: "2026-03" }
            }
          }
        }
      ]
    },
    tools: [
      {
        name: "generate_employee_liquidation_preview",
        description: "Calcula haberes imponibles, descuentos legales de salud, previsión y gratificación legal mensual.",
        category: "Automatización",
        parametersSchema: {
          employee_rut: "string",
          periodo: "YYYY-MM"
        },
        sampleResponse: {
          sueldo_base: "$1.800.000 CLP",
          gratificacion_legal: "$198.500 CLP",
          descuento_afp: "$228.420 CLP (AFP Habitat 11.27%)",
          liquido_a_pago: "$1.482.100 CLP"
        }
      },
      {
        name: "calculate_legal_vacation_balance",
        description: "Calcula días hábiles de feriado anual acumulados y vacaciones progresivas según antigüedad laboral.",
        category: "Consulta",
        parametersSchema: {
          employee_id: "string"
        },
        sampleResponse: {
          dias_disponibles: 18.5,
          dias_progresivos: 2.0,
          proximo_periodo_vence: "2026-12-31"
        }
      },
      {
        name: "request_leave_permit_agent",
        description: "Envía una solicitud de permiso administrativo o médico validando política de la compañía.",
        category: "Agendamiento",
        parametersSchema: {
          employee_id: "string",
          motivo: "string",
          fecha_inicio: "YYYY-MM-DD",
          dias: "number"
        },
        sampleResponse: {
          solicitud_id: "SOL-8921",
          estado: "Aprobado_Automatico_Politica",
          notificado_jefatura: true
        }
      }
    ]
  },
  {
    id: "webmcp-codelcotech",
    name: "Codelco Tech & Minería 4.0",
    sector: "Minería & Energía",
    regionId: "antofagasta",
    city: "Calama & Antofagasta",
    status: "Piloto Activo",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "Gemini Function Calling Tools"
    ],
    tagline: "Protocolo WebMCP para agentes de telemetría minera pesada, flotación y mantenimiento autónomo",
    description: "Expone telemetría segura en tiempo real de correas transportadoras, molinos SAG y camiones de extracción autónomos (AHS) a agentes supervisores de operaciones mineras.",
    useCase: "Agentes supervisores de turno en el CIO (Centro Integrado de Operaciones) en Santiago detectan cuellos de botella en faenas de Chuquicamata y El Teniente.",
    endpointUrl: "https://api.codelco.cl/webmcp/industrial",
    monthlyAgentRequests: "890.000 llamadas/mes",
    latencyAvgMs: 38,
    exposedToolsCount: 4,
    businessImpact: "Prevención de 4 paradas no programadas en molinos SAG en 2025-2026, con ahorro estimado en $18M USD.",
    contactLeadEmail: "transformacion-agentes@codelco.cl",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Codelco Industrial Agent Ops",
      endpoint: "https://api.codelco.cl/webmcp/industrial",
      tools: [
        {
          name: "query_flotation_ore_grade",
          description: "Consulta ley de mineral (cobre soluble/insoluble) en celdas de flotación primaria.",
          input_schema: {
            type: "object",
            properties: {
              division: { type: "string", enum: ["chuquicamata", "radomiro_tomic", "el_teniente"] },
              line_id: { type: "string" }
            }
          }
        }
      ]
    },
    tools: [
      {
        name: "query_flotation_ore_grade",
        description: "Obtiene ley de cobre de alimentación y colas procesada con visión por computadora infrarroja.",
        category: "Consulta",
        parametersSchema: {
          faena: "chuquicamata | el_teniente | andina",
          banco_celdas: "string"
        },
        sampleResponse: {
          ley_alimentacion_cu: "0.89%",
          recuperacion_instantanea: "88.4%",
          dosificacion_espumante_optima_ml_min: 145
        }
      },
      {
        name: "dispatch_predictive_maintenance_ticket",
        description: "Genera orden de trabajo SAP PM cuando un sensor de vibración sobrepasa la envolvente crítica de falla de rodamiento.",
        category: "Transaccional",
        parametersSchema: {
          equipo_id: "string",
          criticidad: "Alta | Media",
          anomalia_detectada: "string"
        },
        sampleResponse: {
          orden_sap_pm: "PM-2026-90412",
          tecnico_cuadrilla_asignado: "Turno A - Chancado Secundario",
          ventana_mantenimiento_horas: 18
        }
      },
      {
        name: "check_tailings_dam_sensor_alerts",
        description: "Inspecciona piezómetros y acelerómetros de estabilidad física del tranque de relaves.",
        category: "Consulta",
        parametersSchema: {
          tranque_id: "string"
        },
        sampleResponse: {
          factor_seguridad_estatico: 1.62,
          nivel_freatico_metros: 14.8,
          estado_normativo_sernageomin: "Cumplimiento Verde"
        }
      }
    ]
  },
  {
    id: "webmcp-klap",
    name: "Klap Payments",
    sector: "Retail & E-commerce",
    regionId: "metropolitana",
    city: "Santiago",
    status: "En Producción",
    compatibleProtocols: [
      "Browser-Use / Agentic Web",
      "OpenAI Agents SDK",
      "Model Context Protocol (MCP / Anthropic)"
    ],
    tagline: "Protocolo WebMCP para transacciones de comercio autónomo y checkout ejecutado por agentes de IA",
    description: "Permite a agentes de compra autónomos (browser agents y asistentes de voz) cotizar pasarelas, verificar el RUT chileno de un comercio y autorizar transacciones con tokens de sesión agéntica controlados.",
    useCase: "Agentes personales de compradores autorizados realizan compras de repuestos industriales y suministros de oficina sin intervención humana.",
    endpointUrl: "https://api.klap.cl/webmcp/pos",
    monthlyAgentRequests: "4.800.000 llamadas/mes",
    latencyAvgMs: 52,
    exposedToolsCount: 4,
    businessImpact: "Primer procesador de pagos en Chile con certificación internacional de pagos agénticos seguros.",
    contactLeadEmail: "agentic-commerce@klap.cl",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Klap Agentic Commerce Protocol",
      endpoint: "https://api.klap.cl/webmcp/pos",
      tools: [
        {
          name: "execute_agentic_checkout_token",
          description: "Genera token de pago criptográfico de un solo uso para que un agente complete la compra.",
          input_schema: {
            type: "object",
            properties: {
              merchant_id: { type: "string" },
              amount_clp: { type: "number" },
              agent_approval_sig: { type: "string" }
            }
          }
        }
      ]
    },
    tools: [
      {
        name: "execute_agentic_checkout_token",
        description: "Valida la billetera del agente y emite un voucher digital timbrado por el SII en Chile.",
        category: "Transaccional",
        parametersSchema: {
          monto_clp: "number",
          comercio_rut: "string",
          token_autorizacion_agente: "string"
        },
        sampleResponse: {
          estado: "Aprobada",
          codigo_autorizacion: "KLP-77491",
          boleta_sii_folio: "1849204"
        }
      },
      {
        name: "verify_merchant_rut_chile",
        description: "Verifica si el comercio emisor está registrado y con actividades vigentes ante el SII.",
        category: "Consulta",
        parametersSchema: {
          rut_chile: "string"
        },
        sampleResponse: {
          razon_social: "Comercializadora SpA",
          valido: true,
          giro_principal: "Venta al por menor de artículos de ferretería"
        }
      }
    ]
  },
  {
    id: "webmcp-kilimo",
    name: "Kilimo Chile",
    sector: "Biotech & Agro",
    regionId: "maule",
    city: "Talca & Curicó",
    status: "En Producción",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "LangGraph / CrewAI Agent"
    ],
    tagline: "Protocolo WebMCP para agentes agrónomos autónomos y gobernanza de cuencas hídricas",
    description: "Permite a agentes de gestión agrícola consultar balances de humedad del suelo vía satélite, programar compuertas de riego inteligente y reportar huella hídrica certificada en el Valle Central de Chile.",
    useCase: "Agentes de fundos de cerezas, viñas y arándanos en Maule y O'Higgins optimizan el agua de riego en función del pronóstico de ola de calor.",
    endpointUrl: "https://api.kilimo.com/webmcp/irrigation",
    monthlyAgentRequests: "620.000 llamadas/mes",
    latencyAvgMs: 74,
    exposedToolsCount: 4,
    businessImpact: "Ahorro acumulado de más de 8.000 millones de litros de agua en la cuenca del Río Maule en las últimas 2 temporadas.",
    contactLeadEmail: "agtech-agents@kilimo.com",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Kilimo Smart Water Protocol",
      endpoint: "https://api.kilimo.com/webmcp/irrigation",
      tools: [
        {
          name: "calculate_evapotranspiration_soil_deficit",
          description: "Calcula milímetros de agua requeridos por hectárea de cultivo según fenología y clima.",
          input_schema: {
            type: "object",
            properties: {
              cuartel_id: { type: "string" },
              cultivo: { type: "string", example: "cerezo_lapins" }
            }
          }
        }
      ]
    },
    tools: [
      {
        name: "calculate_evapotranspiration_soil_deficit",
        description: "Cruza NDVI satelital Sentinel-2 con estaciones meteorológicas de la Dirección Meteorológica de Chile.",
        category: "Consulta",
        parametersSchema: {
          cuartel_id: "string",
          tipo_riego: "goteo | aspersion | surco"
        },
        sampleResponse: {
          requerimiento_mm_dia: 4.8,
          horas_riego_recomendadas: 3.5,
          humedad_estrato_40cm: "68% de capacidad de campo"
        }
      },
      {
        name: "schedule_irrigation_pump_hours",
        description: "Envía consignas horarias de encendido de bombas en horarios de tarifa eléctrica fuera de punta.",
        category: "Automatización",
        parametersSchema: {
          bomba_id: "string",
          inicio_hora: "HH:mm",
          duracion_minutos: "number"
        },
        sampleResponse: {
          programacion_id: "PRG-3391",
          ahorro_tarifa_electrica_pct: 28.5,
          confirmacion_telemetria: "OK"
        }
      }
    ]
  },
  {
    id: "webmcp-betterfly",
    name: "Betterfly",
    sector: "Salud & MedTech",
    regionId: "metropolitana",
    city: "Santiago",
    status: "Piloto Activo",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "Gemini Function Calling Tools"
    ],
    tagline: "Herramientas WebMCP para agentes de bienestar corporativo, telemedicina y donaciones de impacto",
    description: "Permite que agentes de bienestar personal consulten disponibilidad de psicólogos y nutricionistas, coticen pólizas dinámicas de vida y verifiquen donaciones comunitarias por hábitos saludables.",
    useCase: "Agentes autónomos de colaboradores integrados a Slack y Teams sugieren pausas activas y coordinan sesiones médicas inmediatas.",
    endpointUrl: "https://api.betterfly.com/webmcp/v1",
    monthlyAgentRequests: "1.120.000 llamadas/mes",
    latencyAvgMs: 58,
    exposedToolsCount: 3,
    businessImpact: "Tasa de agendamiento de telemedicina preventiva triplicada mediante interacciones conversacionales de agentes.",
    contactLeadEmail: "partners@betterfly.com",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Betterfly Wellness Protocol",
      endpoint: "https://api.betterfly.com/webmcp/v1",
      tools: []
    },
    tools: [
      {
        name: "query_telemed_doctor_availability",
        description: "Encuentra médicos generales y especialistas en salud mental con slots disponibles en menos de 1 hora.",
        category: "Consulta",
        parametersSchema: {
          especialidad: "Medicina General | Psicología | Nutrición",
          idioma: "Español | Portugués | Inglés"
        },
        sampleResponse: {
          disponible_en_minutos: 15,
          profesional_nombre: "Dra. Macarena Vial (Registro Colmed)",
          modalidad: "Videollamada encriptada HIPAA"
        }
      },
      {
        name: "quote_dynamic_life_insurance",
        description: "Calcula cobertura asegurada incrementada por pasos y actividad física certificada.",
        category: "Consulta",
        parametersSchema: {
          user_id: "string"
        },
        sampleResponse: {
          cobertura_actual_uf: 1250,
          incremento_mes_uf: 45,
          arboles_donados_fundacion: 12
        }
      }
    ]
  },
  {
    id: "webmcp-kurabiotech",
    name: "Kura Biotech",
    sector: "Biotech & Agro",
    regionId: "loslagos",
    city: "Puerto Varas",
    status: "Piloto Activo",
    compatibleProtocols: [
      "Model Context Protocol (MCP / Anthropic)",
      "Gemini Function Calling Tools"
    ],
    tagline: "Protocolo WebMCP para enzimas diagnósticas y biotecnología aplicada a la salmonicultura",
    description: "Conecta agentes de laboratorio a la base de datos enzimática de patógenos acuícolas (SRS, Caligus, BKD) para detección temprana en centros de cultivo en fiordos patagónicos.",
    useCase: "Agentes de bioseguridad en plantas salmoneras monitorean resultados PCR y ordenan kits enzimáticos automáticamente.",
    endpointUrl: "https://api.kurabiotech.com/webmcp/enzymes",
    monthlyAgentRequests: "340.000 llamadas/mes",
    latencyAvgMs: 65,
    exposedToolsCount: 3,
    businessImpact: "Detección 48 horas antes de brotes infecciosos en jaulas marinas, reduciendo uso preventivo de antibióticos.",
    contactLeadEmail: "bio-agents@kurabiotech.com",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Kura Biotech Enzymatic MCP",
      endpoint: "https://api.kurabiotech.com/webmcp/enzymes",
      tools: []
    },
    tools: [
      {
        name: "match_salmon_pathogen_panel",
        description: "Compara secuencia genética detectada contra el banco de cepas bacterianas patagónicas.",
        category: "Consulta",
        parametersSchema: {
          secuencia_target: "string",
          temperatura_mar: "number"
        },
        sampleResponse: {
          patogeno_identificado: "Piscirickettsia salmonis Cepa EM-90",
          sensibilidad_diagnostica: "99.2%",
          tiempo_reaccion_enzimatica_minutos: 22
        }
      }
    ]
  },
  {
    id: "webmcp-auster",
    name: "Auster Robotics & AI",
    sector: "Logística & Transporte",
    regionId: "biobio",
    city: "Concepción",
    status: "Sandbox / Homologación",
    compatibleProtocols: [
      "LangGraph / CrewAI Agent",
      "Model Context Protocol (MCP / Anthropic)"
    ],
    tagline: "WebMCP para drones autónomos e inspección de activos portuarios y forestales",
    description: "Permite a agentes de logística portuaria y forestal desplegar misiones autónomas de drones para cálculo volumétrico de astillas y celulosa con LiDAR.",
    useCase: "Agentes de despacho en puertos de Coronel y San Vicente coordinan inspecciones sin operadores en terreno.",
    endpointUrl: "https://api.auster.cl/webmcp/fleet",
    monthlyAgentRequests: "190.000 llamadas/mes",
    latencyAvgMs: 44,
    exposedToolsCount: 3,
    businessImpact: "Cálculo volumétrico de patios de acopio 10 veces más rápido con precisión del 99.4%.",
    contactLeadEmail: "robotic-agents@auster.cl",
    manifestJson: {
      schema_version: "webmcp-v1",
      name: "Auster Robotics Drone Protocol",
      endpoint: "https://api.auster.cl/webmcp/fleet",
      tools: []
    },
    tools: [
      {
        name: "inspect_cellulose_roll_defect_map",
        description: "Mapea anomalías térmicas o deformaciones en bodegas de celulosa.",
        category: "Automatización",
        parametersSchema: {
          bodega_id: "string",
          drone_id: "string"
        },
        sampleResponse: {
          mision_completada: true,
          rollos_escaneados: 420,
          defectos_criticos: 0
        }
      }
    ]
  }
];

export const WEBMCP_SERVICES: WebMcpServicePackage[] = [
  {
    id: "pack-starter",
    name: "Starter WebMCP",
    badge: "Paso Inicial Rápido",
    priceCLP: "$1.200.000 CLP",
    priceUSD: "$1.250 USD",
    targetAudience: "PyMEs, startups y empresas de e-commerce que quieren exponer sus primeros servicios a agentes de IA.",
    timeline: "2 semanas de entrega",
    features: [
      "Auditoría rápida de tus APIs o base de datos actual",
      "Diseño de arquitectura de hasta 3 herramientas WebMCP seguras",
      "Generación y entrega del archivo webmcp.json certificado",
      "Validación de compatibilidad con Claude Desktop, Gemini y OpenAI",
      "8 horas de taller técnico para tus desarrolladores",
      "Garantía de funcionamiento con agentes autónomos"
    ]
  },
  {
    id: "pack-scale",
    name: "Scale Agent-Ready",
    badge: "Más Demandado",
    priceCLP: "$3.500.000 CLP",
    priceUSD: "$3.700 USD",
    targetAudience: "Empresas medianas, fintechs, retail y empresas B2B con sistemas existentes que necesitan vender o atender a través de agentes.",
    timeline: "4 semanas de entrega",
    recommended: true,
    features: [
      "Adaptación completa de APIs REST / GraphQL a especificación WebMCP",
      "Hasta 10 herramientas WebMCP (consultas, transacciones y agendamiento)",
      "Autenticación granular y sandboxing para agentes de IA (OAuth 2.1 / API Keys)",
      "Suite de pruebas y benchmarks con agentes de última generación",
      "Despliegue de endpoints en Cloud (Cloud Run / AWS) con latencia <100ms",
      "Certificado 'Empresa WebMCP Verificada' para el Radar de Chile",
      "3 meses de soporte técnico, monitoreo y actualización de schemas"
    ]
  },
  {
    id: "pack-enterprise",
    name: "Enterprise Autonomous Architecture",
    badge: "Corporativo & Minería",
    priceCLP: "$7.800.000 CLP",
    priceUSD: "$8.200 USD",
    targetAudience: "Grandes corporaciones, bancos, mineras y cadenas de retail que requieren flujos multi-agente complejos y alta seguridad.",
    timeline: "8 semanas de entrega",
    features: [
      "Arquitectura multi-agente personalizada (Orquestación LangGraph / MCP corporativo)",
      "Herramientas WebMCP ilimitadas con conexión a SAP, Salesforce o ERP legacy",
      "Seguridad de nivel bancario, encriptación mTLS y protección anti-prompt injection",
      "Testing de carga masiva (simulación de miles de agentes concurrentes)",
      "Capacitación ejecutiva a gerencias y programa de adopción interna",
      "SLA 99.9% de uptime garantizado con observabilidad 24/7",
      "Gobernanza ética y cumplimiento Ley Marco de Ciberseguridad de Chile"
    ]
  }
];

