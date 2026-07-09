/**
 * KINGDOM LEVEL
 * -----------------------------------------------------------------------
 * Plataforma de estudio estilo Platzi, con identidad propia de "reino".
 *
 * ORDEN DE LA PÁGINA PRINCIPAL:
 *   1. Intro — nombre del proyecto + video introductorio (IntroSection)
 *   2. Cursos (los "reinos")
 *   3. Apuntes de la carrera (por curso → tema → descripción + link a Drive)
 *   4. "¿Quieres ser parte del proyecto?" — postulación para dar clases o
 *      aportar apuntes (JoinProjectSection)
 *   5. Comunidad (grupo de WhatsApp)
 *
 * JERARQUÍA DE CONTENIDO PARA VIDEOS DE CLASE (4 niveles):
 *   Curso (reino)  →  Tema  →  Clase  →  Video
 *
 * JERARQUÍA DE APUNTES (2 niveles, se detiene en el tema):
 *   Curso (reino)  →  Tema  →  Descripción del tema + link a la carpeta de apuntes
 *
 * NAVEGACIÓN: no usa react-router. Es un router interno hecho con useState
 * (view: 'home' | 'levels' | 'course' | 'topic' | 'class' | 'notesCourse' | 'notesTopic').
 * Cada clic hace que la pantalla anterior desaparezca por completo y se
 * muestre la nueva vista dentro del mismo sitio: nunca se abre una pestaña
 * nueva ni se redirige a sitios externos — EXCEPTO los botones que son a
 * propósito enlaces externos reales: el video de introducción (se reproduce
 * embebido, no redirige), el link a la carpeta de apuntes (Drive), los
 * formularios de postulación y el grupo de WhatsApp.
 *
 * CÓMO PERSONALIZAR TU CONTENIDO:
 * 1. INTRO_VIDEO_ID: el video de YouTube que presenta el proyecto (arriba de todo).
 * 2. `courseData`: cada curso tiene `topics`, y cada tema tiene:
 *      - `classes`: arreglo de clases con su video (id, title, duration, description, videoId).
 *      - `notes`: { summary, keyPoints, notesLink } → descripción del tema,
 *        una lista de lo que encontrarán, y el link a tu carpeta de Drive
 *        (u otro servicio) con los apuntes reales de ese tema.
 * 3. WHATSAPP_LINK: link de invitación a tu grupo de WhatsApp.
 * 4. APPLY_TEACH_LINK / APPLY_CONTRIBUTE_LINK: formularios (ej. Google Forms)
 *    para que la gente se postule a dar clases o a aportar apuntes.
 *    El `videoId` es la parte del link de YouTube después de "watch?v=".
 *    Ejemplo: en https://www.youtube.com/watch?v=jNQXAC9IVRw el videoId es "jNQXAC9IVRw".
 *
 * SI QUIERES ESTO COMO SITIO REAL CON URLs PROPIAS: este archivo ya está
 * listo para conectarse a React Router: cada "view" puede convertirse en
 * una <Route> sin cambiar el diseño ni la lógica interna.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Users,
  MessageCircle,
  CalendarDays,
  ArrowUpRight,
  FileText,
  FolderOpen,
  Handshake,
  UploadCloud,
  Lock,
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
  amethyst: '#9B7FC7',
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
/* Reemplaza el contenido de este bloque con tus propios datos. */

const DEMO_VIDEO_ID = 'jNQXAC9IVRw'; // ← reemplaza esto por tus videos de clase reales
const INTRO_VIDEO_ID = 'jNQXAC9IVRw'; // ← reemplaza esto por tu video de presentación del proyecto

// Carpeta de Drive (u otro servicio) donde guardas los apuntes reales.
// Puedes usar el mismo link para todos los temas, o poner uno distinto por tema.
const NOTES_LINK_PLACEHOLDER = 'https://drive.google.com/drive/folders/TU-CARPETA-DE-APUNTES-AQUI';

// Link de invitación a tu grupo de WhatsApp. Lo obtienes desde:
// WhatsApp → tu grupo → Datos del grupo → Invitar mediante enlace → Copiar enlace.
const WHATSAPP_LINK = 'https://chat.whatsapp.com/TU-ENLACE-DE-INVITACION-AQUI';

