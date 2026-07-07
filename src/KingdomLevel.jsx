/**
 * KINGDOM LEVEL
 * -----------------------------------------------------------------------
 * Plataforma de estudio estilo Platzi, con identidad propia de "reino".
 *
 * NAVEGACIÓN: no usa react-router. Es un router interno hecho con useState
 * (view: 'home' | 'course' | 'class'). Al hacer clic en un curso o clase,
 * la pantalla anterior desaparece por completo y se muestra la nueva vista
 * dentro del mismo sitio: nunca se abre una pestaña nueva ni se redirige
 * a YouTube/Google. El video de YouTube se reproduce embebido con <iframe>
 * usando el modo "embed" de YouTube, así el estudiante nunca sale del sitio.
 *
 * CÓMO AGREGAR TUS PROPIOS CURSOS Y VIDEOS:
 * 1. Ve al arreglo `courseData` más abajo.
 * 2. Cada curso es un objeto con: id, title, tagline, description, color,
 *    icon, instructor y un arreglo `classes`.
 * 3. Cada clase tiene: id, title, duration, description y videoId.
 *    El `videoId` es la parte del link de YouTube después de "watch?v=".
 *    Ejemplo: en https://www.youtube.com/watch?v=jNQXAC9IVRw
 *    el videoId es "jNQXAC9IVRw".
 * 4. Ahora mismo todas las clases usan un videoId de demostración
 *    ("jNQXAC9IVRw") solo para que puedas ver que el reproductor funciona.
 *    Reemplázalo por el ID real de cada video que subas a tu canal.
 *
 * SI QUIERES ESTO COMO SITIO REAL CON URLs PROPIAS (ej. /curso/redes):
 * este archivo ya está listo para conectarse a React Router: cada "view"
 * (home/course/class) puede convertirse en una <Route> sin cambiar el
 * diseño ni la lógica interna.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import {
  Crown,
  Code2,
  GitBranch,
  Database,
  Boxes,
  Network,
  ShieldCheck,
  ChevronLeft,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  GraduationCap,
  Trophy,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------- TOKENS -------------------------------- */

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

const C = {
  bg: '#0A0C10',
  surface: '#141821',
  border: '#242A36',
  gold: '#D8A657',
  goldBright: '#F0C879',
  emerald: '#5FAE82',
  text: '#ECE6D9',
  muted: '#8B93A1',
  mutedDim: '#5C6472',
};

function darken(hex, amount = 0.35) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

/* ------------------------------ CONTENIDO ------------------------------- */
/* Reemplaza el contenido de este arreglo con tus propios cursos y clases. */

const DEMO_VIDEO_ID = 'jNQXAC9IVRw'; // ← reemplaza esto por tus videos reales

