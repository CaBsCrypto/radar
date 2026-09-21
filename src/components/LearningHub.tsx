import React, { useState } from 'react';
import { CourseResource } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Code, 
  FileText, 
  Video,
  PlayCircle
} from 'lucide-react';

interface LearningHubProps {
  courses: CourseResource[];
  onExploreTechStack: () => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  courses,
  onExploreTechStack
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedCourseModal, setSelectedCourseModal] = useState<CourseResource | null>(null);

  const levels = ['Todos', 'Introductorio', 'Intermedio', 'Avanzado'];

  const filteredCourses = courses.filter(c => {
    if (selectedLevel === 'Todos') return true;
    return c.level === selectedLevel;
  });

  const getFormatIcon = (format: CourseResource['format']) => {
    switch (format) {
      case 'Tutorial Paso a Paso':
        return <Code className="w-3.5 h-3.5 text-blue-400" />;
      case 'Curso Online':
        return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Workshop Grabado':
        return <PlayCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Guía de Arquitectura':
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getLevelBadge = (level: CourseResource['level']) => {
    switch (level) {
      case 'Introductorio':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Intermedio':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Avanzado':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Academia & Formación Continua de IA
              </span>
              <span className="text-xs text-slate-400">
                Aprende las herramientas demandadas por las empresas chilenas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] mt-1">
              Tutoriales, Cursos y Rutas de Aprendizaje para Desarrolladores
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Preparamos contenidos y guías prácticas adaptadas al ecosistema nacional: desde creación de agentes con Gemini hasta modelos industriales para minería y cumplimiento legal.
            </p>
          </div>

          <button
            onClick={onExploreTechStack}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer self-start md:self-auto"
          >
            <span>Ver Radar de Herramientas</span>
          </button>
        </div>

        {/* Level Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs">
          <span className="text-slate-400 mr-1">Nivel:</span>
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCourses.map(course => {
          return (
            <div
              key={course.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {getFormatIcon(course.format)}
                    <span>{course.format}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {course.duration}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getLevelBadge(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white font-['Outfit'] mt-2.5">
                  {course.title}
                </h3>

                <div className="text-xs text-indigo-400 font-medium mt-1">
                  Dictado por: {course.provider}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Relevance for Chile */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Impacto en el mercado laboral chileno:
                  </span>
                  <span className="text-slate-400">{course.chileRelevance}</span>
                </div>

                {/* Skills tags */}
                <div className="mt-3.5 flex flex-wrap gap-1">
                  {course.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-900/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  {course.isFree ? 'Acceso Gratuito & Abierto' : 'Con Beca Corfo'}
                </span>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Iniciar Tutorial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