// Formularios de postulación (ej. Google Forms) para sumarse al proyecto.
const APPLY_TEACH_LINK = 'https://forms.gle/TU-FORMULARIO-PARA-DAR-CLASES-AQUI';
const APPLY_CONTRIBUTE_LINK = 'https://forms.gle/TU-FORMULARIO-PARA-APORTAR-APUNTES-AQUI';

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
    topics: [
      {
        id: 1,
        title: 'Lógica y variables',
        description: 'Los primeros pasos: cómo piensa un programa y cómo se guarda la información.',
        classes: [
          { id: 1, title: 'Introducción a la lógica de programación', duration: '12:30', description: 'Qué es un algoritmo y cómo aprender a pensar como una computadora.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Variables, tipos de datos y operadores', duration: '15:10', description: 'Cómo se guarda y manipula la información dentro de un programa.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Antes de escribir cualquier programa necesitas pensar como una computadora: dividir un problema en pasos simples y ordenados, y saber dónde guardar la información que usarás en el camino.',
          keyPoints: [
            'Qué es un algoritmo y cómo se representa paso a paso.',
            'Variables, tipos de datos y operadores básicos.',
            'Ejercicios resueltos de lógica de programación.',
            'Glosario de términos usados en esta primera parte del curso.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Control de flujo y funciones',
        description: 'Cómo tomar decisiones, repetir tareas y organizar el código en piezas reutilizables.',
        classes: [
          { id: 1, title: 'Estructuras de control: condicionales', duration: '14:45', description: 'Cómo tomar decisiones dentro de un programa con if, else y switch.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Estructuras de control: bucles', duration: '16:20', description: 'Repetir tareas de forma eficiente con for, while y do-while.', videoId: DEMO_VIDEO_ID },
          { id: 3, title: 'Funciones y modularización', duration: '13:55', description: 'Cómo dividir un programa en piezas reutilizables y fáciles de mantener.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'El flujo de un programa rara vez es una línea recta: necesita tomar decisiones y repetir tareas. Las funciones te permiten organizar ese flujo en piezas pequeñas y reutilizables.',
          keyPoints: [
            'Condicionales: if, else y switch, con ejemplos comentados.',
            'Bucles: for, while y do-while, y cuándo usar cada uno.',
            'Cómo declarar y llamar funciones con parámetros y retorno.',
            'Ejercicios prácticos para combinar condicionales, bucles y funciones.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
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
    topics: [
      {
        id: 1,
        title: 'Estructuras lineales',
        description: 'Las formas más básicas de guardar y recorrer colecciones de datos.',
        classes: [
          { id: 1, title: 'Arrays y listas enlazadas', duration: '14:00', description: 'Las dos formas más básicas de almacenar colecciones de datos en memoria.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Pilas y colas', duration: '12:40', description: 'Estructuras LIFO y FIFO y sus aplicaciones en el mundo real.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Antes de estructuras complejas, domina las dos formas más usadas de guardar una colección de datos en orden: arrays y listas, además de dos patrones de acceso muy comunes: pilas y colas.',
          keyPoints: [
            'Arrays vs listas enlazadas: diferencias y cuándo usar cada una.',
            'Implementación de pilas (stack) y colas (queue).',
            'Diagramas de memoria para visualizar cada estructura.',
            'Ejercicios de complejidad para operaciones básicas.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Árboles y algoritmos',
        description: 'Organización jerárquica de datos y las técnicas para ordenarlos y medir su eficiencia.',
        classes: [
          { id: 1, title: 'Árboles binarios', duration: '17:15', description: 'Cómo organizar datos jerárquicamente para búsquedas más rápidas.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Algoritmos de ordenamiento', duration: '18:30', description: 'Bubble sort, merge sort y quick sort explicados paso a paso.', videoId: DEMO_VIDEO_ID },
          { id: 3, title: 'Complejidad algorítmica (Big O)', duration: '15:50', description: 'Cómo medir qué tan rápido o lento es realmente tu código.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Cuando los datos tienen relaciones jerárquicas, un árbol es más eficiente que una lista. Además, ordenar datos y medir qué tan rápido corre tu código es una habilidad central de todo ingeniero.',
          keyPoints: [
            'Árboles binarios: recorridos in-order, pre-order y post-order.',
            'Algoritmos de ordenamiento comparados con ejemplos paso a paso.',
            'Tabla resumen de complejidad Big O de cada algoritmo visto.',
            'Ejercicios propuestos con solución al final del documento.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
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
    topics: [
      {
        id: 1,
        title: 'Diseño de bases de datos',
        description: 'Cómo modelar un problema real en tablas, relaciones y reglas de consistencia.',
        classes: [
          { id: 1, title: 'Modelo entidad-relación', duration: '13:20', description: 'Cómo traducir un problema del mundo real en tablas y relaciones.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Normalización de bases de datos', duration: '14:50', description: 'Cómo evitar datos duplicados e inconsistentes en tu diseño.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Antes de escribir una sola línea de SQL, necesitas modelar bien el problema: qué entidades existen, cómo se relacionan entre sí y cómo evitar que los datos se dupliquen o se vuelvan inconsistentes.',
          keyPoints: [
            'Modelo entidad-relación con ejemplos de diagramas.',
            'Claves primarias y foráneas explicadas con casos reales.',
            'Formas normales (1FN, 2FN, 3FN) paso a paso.',
            'Ejercicio guiado: modelar una base de datos desde cero.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'SQL y optimización',
        description: 'El lenguaje para consultar datos y las técnicas para que esas consultas no se vuelvan lentas.',
        classes: [
          { id: 1, title: 'SQL: consultas básicas', duration: '16:05', description: 'SELECT, WHERE, ORDER BY y los cimientos de todo lenguaje SQL.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Joins y subconsultas', duration: '17:40', description: 'Cómo combinar información de varias tablas en una sola consulta.', videoId: DEMO_VIDEO_ID },
          { id: 3, title: 'Índices y optimización', duration: '15:15', description: 'Técnicas para que tus consultas no se vuelvan lentas cuando la base crece.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'SQL es el lenguaje con el que le hablas a una base de datos relacional. Con la base bien diseñada, el siguiente paso es escribir consultas claras y que respondan rápido incluso cuando los datos crecen.',
          keyPoints: [
            'Cheatsheet de sintaxis SQL: SELECT, WHERE, ORDER BY, GROUP BY.',
            'Tipos de JOIN explicados con diagramas de conjuntos.',
            'Subconsultas correlacionadas vs no correlacionadas.',
            'Buenas prácticas de índices y cómo leer un plan de ejecución.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
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
    topics: [
      {
        id: 1,
        title: 'Fundamentos de objetos',
        description: 'El vocabulario base de la programación orientada a objetos: qué es una clase y cómo se relacionan entre sí.',
        classes: [
          { id: 1, title: 'Clases y objetos', duration: '13:10', description: 'El vocabulario básico de la programación orientada a objetos.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Herencia y polimorfismo', duration: '16:35', description: 'Cómo reutilizar y especializar comportamiento entre clases.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'La programación orientada a objetos organiza el código alrededor de "objetos" que combinan datos y comportamiento, en lugar de solo funciones sueltas.',
          keyPoints: [
            'Clases vs objetos, con ejemplos del mundo real.',
            'Herencia: cómo reutilizar comportamiento entre clases.',
            'Polimorfismo explicado con ejemplos de código.',
            'Diagrama de clases UML simplificado.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Diseño orientado a objetos',
        description: 'Cómo proteger tus clases y resolver problemas comunes con patrones ya probados.',
        classes: [
          { id: 1, title: 'Encapsulamiento y abstracción', duration: '14:20', description: 'Cómo proteger y simplificar el uso de tus propias clases.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Patrones de diseño básicos', duration: '18:00', description: 'Soluciones probadas a problemas comunes del diseño de software.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Escribir clases que funcionan no es suficiente: también deben ser fáciles de mantener. Encapsular bien los datos y usar patrones probados evita muchos dolores de cabeza a futuro.',
          keyPoints: [
            'Encapsulamiento: getters, setters y visibilidad de atributos.',
            'Abstracción: separar el qué del cómo.',
            'Patrones de diseño básicos: Singleton, Factory y Observer.',
            'Casos de uso reales de cada patrón visto.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
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
    topics: [
      {
        id: 1,
        title: 'Modelos y direccionamiento',
        description: 'Las capas que hacen posible la comunicación y cómo se organizan las direcciones en una red.',
        classes: [
          { id: 1, title: 'Modelo OSI y TCP/IP', duration: '15:00', description: 'Las capas que hacen posible la comunicación entre dispositivos.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Direccionamiento IP y subredes', duration: '17:25', description: 'Cómo se organizan y dividen las direcciones en una red.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Para que dos dispositivos se comuniquen necesitan hablar el mismo "idioma" por capas, y cada uno necesita una dirección única dentro de la red.',
          keyPoints: [
            'Modelo OSI vs TCP/IP, capa por capa.',
            'Cómo calcular subredes paso a paso (ejercicios incluidos).',
            'Tabla de clases de direcciones IP y máscaras comunes.',
            'Glosario de términos de redes usados en el curso.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Protocolos y seguridad',
        description: 'Los protocolos que usas todos los días y las prácticas básicas para proteger una red.',
        classes: [
          { id: 1, title: 'Protocolos de aplicación (HTTP, DNS, FTP)', duration: '14:10', description: 'Los protocolos que usas todos los días sin darte cuenta.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Seguridad básica en redes', duration: '16:45', description: 'Firewalls, cifrado y buenas prácticas para proteger una red.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Cada vez que abres una página web o envías un archivo, hay protocolos trabajando detrás de escena. Protegerlos es tan importante como que funcionen.',
          keyPoints: [
            'HTTP, DNS y FTP explicados con ejemplos de tráfico real.',
            'Qué hace un firewall y cómo se configuran reglas básicas.',
            'Cifrado simétrico vs asimétrico, en términos simples.',
            'Checklist de buenas prácticas de seguridad en redes.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
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
    topics: [
      {
        id: 1,
        title: 'Planificación del proyecto',
        description: 'Las etapas de un proyecto de software y cómo organizarlas con metodologías ágiles.',
        classes: [
          { id: 1, title: 'Ciclo de vida del software', duration: '13:40', description: 'Las etapas por las que pasa todo proyecto, del análisis al mantenimiento.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Metodologías ágiles (Scrum)', duration: '16:15', description: 'Cómo organizar equipos de desarrollo en sprints e iteraciones.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Ningún proyecto de software serio se construye a base de improvisación: tiene etapas, y hoy la mayoría de equipos las organizan con metodologías ágiles en lugar de planificarlo todo de una sola vez.',
          keyPoints: [
            'Ciclo de vida del software: análisis, diseño, desarrollo, pruebas y mantenimiento.',
            'Scrum: roles, sprints y ceremonias explicadas con ejemplos.',
            'Plantilla de product backlog lista para usar.',
            'Comparación rápida entre metodologías ágiles y tradicionales.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Calidad y documentación',
        description: 'Cómo capturar lo que el usuario necesita y asegurarte de que el software realmente funcione.',
        classes: [
          { id: 1, title: 'Requisitos y documentación', duration: '14:55', description: 'Cómo capturar lo que el usuario realmente necesita.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Testing y control de calidad', duration: '15:30', description: 'Por qué probar tu software no es opcional.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Un software solo es tan bueno como lo que realmente necesita el usuario, y solo es confiable si alguien se aseguró de probarlo antes de que llegue a producción.',
          keyPoints: [
            'Cómo redactar requisitos funcionales y no funcionales.',
            'Plantilla de documento de requisitos.',
            'Tipos de pruebas: unitarias, de integración y de aceptación.',
            'Checklist de control de calidad antes de entregar un proyecto.',
          ],
          notesLink: NOTES_LINK_PLACEHOLDER,
        },
      },
    ],
  },
];

// Total de clases que existen hoy en el sitio. Si más adelante agregas más
// cursos o clases, esto se recalcula solo y la curva de niveles se estira
// automáticamente para seguir teniendo sentido.
const TOTAL_CLASSES = courseData.reduce((a, c) => a + c.topics.reduce((ta, t) => ta + t.classes.length, 0), 0);

// Cuánta "experiencia" vale cada clase completada. Es solo para mostrar un
// número tipo videojuego (Nv. X · 600 XP); lo que realmente decide el nivel
// es cuántas clases has completado.
const XP_PER_CLASS = 100;

// El escalafón del reino: al principio subir de nivel es rápido (como en
// cualquier juego, para enganchar desde la primera clase), y cada nivel
// siguiente pide progresivamente más esfuerzo. Los porcentajes son sobre el
// total de clases del sitio (TOTAL_CLASSES), así que la curva se ajusta sola
// si agregas o quitas contenido.
const LEVEL_TITLES = [
  'Plebeyo del Reino',
  'Aprendiz',
  'Escudero',
  'Paje de la Corte',
  'Caballero Novicio',
  'Caballero',
  'Caballero de la Orden',
  'Guardián del Reino',
  'Señor(a) del Reino',
  'Archimago del Código',
  'Leyenda de Kingdom Level',
];
const LEVEL_FRACTIONS = [0, 0.04, 0.08, 0.15, 0.22, 0.33, 0.44, 0.56, 0.7, 0.85, 1];

const LEVELS = LEVEL_TITLES.map((title, i) => ({
  level: i + 1,
  title,
  classesNeeded: Math.round(LEVEL_FRACTIONS[i] * TOTAL_CLASSES),
})).map((lvl, i, arr) => {
  // Garantiza que cada nivel pida al menos una clase más que el anterior.
  if (i > 0 && lvl.classesNeeded <= arr[i - 1].classesNeeded) {
    lvl.classesNeeded = Math.min(TOTAL_CLASSES, arr[i - 1].classesNeeded + 1);
  }
  return lvl;
});

function getLevelInfo(completedCount) {
  let current = LEVELS[0];
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (completedCount >= LEVELS[i].classesNeeded) {
      current = LEVELS[i];
      idx = i;
    }
  }
  const next = LEVELS[idx + 1] || null;
  const pct = next
    ? Math.min(100, Math.round(((completedCount - current.classesNeeded) / (next.classesNeeded - current.classesNeeded)) * 100))
    : 100;
  return {
    level: current.level,
    title: current.title,
    pct,
    xp: completedCount * XP_PER_CLASS,
    xpForNext: next ? next.classesNeeded * XP_PER_CLASS : current.classesNeeded * XP_PER_CLASS,
    classesForNext: next ? next.classesNeeded - completedCount : 0,
    isMaxLevel: !next,
  };
}

/* ------------------------------ AYUDANTES -------------------------------- */

function courseTotals(course, completedMap) {
  let total = 0;
  let done = 0;
  course.topics.forEach((topic) => {
    topic.classes.forEach((cl) => {
      total += 1;
      if (completedMap[`${course.id}-${topic.id}-${cl.id}`]) done += 1;
    });
  });
  return { total, done };
}

function topicTotals(course, topic, completedMap) {
  const total = topic.classes.length;
  const done = topic.classes.filter((cl) => completedMap[`${course.id}-${topic.id}-${cl.id}`]).length;
  return { total, done };
}

// Construye un hash de URL para cada estado de navegación. Se usa junto con
// history.pushState/popstate para que el botón "atrás" del navegador y del
// celular retrocedan un paso dentro de Kingdom Level en vez de salir del sitio.
// Profundidad de cada vista dentro de la jerarquía, usada para decidir si una
// transición de pantalla debe sentirse como "avanzar" o "retroceder".
const VIEW_DEPTH = { home: 0, levels: 1, course: 1, topic: 2, class: 3, notesCourse: 1, notesTopic: 2 };

function hashForNav(next) {
  switch (next.view) {
    case 'levels':
      return '#niveles';
    case 'course':
      return `#curso/${next.courseId}`;
    case 'topic':
      return `#curso/${next.courseId}/${next.topicId}`;
    case 'class':
      return `#curso/${next.courseId}/${next.topicId}/clase/${next.classId}`;
    case 'notesCourse':
      return `#apuntes/${next.notesCourseId}`;
    case 'notesTopic':
      return `#apuntes/${next.notesCourseId}/${next.notesTopicId}`;
    default:
      return '#inicio';
  }
}

/* ------------------------------ COMPONENTES ------------------------------ */

/* Envoltorio que revela su contenido con una animación suave cuando entra en pantalla al hacer scroll. */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Crest({ color, Icon, size = 56, pulse = false, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 crest ${pulse ? 'crest-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size * 1.12,
        background: `linear-gradient(150deg, ${color} 0%, ${darken(color, 0.4)} 100%)`,
        clipPath: 'polygon(50% 0%, 100% 18%, 100% 60%, 50% 100%, 0% 60%, 0% 18%)',
        boxShadow: `0 6px 16px ${color}40`,
        '--crest-color': color,
      }}
    >
      <Icon size={Math.round(size * 0.42)} color="#0A0C10" strokeWidth={2.3} />
    </div>
  );
}

function MiniBar({ done, total, color }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full" style={{ width: 56, height: 4, background: C.border, overflow: 'hidden' }}>
        <div
          className="rounded-full"
          style={{ height: 4, width: `${pct}%`, background: color, transition: 'width 0.4s ease', position: 'relative', overflow: 'hidden' }}
        >
          <span className="bar-shimmer" />
        </div>
      </div>
      <span className="text-xs" style={{ color: C.mutedDim }}>{done}/{total}</span>
    </div>
  );
}

function Header({ level, rankTitle, pct, onHome, completedCount = 0, classesForNext = 0, isMaxLevel = false, onOpenLevels }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 md:px-10 py-4 flex-wrap"
      style={{ background: 'rgba(10,12,16,0.88)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}` }}
    >
      <button
        onClick={onHome}
        className="logo-btn flex items-center gap-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Crest color={C.gold} Icon={Crown} size={38} pulse className="logo-crest" />
        <div className="text-left leading-none">
          <div style={{ fontFamily: FONT_DISPLAY, color: C.text, letterSpacing: '0.06em' }} className="text-lg">
            KINGDOM
          </div>
          <div style={{ fontFamily: FONT_BODY, color: C.muted, letterSpacing: '0.35em', fontSize: '10px' }}>
            LEVEL
          </div>
        </div>
      </button>

      <button
        onClick={onOpenLevels}
        className="level-badge flex items-center gap-3 rounded-full px-4 py-2"
        style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
      >
        <div key={completedCount} className="relative flex items-center justify-center">
          <span className="xp-ping" />
          <Trophy size={16} color={C.gold} style={{ position: 'relative', zIndex: 1 }} />
        </div>
        <div className="flex flex-col items-start" style={{ minWidth: 130 }}>
          <span className="text-xs font-semibold" style={{ color: C.text }}>
            Nv. {level} · {rankTitle}
          </span>
          <div className="w-full rounded-full mt-1" style={{ height: 4, background: C.border }}>
            <div
              className="rounded-full"
              style={{ height: 4, width: `${pct}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, transition: 'width 0.4s ease' }}
            />
          </div>
          <span className="mt-1" style={{ color: C.mutedDim, fontSize: '10px' }}>
            {isMaxLevel ? 'Nivel máximo alcanzado' : `${classesForNext} ${classesForNext === 1 ? 'clase' : 'clases'} para subir`}
          </span>
        </div>
      </button>
    </header>
  );
}

function AmbientGlow({ variant = 'hero' }) {
  const map = {
    hero: [
      { color: C.gold, top: '-14%', left: '4%', size: 380, delay: '0s' },
      { color: '#5B8DBF', top: '2%', right: '-6%', size: 340, delay: '2.2s' },
      { color: C.amethyst, bottom: '-20%', left: '30%', size: 300, delay: '4.4s' },
    ],
    community: [
      { color: C.emerald, top: '-18%', right: '6%', size: 320, delay: '1.2s' },
      { color: C.amethyst, bottom: '-22%', left: '-2%', size: 300, delay: '3.6s' },
    ],
    apply: [
      { color: C.gold, top: '-16%', left: '-4%', size: 300, delay: '0.8s' },
      { color: C.amethyst, bottom: '-18%', right: '2%', size: 300, delay: '2.9s' },
    ],
  };
  const blobs = map[variant] || map.hero;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="ambient-blob"
          style={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            background: b.color,
            opacity: 0.16,
            filter: 'blur(90px)',
            borderRadius: '9999px',
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------- 1. INTRO (primera impresión) ------------------ */

const INTRO_STATS = (totalCourses, totalTopics, totalClasses) => [
  { icon: Crown, label: `${totalCourses} reinos` },
  { icon: BookOpen, label: `${totalTopics} temas` },
  { icon: Play, label: `${totalClasses} clases` },
];

function IntroSection({ totalCourses, totalTopics, totalClasses }) {
  const stats = INTRO_STATS(totalCourses, totalTopics, totalClasses);
  const sparkles = [
    { top: '14%', left: '10%', size: 14, delay: '0s' },
    { top: '22%', right: '12%', size: 10, delay: '0.8s' },
    { top: '68%', left: '6%', size: 12, delay: '1.6s' },
    { top: '75%', right: '9%', size: 16, delay: '2.4s' },
  ];

  return (
    <section className="relative px-6 md:px-10 pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden">
      <AmbientGlow variant="hero" />
      {sparkles.map((s, i) => (
        <Sparkles
          key={i}
          size={s.size}
          className="sparkle-float"
          aria-hidden="true"
          style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, color: C.gold, animationDelay: s.delay }}
        />
      ))}

      <div className="relative flex flex-col items-center text-center">
        <div className="intro-crest-in mb-6">
          <Crest color={C.gold} Icon={Crown} size={96} pulse />
        </div>

        <div className="intro-title-in flex items-center gap-2 mb-4" style={{ color: C.gold }}>
          <Sparkles size={16} className="icon-twinkle" />
          <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>Bienvenido al reino</span>
        </div>

        <h1
          className="intro-title-in text-4xl md:text-6xl mb-5"
          style={{ fontFamily: FONT_DISPLAY, color: C.text, letterSpacing: '0.04em' }}
        >
          KINGDOM LEVEL
        </h1>

        <p className="intro-sub-in max-w-2xl text-sm md:text-base mb-10" style={{ color: C.muted }}>
          Un espacio creado por y para estudiantes de Ingeniería de Sistemas, donde compartimos lo aprendido en la
          carrera a través de cursos, apuntes y una comunidad que se apoya mutuamente. Mira el video y conoce de qué
          se trata todo esto.
        </p>

        <div className="intro-video-in w-full" style={{ maxWidth: 760 }}>
          <p className="text-xs uppercase mb-3" style={{ color: C.muted, letterSpacing: '0.2em' }}>
            ¿Qué es Kingdom Level?
          </p>
          <div
            className="video-glow-frame rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.border}`, aspectRatio: '16/9', background: '#000' }}
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Presentación de Kingdom Level"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        <div className="intro-stats-in flex flex-wrap justify-center gap-3 mt-9">
          {stats.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-full"
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}
            >
              <s.icon size={14} color={C.gold} /> {s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 2. CURSOS -------------------------- */

function CourseCard({ course, completedMap, onOpen, index = 0 }) {
  const { total, done } = courseTotals(course, completedMap);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <button
      onClick={() => onOpen(course.id)}
      className="course-card text-left rounded-2xl p-6 flex flex-col gap-4 card-in"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(.2,.8,.2,1), border-color 0.25s ease, box-shadow 0.25s ease',
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
        e.currentTarget.style.borderColor = course.color;
        e.currentTarget.style.boxShadow = `0 16px 40px -12px ${course.color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between">
        <Crest color={course.color} Icon={course.icon} size={52} className="course-crest" />
        <span
          className="text-xs px-3 py-1 rounded-full text-right"
          style={{ background: `${course.color}22`, color: course.color, border: `1px solid ${course.color}55` }}
        >
          {course.topics.length} temas · {total} clases
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
          <div className="rounded-full" style={{ width: 64, height: 4, background: C.border, overflow: 'hidden', position: 'relative' }}>
            <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: course.color, position: 'relative', overflow: 'hidden' }}>
              <span className="bar-shimmer" />
            </div>
          </div>
          <span>{pct}%</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium course-cta" style={{ color: course.color }}>
          Explorar <ArrowRight size={14} />
        </span>
      </div>
    </button>
  );
}

/* -------------------------- 3. APUNTES (sección) ----------------------------- */

function NotesCourseCard({ course, onOpen, index = 0 }) {
  return (
    <button
      onClick={() => onOpen(course.id)}
      className="text-left rounded-2xl p-5 flex items-center gap-4 card-in"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        animationDelay: `${index * 70}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = course.color;
        e.currentTarget.style.boxShadow = `0 12px 26px -10px ${course.color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Crest color={course.color} Icon={course.icon} size={44} />
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-sm mb-1 truncate">{course.title}</p>
        <p className="text-xs" style={{ color: C.mutedDim }}>{course.topics.length} temas con apuntes</p>
      </div>
      <ArrowRight size={16} color={course.color} className="shrink-0" />
    </button>
  );
}

function NotesSection({ onOpenCourse }) {
  return (
    <section className="px-6 md:px-10 pb-16">
      <div className="flex items-center gap-2 mb-2" style={{ color: C.gold }}>
        <FileText size={16} />
        <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>El archivo del reino</span>
      </div>
      <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mb-3">
        Apuntes de la carrera
      </h2>
      <p className="text-sm md:text-base mb-6 max-w-2xl" style={{ color: C.muted }}>
        Repasa las ideas clave de cada tema y accede a los apuntes completos guardados en Drive. Elige un curso y
        luego un tema.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseData.map((course, idx) => (
          <NotesCourseCard key={course.id} course={course} onOpen={onOpenCourse} index={idx} />
        ))}
      </div>
    </section>
  );
}

function NotesCourseView({ course, onBack, onOpenTopic }) {
  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver al archivo del reino
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Crest color={course.color} Icon={course.icon} size={78} />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: course.color, letterSpacing: '0.2em' }}>
            Apuntes
          </span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mt-2 mb-2">
            {course.title}
          </h2>
          <p className="text-sm md:text-base mb-4" style={{ color: C.muted }}>{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: C.mutedDim }}>
            <span className="flex items-center gap-1"><FileText size={14} /> {course.topics.length} temas con apuntes</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Temas con apuntes
      </h3>
      <div className="flex flex-col gap-3">
        {course.topics.map((topic, idx) => (
          <button
            key={topic.id}
            onClick={() => onOpenTopic(course.id, topic.id)}
            className="row-card flex items-center gap-4 p-4 rounded-xl text-left card-in"
            style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', animationDelay: `${idx * 80}ms`, '--row-color': course.color }}
          >
            <div
              className="flex items-center justify-center rounded-lg text-sm font-semibold shrink-0"
              style={{ width: 40, height: 40, background: C.border, color: C.muted, border: '1px solid #2E3541' }}
            >
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: C.text }} className="text-sm font-medium truncate">
                Tema {idx + 1}: {topic.title}
              </p>
              <p style={{ color: C.mutedDim }} className="text-xs mt-1 truncate">{topic.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0" style={{ color: C.muted }}>
              <FileText size={14} /> Apuntes
            </div>
            <ArrowRight size={16} color={course.color} className="row-arrow shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* Descripción del tema + link a la carpeta de apuntes (ej. Google Drive) */
function NotesTopicView({ course, topic, onBack }) {
  const topicIndex = course.topics.findIndex((t) => t.id === topic.id);
  const notes = topic.notes || { summary: '', keyPoints: [], notesLink: '#' };

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver a temas de {course.title}
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-8 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Crest color={course.color} Icon={course.icon} size={70} />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: course.color, letterSpacing: '0.2em' }}>
            {course.title} · Tema {topicIndex + 1} · Apuntes
          </span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mt-2">
            {topic.title}
          </h2>
        </div>
      </div>

      {/* Descripción de lo que se verá en el tema */}
      <div className="rounded-2xl p-6 md:p-8 mb-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold uppercase mb-3" style={{ color: course.color, letterSpacing: '0.15em' }}>
          Qué encontrarás en este tema
        </p>
        <p className="text-sm md:text-base mb-6 leading-relaxed" style={{ color: C.muted }}>{notes.summary}</p>
        <ul className="flex flex-col gap-3">
          {notes.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.text }}>
              <span
                className="shrink-0"
                style={{ width: 6, height: 6, marginTop: 8, borderRadius: '9999px', background: course.color }}
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Acceso a los apuntes reales, alojados externamente (ej. una carpeta de Drive) */}
      <div
        className="rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ background: `linear-gradient(135deg, ${course.color}18, ${C.surface})`, border: `1px solid ${course.color}55` }}
      >
        <div className="flex items-center gap-4">
          <Crest color={course.color} Icon={FolderOpen} size={54} />
          <div>
            <p style={{ color: C.text }} className="text-sm font-semibold mb-1">Apuntes completos del tema</p>
            <p style={{ color: C.mutedDim }} className="text-xs">Guardados en una carpeta externa · se abre en una pestaña nueva</p>
          </div>
        </div>
        <a
          href={notes.notesLink}
          target="_blank"
          rel="noopener noreferrer"
          className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${course.color}, ${darken(course.color, 0.25)})`, color: '#0A0C10' }}
        >
          <FolderOpen size={16} /> Abrir apuntes <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
}

/* -------------------------- 4. ¿QUIERES SER PARTE DEL PROYECTO? ----------- */

const JOIN_PATHS = [
  {
    icon: GraduationCap,
    title: 'Quiero dar clases',
    text: 'Comparte lo que sabes: graba una clase, propone un tema nuevo o mejora uno de los cursos que ya existen.',
    cta: 'Postularme para enseñar',
    link: APPLY_TEACH_LINK,
    color: C.gold,
  },
  {
    icon: UploadCloud,
    title: 'Quiero aportar apuntes',
    text: 'Ayuda a completar el archivo del reino con tus propios resúmenes, esquemas o materiales de estudio.',
    cta: 'Postularme para aportar',
    link: APPLY_CONTRIBUTE_LINK,
    color: C.amethyst,
  },
];

function JoinProjectSection() {
  return (
    <section className="px-6 md:px-10 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 animate-fadein"
        style={{ background: `linear-gradient(135deg, ${C.surface} 0%, #171C26 100%)`, border: `1px solid ${C.border}` }}
      >
        <AmbientGlow variant="apply" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4" style={{ color: C.gold }}>
            <Handshake size={16} />
            <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>Súmate al proyecto</span>
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text, lineHeight: 1.25 }} className="text-2xl md:text-3xl mb-4 max-w-xl">
            ¿Quieres ser parte del proyecto?
          </h2>
          <p className="text-sm md:text-base max-w-2xl mb-8" style={{ color: C.muted }}>
            Kingdom Level lo construye la comunidad. Si quieres dar una clase o compartir tus propios apuntes,
            postúlate y hagamos crecer el reino juntos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {JOIN_PATHS.map((path, i) => (
              <div
                key={i}
                className="join-card flex flex-col gap-4 p-6 rounded-2xl"
                style={{ background: '#0F131A', border: `1px solid ${C.border}` }}
              >
                <Crest color={path.color} Icon={path.icon} size={52} />
                <div>
                  <p style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-base mb-2">{path.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.mutedDim }}>{path.text}</p>
                </div>
                <a
                  href={path.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-cta btn-tap inline-flex items-center justify-center gap-2 text-xs font-semibold px-5 py-3 rounded-full mt-auto"
                  style={{ background: `linear-gradient(90deg, ${path.color}, ${darken(path.color, 0.25)})`, color: '#0A0C10' }}
                >
                  {path.cta} <ArrowUpRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 5. COMUNIDAD (sección) --------------------------- */

const COMMUNITY_FEATURES = [
  { icon: Users, label: 'Grupos de estudio' },
  { icon: MessageCircle, label: 'Apoyo entre compañeros' },
  { icon: CalendarDays, label: 'Actividades y retos' },
];

function CommunitySection() {
  return (
    <section className="px-6 md:px-10 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 animate-fadein"
        style={{ background: `linear-gradient(135deg, ${C.surface} 0%, #171C26 100%)`, border: `1px solid ${C.border}` }}
      >
        <AmbientGlow variant="community" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4" style={{ color: C.emerald }}>
              <Users size={16} />
              <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>La hermandad del reino</span>
            </div>
            <h2
              style={{ fontFamily: FONT_DISPLAY, color: C.text, lineHeight: 1.25 }}
              className="text-2xl md:text-3xl mb-4 max-w-xl"
            >
              Nadie conquista un reino en solitario
            </h2>
            <p className="text-sm md:text-base max-w-xl mb-6" style={{ color: C.muted }}>
              Únete a nuestro grupo de WhatsApp para formar grupos de estudio, hacer amigos de la carrera, resolver
              dudas entre todos y participar en actividades. Aquí nos apoyamos mutuamente para llegar más lejos.
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              {COMMUNITY_FEATURES.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-full"
                  style={{ background: '#0F131A', border: `1px solid ${C.border}`, color: C.muted }}
                >
                  <f.icon size={14} color={C.gold} /> {f.label}
                </span>
              ))}
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
              style={{ background: `linear-gradient(90deg, ${C.emerald}, #79CF9C)`, color: '#0A0C10' }}
            >
              <MessageCircle size={18} /> Unirse al grupo de WhatsApp <ArrowUpRight size={16} />
            </a>
            <p className="text-xs mt-3" style={{ color: C.mutedDim }}>
              Se abrirá WhatsApp para completar tu ingreso al grupo.
            </p>
          </div>

          <div className="relative shrink-0 mx-auto lg:mx-0" style={{ '--ring-color': C.emerald }}>
            <div className="cta-ring" />
            <Crest color={C.emerald} Icon={Users} size={110} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ VISTA PRINCIPAL --------------------------- */

function HomeView({ completedMap, onOpenCourse, onOpenNotesCourse }) {
  const totalTopics = courseData.reduce((a, c) => a + c.topics.length, 0);
  const totalClasses = courseData.reduce((a, c) => a + c.topics.reduce((ta, t) => ta + t.classes.length, 0), 0);
  return (
    <div>
      <IntroSection totalCourses={courseData.length} totalTopics={totalTopics} totalClasses={totalClasses} />

      <section className="px-6 md:px-10 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseData.map((course, index) => (
          <CourseCard key={course.id} course={course} completedMap={completedMap} onOpen={onOpenCourse} index={index} />
        ))}
      </section>

      <Reveal>
        <NotesSection onOpenCourse={onOpenNotesCourse} />
      </Reveal>
      <Reveal delay={80}>
        <JoinProjectSection />
      </Reveal>
      <Reveal delay={80}>
        <CommunitySection />
      </Reveal>

      <footer className="px-6 md:px-10 pb-14 text-xs text-center" style={{ color: C.mutedDim }}>
        Kingdom Level · un proyecto de aprendizaje construido por un estudiante de Ingeniería de Sistemas
      </footer>
    </div>
  );
}

/* Nivel 2: temas del curso (video) */
function CourseView({ course, completedMap, onBack, onOpenTopic }) {
  const { total, done } = courseTotals(course, completedMap);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver a los reinos
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
            <span className="flex items-center gap-1"><BookOpen size={14} /> {course.topics.length} temas · {total} clases</span>
            <span className="flex items-center gap-1"><Trophy size={14} /> {pct}% completado</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Temas del curso
      </h3>
      <div className="flex flex-col gap-3">
        {course.topics.map((topic, idx) => {
          const t = topicTotals(course, topic, completedMap);
          const allDone = t.total > 0 && t.done === t.total;
          return (
            <button
              key={topic.id}
              onClick={() => onOpenTopic(course.id, topic.id)}
              className="row-card flex items-center gap-4 p-4 rounded-xl text-left card-in"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', animationDelay: `${idx * 80}ms`, '--row-color': course.color }}
            >
              <div
                className="flex items-center justify-center rounded-lg text-sm font-semibold shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: allDone ? `${C.emerald}22` : C.border,
                  color: allDone ? C.emerald : C.muted,
                  border: `1px solid ${allDone ? C.emerald : '#2E3541'}`,
                }}
              >
                {allDone ? <CheckCircle2 size={18} className="check-pop" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text }} className="text-sm font-medium truncate">
                  Tema {idx + 1}: {topic.title}
                </p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1 mb-2 truncate">{topic.description}</p>
                <MiniBar done={t.done} total={t.total} color={course.color} />
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0" style={{ color: C.muted }}>
                {t.total} clases
              </div>
              <ArrowRight size={16} color={course.color} className="row-arrow shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Nivel 3: clases del tema */
function TopicView({ course, topic, completedMap, onBack, onOpenClass }) {
  const t = topicTotals(course, topic, completedMap);
  const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
  const topicIndex = course.topics.findIndex((tp) => tp.id === topic.id);

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver a temas de {course.title}
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Crest color={course.color} Icon={course.icon} size={78} />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: course.color, letterSpacing: '0.2em' }}>
            {course.title} · Tema {topicIndex + 1}
          </span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mt-2 mb-2">
            {topic.title}
          </h2>
          <p className="text-sm md:text-base mb-4" style={{ color: C.muted }}>{topic.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: C.mutedDim }}>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {t.total} clases</span>
            <span className="flex items-center gap-1"><Trophy size={14} /> {pct}% completado</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Clases del tema
      </h3>
      <div className="flex flex-col gap-3">
        {topic.classes.map((cl, idx) => {
          const done = !!completedMap[`${course.id}-${topic.id}-${cl.id}`];
          return (
            <button
              key={cl.id}
              onClick={() => onOpenClass(course.id, topic.id, cl.id)}
              className="row-card flex items-center gap-4 p-4 rounded-xl text-left card-in"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', animationDelay: `${idx * 80}ms`, '--row-color': course.color }}
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
                {done ? <CheckCircle2 size={18} className="check-pop" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text }} className="text-sm font-medium truncate">
                  Clase {idx + 1}: {cl.title}
                </p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1 truncate">{cl.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0" style={{ color: C.muted }}>
                <Clock size={14} /> {cl.duration}
              </div>
              <Play size={16} color={course.color} className="row-arrow shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Nivel 4: video de la clase, con "Siguientes clases" a la derecha (estilo YouTube) */
function ClassView({ course, topic, activeClass, completedMap, onBack, onOpenClass, onToggleComplete }) {
  const idx = topic.classes.findIndex((cl) => cl.id === activeClass.id);
  const done = !!completedMap[`${course.id}-${topic.id}-${activeClass.id}`];

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-6 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver a {topic.title}
      </button>

      {/* A partir de md (768px) el video queda a la izquierda y "Siguientes clases" a la derecha, como en YouTube.
          Por debajo de ese ancho se apilan verticalmente, igual que en la app móvil de YouTube. */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Columna principal: el video se mantiene aquí, con la descripción justo debajo */}
        <div className="flex-1 min-w-0">
          <div
            className="card-in rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.border}`, aspectRatio: '16/9', background: '#000' }}
          >
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
                {course.title} · {topic.title}
              </span>
              <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-xl md:text-2xl mt-2">
                Clase {idx + 1}: {activeClass.title}
              </h2>
            </div>
            <button
              onClick={() => onToggleComplete(course.id, topic.id, activeClass.id)}
              className="complete-btn btn-tap flex items-center gap-2 text-sm px-4 py-2 rounded-full shrink-0"
              style={{
                background: done ? `${C.emerald}22` : 'transparent',
                border: `1px solid ${done ? C.emerald : C.border}`,
                color: done ? C.emerald : C.muted,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} className={done ? 'check-pop' : ''} /> {done ? 'Completado' : 'Marcar como completado'}
            </button>
          </div>

          {/* Descripción de lo que se avanzará en esta clase, al estilo de la caja de descripción de YouTube */}
          <div className="mt-4 p-4 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>En esta clase avanzaremos:</p>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{activeClass.description}</p>
          </div>
        </div>

        {/* Columna derecha: las siguientes clases de este mismo tema, como la lista "A continuación" de YouTube */}
        <aside className="w-full md:w-80 shrink-0">
          <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-sm mb-3 uppercase">
            Siguientes clases · {topic.title}
          </h3>
          <div className="flex flex-col gap-2" style={{ maxHeight: 480, overflowY: 'auto' }}>
            {topic.classes.map((cl, i) => {
              const isActive = cl.id === activeClass.id;
              const d = !!completedMap[`${course.id}-${topic.id}-${cl.id}`];
              return (
                <button
                  key={cl.id}
                  onClick={() => onOpenClass(course.id, topic.id, cl.id)}
                  className="sidebar-row flex items-center gap-3 p-3 rounded-lg text-left"
                  style={{
                    background: isActive ? '#1B212D' : 'transparent',
                    border: `1px solid ${isActive ? course.color : C.border}`,
                    cursor: 'pointer',
                    '--row-color': course.color,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                    style={{ width: 26, height: 26, background: d ? `${C.emerald}22` : C.border, color: d ? C.emerald : C.muted }}
                  >
                    {d ? <CheckCircle2 size={14} className="check-pop" /> : i + 1}
                  </div>
                  <span className="text-xs flex-1 truncate" style={{ color: isActive ? C.text : C.muted }}>
                    {cl.title}
                  </span>
                  {isActive && <Play size={12} color={course.color} className="shrink-0 icon-twinkle" />}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* El escalafón del reino: muestra los 11 niveles como un camino de progreso,
   resalta dónde está el estudiante hoy y qué falta para el siguiente peldaño. */
function LevelsView({ completedCount, onBack }) {
  const info = getLevelInfo(completedCount);
  const overallPct = TOTAL_CLASSES ? Math.round((completedCount / TOTAL_CLASSES) * 100) : 0;

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver al reino
      </button>

      <div
        className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 md:p-8 rounded-2xl"
        style={{ background: C.surface, border: `1px solid ${C.gold}55` }}
      >
        <Crest color={C.gold} Icon={Trophy} size={78} pulse />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: C.gold, letterSpacing: '0.2em' }}>
            Escalafón del reino
          </span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mt-2 mb-2">
            Nivel {info.level} · {info.title}
          </h2>
          <p className="text-sm md:text-base mb-4" style={{ color: C.muted }}>
            {info.isMaxLevel
              ? 'Completaste todas las clases del reino. No hay nivel más alto que este.'
              : `Te faltan ${info.classesForNext} ${info.classesForNext === 1 ? 'clase' : 'clases'} para llegar a "${LEVELS[info.level]?.title}".`}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: C.mutedDim }}>
            <span className="flex items-center gap-1"><Trophy size={14} /> {info.xp} XP</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {completedCount}/{TOTAL_CLASSES} clases · {overallPct}% del reino</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Camino hacia la leyenda
      </h3>
      <div className="flex flex-col gap-3">
        {LEVELS.map((lvl, idx) => {
          const achieved = completedCount >= lvl.classesNeeded;
          const isCurrent = lvl.level === info.level;
          return (
            <div
              key={lvl.level}
              className="card-in flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: isCurrent ? `${C.gold}14` : C.surface,
                border: `1px solid ${isCurrent ? C.gold : C.border}`,
                boxShadow: isCurrent ? `0 0 0 1px ${C.gold}33, 0 10px 26px -14px ${C.gold}88` : 'none',
                animationDelay: `${idx * 60}ms`,
              }}
            >
              <div
                className={`flex items-center justify-center rounded-full text-sm font-semibold shrink-0 ${isCurrent ? 'crest-pulse' : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  background: achieved ? `${C.gold}22` : C.border,
                  color: achieved ? C.gold : C.mutedDim,
                  border: `1px solid ${achieved ? C.gold : '#2E3541'}`,
                  '--crest-color': C.gold,
                }}
              >
                {achieved ? <CheckCircle2 size={18} className={isCurrent ? '' : 'check-pop'} /> : <Lock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: achieved ? C.text : C.mutedDim }} className="text-sm font-medium truncate">
                  Nivel {lvl.level} · {lvl.title}
                </p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1">
                  {lvl.classesNeeded === 0 ? 'Punto de partida' : `${lvl.classesNeeded} clases completadas`}
                </p>
              </div>
              {isCurrent && (
                <span
                  className="text-xs px-3 py-1 rounded-full shrink-0"
                  style={{ background: `${C.gold}22`, color: C.gold, border: `1px solid ${C.gold}55` }}
                >
                  Estás aquí
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- APP ----------------------------------- */

export default function KingdomLevel() {
  const [view, setView] = useState('home'); // 'home' | 'levels' | 'course' | 'topic' | 'class' | 'notesCourse' | 'notesTopic'
  const [courseId, setCourseId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [notesCourseId, setNotesCourseId] = useState(null);
  const [notesTopicId, setNotesTopicId] = useState(null);
  const [completedMap, setCompletedMap] = useState({});

  const activeCourse = useMemo(() => courseData.find((c) => c.id === courseId) || null, [courseId]);
  const activeTopic = useMemo(
    () => (activeCourse ? activeCourse.topics.find((t) => t.id === topicId) || null : null),
    [activeCourse, topicId]
  );
  const activeClass = useMemo(
    () => (activeTopic ? activeTopic.classes.find((cl) => cl.id === classId) || null : null),
    [activeTopic, classId]
  );

  const activeNotesCourse = useMemo(() => courseData.find((c) => c.id === notesCourseId) || null, [notesCourseId]);
  const activeNotesTopic = useMemo(
    () => (activeNotesCourse ? activeNotesCourse.topics.find((t) => t.id === notesTopicId) || null : null),
    [activeNotesCourse, notesTopicId]
  );

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const { title: rankTitle, level, pct, xp, xpForNext, classesForNext, isMaxLevel } = getLevelInfo(completedCount);

  // Pequeña celebración cuando el estudiante sube de nivel al completar clases.
  const [levelUpToast, setLevelUpToast] = useState(null);
  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (level > prevLevelRef.current) {
      const colors = [C.gold, '#5B8DBF', C.emerald, C.amethyst, '#C1683F', '#B5495B'];
      const particles = Array.from({ length: 10 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 10;
        const distance = 60 + Math.random() * 30;
        return {
          id: i,
          dx: Math.round(Math.cos(angle) * distance),
          dy: Math.round(Math.sin(angle) * distance),
          color: colors[i % colors.length],
        };
      });
      setLevelUpToast({ level, title: rankTitle, particles, isMaxLevel });
      const t = setTimeout(() => setLevelUpToast(null), 3600);
      prevLevelRef.current = level;
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
    return undefined;
  }, [level, rankTitle, isMaxLevel]);

  // --- Navegación conectada al historial del navegador -------------------
  // Aplica un estado de navegación completo (los 6 campos) a los estados de React.
  function applyNavState(next) {
    setView(next.view || 'home');
    setCourseId(next.courseId ?? null);
    setTopicId(next.topicId ?? null);
    setClassId(next.classId ?? null);
    setNotesCourseId(next.notesCourseId ?? null);
    setNotesTopicId(next.notesTopicId ?? null);
  }

  // Dirección de la transición de pantalla ('forward' | 'back'), para que al
  // avanzar en la jerarquía la vista entre desde la derecha y al retroceder
  // (incluido el botón atrás del navegador) entre desde la izquierda.
  const [direction, setDirection] = useState('forward');
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Navega hacia un nuevo estado Y agrega una entrada al historial del navegador,
  // para que el botón "atrás" (físico, del navegador o del gesto en celular)
  // pueda deshacer ese paso en vez de salir de la página.
  function goTo(next) {
    const currentDepth = VIEW_DEPTH[viewRef.current] ?? 0;
    const nextDepth = VIEW_DEPTH[next.view] ?? 0;
    setDirection(nextDepth >= currentDepth ? 'forward' : 'back');
    applyNavState(next);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(next, '', hashForNav(next));
    }
  }

  // Al montar: deja "inicio" como primera entrada del historial y escucha el
  // botón atrás/adelante para sincronizar la vista con el historial real.
  useEffect(() => {
    const homeState = { view: 'home', courseId: null, topicId: null, classId: null, notesCourseId: null, notesTopicId: null };
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(homeState, '', '#inicio');
    }
    function handlePopState(event) {
      const next = event.state || homeState;
      const currentDepth = VIEW_DEPTH[viewRef.current] ?? 0;
      const nextDepth = VIEW_DEPTH[next.view] ?? 0;
      setDirection(nextDepth >= currentDepth ? 'forward' : 'back');
      applyNavState(next);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goHome() {
    goTo({ view: 'home', courseId: null, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function openLevels() {
    goTo({ view: 'levels', courseId: null, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function openCourse(id) {
    goTo({ view: 'course', courseId: id, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function backToCourse() {
    goTo({ view: 'course', courseId, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function openTopic(cId, tId) {
    goTo({ view: 'topic', courseId: cId, topicId: tId, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function backToTopic() {
    goTo({ view: 'topic', courseId, topicId, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function openClass(cId, tId, clId) {
    goTo({ view: 'class', courseId: cId, topicId: tId, classId: clId, notesCourseId: null, notesTopicId: null });
  }
  function toggleComplete(cId, tId, clId) {
    const key = `${cId}-${tId}-${clId}`;
    setCompletedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function openNotesCourse(cId) {
    goTo({ view: 'notesCourse', courseId: null, topicId: null, classId: null, notesCourseId: cId, notesTopicId: null });
  }
  function backToNotesCourse() {
    goTo({ view: 'notesCourse', courseId: null, topicId: null, classId: null, notesCourseId, notesTopicId: null });
  }
  function openNotesTopic(cId, tId) {
    goTo({ view: 'notesTopic', courseId: null, topicId: null, classId: null, notesCourseId: cId, notesTopicId: tId });
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
        .animate-fadein { animation: fadein 0.4s ease both; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-in { opacity: 0; animation: cardIn 0.55s cubic-bezier(.2,.8,.2,1) forwards; }

        @keyframes floatBlob {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(22px, -18px) scale(1.08); }
        }
        .ambient-blob { animation: floatBlob 9s ease-in-out infinite alternate; }

        @keyframes crestGlow {
          0%, 100% { filter: drop-shadow(0 0 0px var(--crest-color, transparent)); }
          50% { filter: drop-shadow(0 0 10px var(--crest-color, transparent)); }
        }
        .crest-pulse { animation: crestGlow 2.8s ease-in-out infinite; }
        .course-crest { transition: transform 0.3s ease; }
        .course-card:hover .course-crest { transform: scale(1.08) rotate(-3deg); }

        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          60%, 100% { transform: translateX(260%); }
        }
        .bar-shimmer {
          position: absolute;
          top: 0; left: 0; height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          transform: translateX(-120%);
          animation: shimmer 2.4s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .icon-twinkle { animation: twinkle 2.4s ease-in-out infinite; display: inline-flex; }

        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
          50% { transform: translateY(-14px) rotate(15deg); opacity: 0.9; }
        }
        .sparkle-float { animation: sparkleFloat 4s ease-in-out infinite; }

        @keyframes ringPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.25; }
          50% { transform: scale(1.18); opacity: 0.5; }
        }
        .cta-ring {
          position: absolute;
          inset: -20px;
          border-radius: 9999px;
          background: radial-gradient(circle, var(--ring-color) 0%, transparent 70%);
          filter: blur(6px);
          animation: ringPulse 2.6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes spinRing { to { transform: rotate(360deg); } }
        .video-glow-frame { position: relative; z-index: 1; }
        .video-glow-frame::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 20px;
          background: conic-gradient(from 0deg, ${C.gold}, #5B8DBF, ${C.emerald}, ${C.amethyst}, ${C.gold});
          animation: spinRing 6s linear infinite;
          z-index: -1;
        }

        @keyframes introIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .intro-crest-in { opacity: 0; animation: introIn 0.7s cubic-bezier(.2,.8,.2,1) 0.05s forwards; }
        .intro-title-in { opacity: 0; animation: introIn 0.7s cubic-bezier(.2,.8,.2,1) 0.2s forwards; }
        .intro-sub-in { opacity: 0; animation: introIn 0.7s cubic-bezier(.2,.8,.2,1) 0.35s forwards; }
        .intro-video-in { opacity: 0; animation: introIn 0.8s cubic-bezier(.2,.8,.2,1) 0.5s forwards; }
        .intro-stats-in { opacity: 0; animation: introIn 0.7s cubic-bezier(.2,.8,.2,1) 0.7s forwards; }

        .community-cta { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .community-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -8px rgba(216,166,87,0.35); }
        .community-cta:active { transform: translateY(0) scale(0.97); }
        .btn-tap:active { transform: scale(0.96); }

        .join-card { transition: transform 0.2s ease, border-color 0.2s ease; }
        .join-card:hover { transform: translateY(-3px); border-color: ${C.gold}; }

        button:focus-visible, a:focus-visible {
          outline: 2px solid ${C.gold};
          outline-offset: 2px;
        }

        html { scroll-behavior: smooth; }

        /* Revelado al hacer scroll, usado en las secciones debajo del pliegue */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(.2,.8,.2,1), transform 0.7s cubic-bezier(.2,.8,.2,1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        /* Filas de listas (temas, clases, apuntes): avanzan hacia la derecha y brillan con el color del curso */
        .row-card {
          transition: transform 0.2s cubic-bezier(.2,.8,.2,1), border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .row-card:hover {
          transform: translateX(4px);
          border-color: var(--row-color, #D8A657) !important;
          box-shadow: 0 10px 26px -16px var(--row-color, #D8A657);
        }
        .row-card:active { transform: translateX(2px) scale(0.99); }
        .row-arrow { transition: transform 0.2s ease; }
        .row-card:hover .row-arrow { transform: translateX(3px); }

        .sidebar-row { transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease; }
        .sidebar-row:hover { background: #171C26 !important; transform: translateX(2px); }

        /* Botones "volver" */
        .back-btn { transition: color 0.2s ease; }
        .back-btn:hover { color: ${C.gold} !important; }
        .back-chevron { transition: transform 0.2s ease; }
        .back-btn:hover .back-chevron { transform: translateX(-3px); }

        /* Logo del header */
        .logo-btn .logo-crest { transition: transform 0.3s ease; }
        .logo-btn:hover .logo-crest { transform: rotate(-6deg) scale(1.06); }

        .level-badge { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .level-badge:hover { transform: translateY(-1px); border-color: ${C.gold} !important; box-shadow: 0 8px 20px -10px ${C.gold}66; }
        .level-badge:active { transform: translateY(0) scale(0.98); }

        /* Pequeño rebote cuando algo se marca como completado */
        @keyframes checkPop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-pop { animation: checkPop 0.4s cubic-bezier(.34,1.56,.64,1) both; }

        /* Festejo al subir de nivel */
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, 16px) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .level-up-toast { animation: toastIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes burstOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; }
        }
        .level-up-particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          animation: burstOut 0.9s ease-out forwards;
          pointer-events: none;
        }

        /* Transición direccional entre pantallas: avanzar entra desde la derecha,
           retroceder (incluido el botón atrás del navegador) entra desde la izquierda. */
        @keyframes slideInForward {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateX(-28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-transition {
          animation-duration: 0.4s;
          animation-timing-function: cubic-bezier(.2,.8,.2,1);
          animation-fill-mode: both;
        }
        .nav-forward { animation-name: slideInForward; }
        .nav-back { animation-name: slideInBack; }

        /* Pequeño destello alrededor del trofeo cada vez que se completa (o descompleta) una clase */
        @keyframes xpPing {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .xp-ping {
          position: absolute;
          inset: -7px;
          border-radius: 9999px;
          background: radial-gradient(circle, ${C.gold} 0%, transparent 70%);
          animation: xpPing 0.7s ease-out;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadein,
          .card-in,
          .intro-crest-in,
          .intro-title-in,
          .intro-sub-in,
          .intro-video-in,
          .intro-stats-in,
          .reveal,
          .nav-transition {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .ambient-blob,
          .crest-pulse,
          .bar-shimmer,
          .icon-twinkle,
          .cta-ring,
          .sparkle-float,
          .video-glow-frame::before,
          .check-pop,
          .level-up-toast,
          .level-up-particle,
          .xp-ping {
            animation: none !important;
          }
          html { scroll-behavior: auto; }
          * { transition: none !important; }
        }
      `}</style>

      <Header
        level={level}
        rankTitle={rankTitle}
        pct={pct}
        onHome={goHome}
        completedCount={completedCount}
        classesForNext={classesForNext}
        isMaxLevel={isMaxLevel}
        onOpenLevels={openLevels}
      />

      <div
        key={`${view}-${courseId || ''}-${topicId || ''}-${classId || ''}-${notesCourseId || ''}-${notesTopicId || ''}`}
        className={`nav-transition nav-${direction}`}
      >
        {view === 'home' && (
          <HomeView completedMap={completedMap} onOpenCourse={openCourse} onOpenNotesCourse={openNotesCourse} />
        )}

        {view === 'levels' && <LevelsView completedCount={completedCount} onBack={goHome} />}

        {view === 'course' && activeCourse && (
          <CourseView course={activeCourse} completedMap={completedMap} onBack={goHome} onOpenTopic={openTopic} />
        )}

        {view === 'topic' && activeCourse && activeTopic && (
          <TopicView
            course={activeCourse}
            topic={activeTopic}
            completedMap={completedMap}
            onBack={backToCourse}
            onOpenClass={openClass}
          />
        )}

        {view === 'class' && activeCourse && activeTopic && activeClass && (
          <ClassView
            course={activeCourse}
            topic={activeTopic}
            activeClass={activeClass}
            completedMap={completedMap}
            onBack={backToTopic}
            onOpenClass={openClass}
            onToggleComplete={toggleComplete}
          />
        )}

        {view === 'notesCourse' && activeNotesCourse && (
          <NotesCourseView course={activeNotesCourse} onBack={goHome} onOpenTopic={openNotesTopic} />
        )}

        {view === 'notesTopic' && activeNotesCourse && activeNotesTopic && (
          <NotesTopicView course={activeNotesCourse} topic={activeNotesTopic} onBack={backToNotesCourse} />
        )}
      </div>

      {levelUpToast && (
        <div className="level-up-toast" style={{ position: 'fixed', bottom: 24, left: '50%', zIndex: 50 }}>
          <div className="relative flex items-center gap-3 px-5 py-3 rounded-full" style={{ background: C.surface, border: `1px solid ${C.gold}`, boxShadow: `0 10px 34px -6px ${C.gold}66` }}>
            {levelUpToast.particles.map((p) => (
              <span
                key={p.id}
                className="level-up-particle"
                style={{ background: p.color, '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }}
              />
            ))}
            <Trophy size={18} color={C.gold} className="icon-twinkle" />
            <div className="text-left leading-tight">
              <p style={{ color: C.text }} className="text-xs font-semibold">
                {levelUpToast.isMaxLevel ? '¡Nivel máximo alcanzado!' : '¡Subiste de nivel!'}
              </p>
              <p style={{ color: C.gold }} className="text-xs">Nivel {levelUpToast.level} · {levelUpToast.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}