const courseData = [
  {
    id: 'fundamentos',
    title: 'Fundamentos de Programación',
    tagline: 'La primera piedra de tu castillo',
    description:
      'Domina la lógica, las variables y las estructuras de control que sostienen cualquier lenguaje de programación.',
    color: C.gold,
    icon: Code2,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Introducción a la lógica de programación', duration: '12:30', description: 'Qué es un algoritmo y cómo aprender a pensar como una computadora.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'Variables, tipos de datos y operadores', duration: '15:10', description: 'Cómo se guarda y manipula la información dentro de un programa.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Estructuras de control: condicionales', duration: '14:45', description: 'Cómo tomar decisiones dentro de un programa con if, else y switch.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Estructuras de control: bucles', duration: '16:20', description: 'Repetir tareas de forma eficiente con for, while y do-while.', videoId: DEMO_VIDEO_ID },
      { id: 5, title: 'Funciones y modularización', duration: '13:55', description: 'Cómo dividir un programa en piezas reutilizables y fáciles de mantener.', videoId: DEMO_VIDEO_ID },
    ],
  },
  {
    id: 'estructuras',
    title: 'Estructuras de Datos y Algoritmos',
    tagline: 'El mapa para moverte por el reino de los datos',
    description:
      'Aprende a organizar y recorrer la información de forma eficiente: la habilidad que distingue a un buen ingeniero.',
    color: '#5B8DBF',
    icon: GitBranch,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Arrays y listas enlazadas', duration: '14:00', description: 'Las dos formas más básicas de almacenar colecciones de datos en memoria.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'Pilas y colas', duration: '12:40', description: 'Estructuras LIFO y FIFO y sus aplicaciones en el mundo real.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Árboles binarios', duration: '17:15', description: 'Cómo organizar datos jerárquicamente para búsquedas más rápidas.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Algoritmos de ordenamiento', duration: '18:30', description: 'Bubble sort, merge sort y quick sort explicados paso a paso.', videoId: DEMO_VIDEO_ID },
      { id: 5, title: 'Complejidad algorítmica (Big O)', duration: '15:50', description: 'Cómo medir qué tan rápido o lento es realmente tu código.', videoId: DEMO_VIDEO_ID },
    ],
  },
  {
    id: 'basesdedatos',
    title: 'Bases de Datos',
    tagline: 'Donde el reino guarda su tesoro de información',
    description: 'Diseña, consulta y optimiza bases de datos relacionales como se hace en la industria.',
    color: C.emerald,
    icon: Database,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Modelo entidad-relación', duration: '13:20', description: 'Cómo traducir un problema del mundo real en tablas y relaciones.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'SQL: consultas básicas', duration: '16:05', description: 'SELECT, WHERE, ORDER BY y los cimientos de todo lenguaje SQL.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Normalización de bases de datos', duration: '14:50', description: 'Cómo evitar datos duplicados e inconsistentes en tu diseño.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Joins y subconsultas', duration: '17:40', description: 'Cómo combinar información de varias tablas en una sola consulta.', videoId: DEMO_VIDEO_ID },
      { id: 5, title: 'Índices y optimización', duration: '15:15', description: 'Técnicas para que tus consultas no se vuelvan lentas cuando la base crece.', videoId: DEMO_VIDEO_ID },
    ],
  },
  {
    id: 'poo',
    title: 'Programación Orientada a Objetos',
    tagline: 'Construye tu software como piezas de un ejército',
    description: 'Piensa en objetos, clases y relaciones para escribir software más ordenado y escalable.',
    color: '#9B7FC7',
    icon: Boxes,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Clases y objetos', duration: '13:10', description: 'El vocabulario básico de la programación orientada a objetos.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'Herencia y polimorfismo', duration: '16:35', description: 'Cómo reutilizar y especializar comportamiento entre clases.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Encapsulamiento y abstracción', duration: '14:20', description: 'Cómo proteger y simplificar el uso de tus propias clases.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Patrones de diseño básicos', duration: '18:00', description: 'Soluciones probadas a problemas comunes del diseño de software.', videoId: DEMO_VIDEO_ID },
    ],
  },
  {
    id: 'redes',
    title: 'Redes de Computadoras',
    tagline: 'Las rutas comerciales que conectan al reino',
    description: 'Entiende cómo viajan los datos por internet, desde tu computadora hasta cualquier parte del mundo.',
    color: '#C1683F',
    icon: Network,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Modelo OSI y TCP/IP', duration: '15:00', description: 'Las capas que hacen posible la comunicación entre dispositivos.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'Direccionamiento IP y subredes', duration: '17:25', description: 'Cómo se organizan y dividen las direcciones en una red.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Protocolos de aplicación (HTTP, DNS, FTP)', duration: '14:10', description: 'Los protocolos que usas todos los días sin darte cuenta.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Seguridad básica en redes', duration: '16:45', description: 'Firewalls, cifrado y buenas prácticas para proteger una red.', videoId: DEMO_VIDEO_ID },
    ],
  },
  {
    id: 'ingsoftware',
    title: 'Ingeniería de Software',
    tagline: 'Las leyes que ordenan la construcción del reino',
    description: 'Aprende a planear, documentar y entregar software de forma profesional, no solo a programar.',
    color: '#B5495B',
    icon: ShieldCheck,
    instructor: 'Tu nombre aquí',
    classes: [
      { id: 1, title: 'Ciclo de vida del software', duration: '13:40', description: 'Las etapas por las que pasa todo proyecto, del análisis al mantenimiento.', videoId: DEMO_VIDEO_ID },
      { id: 2, title: 'Metodologías ágiles (Scrum)', duration: '16:15', description: 'Cómo organizar equipos de desarrollo en sprints e iteraciones.', videoId: DEMO_VIDEO_ID },
      { id: 3, title: 'Requisitos y documentación', duration: '14:55', description: 'Cómo capturar lo que el usuario realmente necesita.', videoId: DEMO_VIDEO_ID },
      { id: 4, title: 'Testing y control de calidad', duration: '15:30', description: 'Por qué probar tu software no es opcional.', videoId: DEMO_VIDEO_ID },
    ],
  },
];

const RANKS = [
  { min: 0, title: 'Aprendiz' },
  { min: 5, title: 'Escudero' },
  { min: 10, title: 'Caballero' },
  { min: 15, title: 'Caballero de la Orden' },
  { min: 20, title: 'Señor del Reino' },
  { min: 25, title: 'Maestro del Reino' },
];

function getRankInfo(completedCount) {
  let level = 1;
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (completedCount >= RANKS[i].min) {
      current = RANKS[i];
      level = i + 1;
    }
  }
  const next = RANKS[level] || null;
  const pct = next ? Math.min(100, Math.round(((completedCount - current.min) / (next.min - current.min)) * 100)) : 100;
  return { title: current.title, level, pct };
}

/* ------------------------------ COMPONENTES ------------------------------ */

function Crest({ color, Icon, size = 56 }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size * 1.12,
        background: `linear-gradient(150deg, ${color} 0%, ${darken(color, 0.4)} 100%)`,
        clipPath: 'polygon(50% 0%, 100% 18%, 100% 60%, 50% 100%, 0% 60%, 0% 18%)',
        boxShadow: `0 6px 16px ${color}40`,
      }}
    >
      <Icon size={Math.round(size * 0.42)} color="#0A0C10" strokeWidth={2.3} />
    </div>
  );
}

function Header({ level, rankTitle, pct, onHome }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 md:px-10 py-4 flex-wrap"
      style={{ background: 'rgba(10,12,16,0.88)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}` }}
    >
      <button
        onClick={onHome}
        className="flex items-center gap-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Crest color={C.gold} Icon={Crown} size={38} />
        <div className="text-left leading-none">
          <div style={{ fontFamily: FONT_DISPLAY, color: C.text, letterSpacing: '0.06em' }} className="text-lg">
            KINGDOM
          </div>
          <div style={{ fontFamily: FONT_BODY, color: C.muted, letterSpacing: '0.35em', fontSize: '10px' }}>
            LEVEL
          </div>
        </div>
      </button>

      <div className="flex items-center gap-3 rounded-full px-4 py-2" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Trophy size={16} color={C.gold} />
        <div className="flex flex-col" style={{ minWidth: 110 }}>
          <span className="text-xs font-semibold" style={{ color: C.text }}>
            Nv. {level} · {rankTitle}
          </span>
          <div className="w-full rounded-full mt-1" style={{ height: 4, background: C.border }}>
            <div
              className="rounded-full"
              style={{ height: 4, width: `${pct}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, transition: 'width 0.4s ease' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero({ totalCourses, totalClasses }) {
  return (
    <section className="px-6 md:px-10 pt-14 pb-10 md:pt-20 md:pb-14 animate-fadein">
      <div className="flex items-center gap-2 mb-5" style={{ color: C.gold }}>
        <Sparkles size={16} />
        <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>Bienvenido al reino</span>
      </div>
      <h1
        style={{ fontFamily: FONT_DISPLAY, color: C.text, lineHeight: 1.2 }}
        className="text-3xl md:text-5xl max-w-3xl mb-5"
      >
        Asciende de aprendiz a maestro de la Ingeniería de Sistemas
      </h1>
      <p className="max-w-2xl text-sm md:text-base" style={{ color: C.muted }}>
        {totalCourses} reinos del saber, {totalClasses} niveles por conquistar. Cada clase completada te acerca al siguiente rango.
      </p>
    </section>
  );
}

function CourseCard({ course, completedInCourse, onOpen }) {
  const pct = Math.round((completedInCourse / course.classes.length) * 100);
  return (
    <button
      onClick={() => onOpen(course.id)}
      className="text-left rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = course.color; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; }}
    >
      <div className="flex items-start justify-between">
        <Crest color={course.color} Icon={course.icon} size={52} />
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{ background: `${course.color}22`, color: course.color, border: `1px solid ${course.color}55` }}
        >
          {course.classes.length} niveles
        </span>
      </div>
      <div>
        <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-1">
          {course.title}
        </h3>
        <p className="text-sm" style={{ color: C.muted }}>{course.tagline}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
          <div className="rounded-full" style={{ width: 64, height: 4, background: C.border }}>
            <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: course.color }} />
          </div>
          <span>{pct}%</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: course.color }}>
          Explorar <ArrowRight size={14} />
        </span>
      </div>
    </button>
  );
}

function HomeView({ completedMap, onOpenCourse }) {
  const totalClasses = courseData.reduce((a, c) => a + c.classes.length, 0);
  return (
    <div>
      <Hero totalCourses={courseData.length} totalClasses={totalClasses} />
      <section className="px-6 md:px-10 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseData.map((course) => {
          const completedInCourse = course.classes.filter((cl) => completedMap[`${course.id}-${cl.id}`]).length;
          return <CourseCard key={course.id} course={course} completedInCourse={completedInCourse} onOpen={onOpenCourse} />;
        })}
      </section>
      <footer className="px-6 md:px-10 pb-14 text-xs text-center" style={{ color: C.mutedDim }}>
        Kingdom Level · un proyecto de aprendizaje construido por un estudiante de Ingeniería de Sistemas
      </footer>
    </div>
  );
}

function CourseView({ course, completedMap, onBack, onOpenClass }) {
  const completedCount = course.classes.filter((cl) => completedMap[`${course.id}-${cl.id}`]).length;
  const pct = Math.round((completedCount / course.classes.length) * 100);

  return (
    <div className="px-6 md:px-10 pb-20 animate-fadein">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} /> Volver a los reinos
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Crest color={course.color} Icon={course.icon} size={78} />
        <div className="flex-1 min-w-0">
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mb-2">
            {course.title}
          </h2>
          <p className="text-sm md:text-base mb-4" style={{ color: C.muted }}>{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: C.mutedDim }}>
            <span className="flex items-center gap-1"><GraduationCap size={14} /> {course.instructor}</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {course.classes.length} niveles</span>
            <span className="flex items-center gap-1"><Trophy size={14} /> {pct}% completado</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Niveles del curso
      </h3>
      <div className="flex flex-col gap-3">
        {course.classes.map((cl, idx) => {
          const done = !!completedMap[`${course.id}-${cl.id}`];
          return (
            <button
              key={cl.id}
              onClick={() => onOpenClass(course.id, cl.id)}
              className="flex items-center gap-4 p-4 rounded-xl text-left"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
            >
              <div
                className="flex items-center justify-center rounded-lg text-sm font-semibold shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: done ? `${C.emerald}22` : C.border,
                  color: done ? C.emerald : C.muted,
                  border: `1px solid ${done ? C.emerald : '#2E3541'}`,
                }}
              >
                {done ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text }} className="text-sm font-medium truncate">
                  Nivel {idx + 1}: {cl.title}
                </p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1 truncate">{cl.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0" style={{ color: C.muted }}>
                <Clock size={14} /> {cl.duration}
              </div>
              <Play size={16} color={course.color} className="shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClassView({ course, activeClass, completedMap, onBack, onOpenClass, onToggleComplete }) {
  const idx = course.classes.findIndex((cl) => cl.id === activeClass.id);
  const done = !!completedMap[`${course.id}-${activeClass.id}`];

  return (
    <div className="px-6 md:px-10 pb-20 animate-fadein">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-6 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} /> Volver a {course.title}
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}`, aspectRatio: '16/9', background: '#000' }}>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeClass.videoId}?rel=0&modestbranding=1`}
              title={activeClass.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs uppercase" style={{ color: course.color, letterSpacing: '0.2em' }}>
                Nivel {idx + 1} · {course.title}
              </span>
              <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-xl md:text-2xl mt-2">
                {activeClass.title}
              </h2>
            </div>
            <button
              onClick={() => onToggleComplete(course.id, activeClass.id)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full shrink-0"
              style={{
                background: done ? `${C.emerald}22` : 'transparent',
                border: `1px solid ${done ? C.emerald : C.border}`,
                color: done ? C.emerald : C.muted,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} /> {done ? 'Completado' : 'Marcar como completado'}
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>{activeClass.description}</p>
        </div>

        <aside className="w-full lg:w-80 shrink-0">
          <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-sm mb-3 uppercase" >
            Niveles de este reino
          </h3>
          <div className="flex flex-col gap-2" style={{ maxHeight: 480, overflowY: 'auto' }}>
            {course.classes.map((cl, i) => {
              const isActive = cl.id === activeClass.id;
              const d = !!completedMap[`${course.id}-${cl.id}`];
              return (
                <button
                  key={cl.id}
                  onClick={() => onOpenClass(course.id, cl.id)}
                  className="flex items-center gap-3 p-3 rounded-lg text-left"
                  style={{
                    background: isActive ? '#1B212D' : 'transparent',
                    border: `1px solid ${isActive ? course.color : C.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                    style={{ width: 26, height: 26, background: d ? `${C.emerald}22` : C.border, color: d ? C.emerald : C.muted }}
                  >
                    {d ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className="text-xs flex-1 truncate" style={{ color: isActive ? C.text : C.muted }}>
                    {cl.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------- APP ----------------------------------- */

export default function KingdomLevel() {
  const [view, setView] = useState('home'); // 'home' | 'course' | 'class'
  const [courseId, setCourseId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [completedMap, setCompletedMap] = useState({});

  const activeCourse = useMemo(() => courseData.find((c) => c.id === courseId) || null, [courseId]);
  const activeClass = useMemo(
    () => (activeCourse ? activeCourse.classes.find((cl) => cl.id === classId) || null : null),
    [activeCourse, classId]
  );

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const { title: rankTitle, level, pct } = getRankInfo(completedCount);

  function goHome() {
    setView('home');
    setCourseId(null);
    setClassId(null);
  }
  function openCourse(id) {
    setCourseId(id);
    setView('course');
  }
  function backToCourse() {
    setClassId(null);
    setView('course');
  }
  function openClass(cId, clId) {
    setCourseId(cId);
    setClassId(clId);
    setView('class');
  }
  function toggleComplete(cId, clId) {
    const key = `${cId}-${clId}`;
    setCompletedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT_BODY, color: C.text }} className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.35s ease both; }

        button:focus-visible {
          outline: 2px solid ${C.gold};
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadein { animation: none; }
          * { transition: none !important; }
        }
      `}</style>

      <Header level={level} rankTitle={rankTitle} pct={pct} onHome={goHome} />

      {view === 'home' && <HomeView completedMap={completedMap} onOpenCourse={openCourse} />}

      {view === 'course' && activeCourse && (
        <CourseView course={activeCourse} completedMap={completedMap} onBack={goHome} onOpenClass={openClass} />
      )}

      {view === 'class' && activeCourse && activeClass && (
        <ClassView
          course={activeCourse}
          activeClass={activeClass}
          completedMap={completedMap}
          onBack={backToCourse}
          onOpenClass={openClass}
          onToggleComplete={toggleComplete}
        />
      )}
    </div>
  );
}