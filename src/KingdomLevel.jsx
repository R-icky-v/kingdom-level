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
  ChevronRight,
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
  Flame,
  Rocket,
  Layers,
  Award,
  Compass,
  TrendingUp,
  Landmark,
  PenLine,
  HelpCircle,
  XCircle,
  Repeat,
  Circle,
  X,
  Search,
  Maximize2,
  Timer,
  Pause,
  RotateCcw,
  SkipForward,
  Minus,
  Plus,
  ChevronDown,
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

// Link para "Compartir" de un PDF en Google Drive (el que te da Drive al hacer
// clic en Compartir → Copiar enlace). Puedes usar el mismo PDF para todos los
// temas, o poner uno distinto por tema — el visor lo convierte solo al
// formato que se puede mostrar embebido dentro de la página.
const SE_C2 = 'https://drive.google.com/file/d/1SOzZKbzuGkqwJnlkK372-P2YeM6ielD2/view?usp=sharing';
const NOTES_PDF_PLACEHOLDER = 'https://drive.google.com/file/d/1ndDMN-wjG71j0zi9wU1fkBIYPqVlOa51/view?usp=sharing';

// Convierte un link normal de "Compartir" de Google Drive
// (https://drive.google.com/file/d/ID/view?usp=sharing) en el link especial
// que Drive permite mostrar embebido dentro de un <iframe>. Si el link no
// tiene el formato esperado, devuelve null y la vista muestra un aviso en
// vez de romperse.
function driveShareLinkToEmbedUrl(shareUrl) {
  if (!shareUrl) return null;
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const fileId = match ? match[1] : null;
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

// Link de invitación a tu grupo de WhatsApp. Lo obtienes desde:
// WhatsApp → tu grupo → Datos del grupo → Invitar mediante enlace → Copiar enlace.
const WHATSAPP_LINK = 'https://chat.whatsapp.com/TU-ENLACE-DE-INVITACION-AQUI';

// Formularios de postulación (ej. Google Forms) para sumarse al proyecto.
const APPLY_TEACH_LINK = 'https://forms.gle/TU-FORMULARIO-PARA-DAR-CLASES-AQUI';
const APPLY_CONTRIBUTE_LINK = 'https://forms.gle/TU-FORMULARIO-PARA-APORTAR-APUNTES-AQUI';

const courseData = [
  {
    id: 'sistemaseconomicos',
    title: 'Sistemas Económicos',
    tagline: 'Las leyes invisibles que mueven el oro del reino',
    description:
      'Entiende cómo funcionan los mercados, cuánto vale el dinero a lo largo del tiempo y cómo evaluar si un proyecto de inversión realmente conviene.',
    color: '#3FA396',
    icon: Landmark,
    instructor: 'Tu nombre aquí',
    seal: 'Materia de universidad', // sello fijo del curso, se ve directo en su tarjeta
    topics: [
      {
        id: 1,
        title: 'Mercados, funciones y equilibrio',
        description: 'Cómo se comportan los mercados: quién compra, quién vende, y en qué punto se ponen de acuerdo.',
        classes: [
          {
            id: 1,
            title: 'Introducción a los mercados, la oferta y la demanda',
            duration: '14:20',
            description: 'Qué es un mercado y cómo se representan la oferta y la demanda con funciones.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: '¿Qué representa la curva de demanda?',
                options: [
                  'La cantidad que los vendedores quieren vender a cada precio',
                  'La cantidad que los compradores están dispuestos a comprar a cada precio',
                  'El costo de producción',
                  'La inflación del país',
                ],
                correctIndex: 1,
                explanation: 'La demanda refleja el comportamiento de los compradores: normalmente, a menor precio, mayor cantidad demandada.',
              },
              {
                question: '¿Qué ocurre generalmente cuando sube el precio de un bien (todo lo demás igual)?',
                options: [
                  'La cantidad demandada tiende a subir',
                  'La cantidad demandada tiende a bajar',
                  'La oferta desaparece',
                  'No hay ningún efecto',
                ],
                correctIndex: 1,
                explanation: 'Es la ley de la demanda: a mayor precio, la cantidad demandada tiende a disminuir, manteniendo todo lo demás constante.',
              },
              {
                question: '¿Qué pasa generalmente con la curva de oferta cuando sube el precio de un bien?',
                options: [
                  'La cantidad ofrecida tiende a subir',
                  'La cantidad ofrecida tiende a bajar',
                  'La oferta se vuelve vertical',
                  'No cambia nada',
                ],
                correctIndex: 0,
                explanation: 'La ley de la oferta dice que, a mayor precio, los vendedores están dispuestos a ofrecer una mayor cantidad.',
              },
            ],
          },
          { id: 2, title: 'Funciones de oferta y demanda', duration: '15:40', description: 'Cómo construir e interpretar las ecuaciones que describen el comportamiento de compradores y vendedores.', videoId: DEMO_VIDEO_ID },
          { id: 3, title: 'Equilibrio de mercado', duration: '13:15', description: 'Cómo encontrar el punto donde la oferta y la demanda se cruzan, y qué significa económicamente.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Antes de hablar de dinero o inversiones, hay que entender cómo se comportan los mercados: quién compra, quién vende, y en qué punto se ponen de acuerdo.',
          keyPoints: [
            'Cómo graficar e interpretar curvas de oferta y demanda.',
            'Ejercicios resueltos de funciones de oferta y demanda.',
            'Cómo calcular el punto de equilibrio de mercado paso a paso.',
            'Glosario de términos básicos de microeconomía.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 2,
        title: 'Las medidas de elasticidad',
        description: 'Qué tan sensible es el mercado a los cambios de precio, y por qué eso importa para tomar decisiones.',
        classes: [
          { id: 1, title: 'Elasticidad precio de la demanda', duration: '15:00', description: 'Qué tan sensible es la cantidad demandada ante cambios en el precio, y cómo calcularla.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Elasticidad de la oferta y elasticidad cruzada', duration: '14:10', description: 'Otras medidas de elasticidad y qué nos dicen sobre bienes sustitutos y complementarios.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'La elasticidad te dice qué tan sensible es el mercado a los cambios de precio, y es una de las herramientas más usadas para tomar decisiones económicas.',
          keyPoints: [
            'Fórmulas de elasticidad precio, cruzada y de la oferta.',
            'Ejemplos de bienes elásticos e inelásticos de la vida real.',
            'Ejercicios resueltos de cálculo de elasticidad.',
            'Tabla resumen de cómo interpretar cada resultado.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 3,
        title: 'Teoría de la demanda del consumidor',
        description: 'Por qué los consumidores eligen lo que eligen, explicado con curvas de indiferencia y presupuesto.',
        classes: [
          { id: 1, title: 'Utilidad y preferencias del consumidor', duration: '16:05', description: 'Cómo los consumidores deciden qué comprar según sus preferencias y su presupuesto.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Curvas de indiferencia y restricción presupuestaria', duration: '15:30', description: 'Cómo se combinan las preferencias y el ingreso disponible para explicar las decisiones de consumo.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Por qué los consumidores eligen lo que eligen: las curvas de indiferencia y la restricción presupuestaria explican matemáticamente cómo se toman esas decisiones.',
          keyPoints: [
            'Cómo construir curvas de indiferencia.',
            'La restricción presupuestaria explicada con ejemplos numéricos.',
            'Ejercicios de maximización de utilidad.',
            'Errores comunes al interpretar las preferencias del consumidor.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 4,
        title: 'Valor del dinero en el tiempo',
        description: 'La base de toda la ingeniería económica: por qué un monto de dinero no vale igual hoy que en el futuro.',
        classes: [
          { id: 1, title: 'El concepto de valor del dinero en el tiempo', duration: '13:45', description: 'Por qué un monto de dinero hoy no vale lo mismo que ese mismo monto en el futuro.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Interés simple y compuesto', duration: '16:20', description: 'Las dos formas básicas de calcular cómo crece el dinero a lo largo del tiempo.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'La base de toda la ingeniería económica: un mismo monto de dinero no vale igual hoy que en el futuro, y aquí verás por qué y cómo calcularlo.',
          keyPoints: [
            'Diferencia entre interés simple y compuesto, con ejemplos.',
            'Línea de tiempo de flujos de efectivo explicada paso a paso.',
            'Ejercicios resueltos de cálculo de interés.',
            'Fórmulas clave listas para consulta rápida.',
          ],
          notesLink: SE_C2,
        },
      },
      {
        id: 5,
        title: 'Tasa de interés nominal y efectiva y capitalización continua',
        description: 'No todas las tasas de interés significan lo mismo: cómo distinguir la que se anuncia de la que realmente se paga.',
        classes: [
          { id: 1, title: 'Tasa nominal vs. tasa efectiva', duration: '14:50', description: 'La diferencia entre la tasa que se anuncia y la que realmente se paga o se gana.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Capitalización continua', duration: '13:30', description: 'Qué pasa cuando el interés se capitaliza de forma continua, y cómo calcularlo.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'No todas las tasas de interés significan lo mismo: aquí aprenderás a distinguir la tasa que se anuncia de la que realmente se paga o se gana.',
          keyPoints: [
            'Cómo convertir una tasa nominal en efectiva.',
            'Ejercicios resueltos con distintos periodos de capitalización.',
            'Qué es la capitalización continua y cuándo se usa.',
            'Tabla comparativa de tasas nominales vs. efectivas.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 6,
        title: 'Comparación del valor presente, futuro y anual equivalente',
        description: 'Tres formas distintas de mirar el mismo dinero, y cómo pasar de una a otra para comparar proyectos.',
        classes: [
          { id: 1, title: 'Valor presente', duration: '15:10', description: 'Cómo traer flujos de dinero futuros al presente para poder compararlos.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Valor futuro', duration: '13:55', description: 'Cómo proyectar el valor de un monto de dinero hacia el futuro.', videoId: DEMO_VIDEO_ID },
          { id: 3, title: 'Valor anual equivalente', duration: '14:40', description: 'Cómo convertir flujos de dinero irregulares en una serie uniforme anual.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Tres formas distintas de mirar el mismo dinero: aquí verás cómo pasar de una a otra para poder comparar proyectos de inversión de forma justa.',
          keyPoints: [
            'Fórmulas de valor presente, futuro y anual equivalente.',
            'Ejercicios resueltos convirtiendo entre los tres.',
            'Cuándo conviene usar cada método según el problema.',
            'Ejemplos aplicados a decisiones de inversión reales.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 7,
        title: 'Amortización de deudas',
        description: 'Cómo se paga realmente una deuda a lo largo del tiempo, cuota por cuota.',
        classes: [
          { id: 1, title: 'Tablas de amortización', duration: '16:00', description: 'Cómo se construye una tabla de amortización y qué información muestra.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Métodos de amortización de deudas', duration: '15:20', description: 'Distintas formas de pagar una deuda a lo largo del tiempo y sus diferencias.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'Cómo se paga realmente una deuda a lo largo del tiempo: qué parte de cada cuota es interés y qué parte es capital, y cómo armar tu propia tabla de amortización.',
          keyPoints: [
            'Cómo construir una tabla de amortización desde cero.',
            'Comparación entre distintos métodos de amortización.',
            'Ejercicios resueltos de cálculo de cuotas.',
            'Plantilla de tabla de amortización lista para usar.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
      {
        id: 8,
        title: 'Métodos determinísticos en análisis de inversiones',
        description: 'Cómo decidir, con información conocida con certeza, si un proyecto de inversión conviene.',
        classes: [
          { id: 1, title: 'Introducción al análisis de inversiones', duration: '14:15', description: 'Cómo evaluar si un proyecto de inversión conviene o no, con información conocida con certeza.', videoId: DEMO_VIDEO_ID },
          { id: 2, title: 'Criterios de decisión: VAN y TIR', duration: '17:00', description: 'Los indicadores más usados para decidir si conviene invertir en un proyecto.', videoId: DEMO_VIDEO_ID },
        ],
        notes: {
          summary: 'El cierre del curso: cómo usar todo lo anterior para decidir, con información conocida con certeza, si un proyecto de inversión realmente conviene.',
          keyPoints: [
            'Cómo calcular el Valor Actual Neto (VAN) paso a paso.',
            'Cómo calcular la Tasa Interna de Retorno (TIR).',
            'Ejercicios resueltos de evaluación de proyectos.',
            'Criterios para decidir entre varios proyectos de inversión.',
          ],
          notesLink: NOTES_PDF_PLACEHOLDER,
        },
      },
    ],
  },
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
          {
            id: 1,
            title: 'Introducción a la lógica de programación',
            duration: '12:30',
            description: 'Qué es un algoritmo y cómo aprender a pensar como una computadora.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: '¿Qué es un algoritmo?',
                options: [
                  'Un lenguaje de programación específico',
                  'Una secuencia ordenada de pasos para resolver un problema',
                  'Un tipo de dato',
                  'Un error en el código',
                ],
                correctIndex: 1,
                explanation: 'Un algoritmo es independiente del lenguaje: es la lógica, el orden de los pasos, lo que realmente importa.',
              },
              {
                question: "¿Por qué decimos que una computadora 'piensa' de forma lógica?",
                options: [
                  'Porque tiene inteligencia propia',
                  'Porque sigue instrucciones exactas, sin ambigüedad',
                  'Porque aprende de sus errores sola',
                  'Porque puede improvisar soluciones',
                ],
                correctIndex: 1,
                explanation: 'Las computadoras no interpretan intenciones: ejecutan exactamente lo que se les indica, paso a paso.',
              },
              {
                question: '¿Cuál de estas NO es una característica deseable de un buen algoritmo?',
                options: [
                  'Ser preciso y sin ambigüedades',
                  'Tener un número finito de pasos',
                  'Depender de adivinar lo que quiere el usuario',
                  'Producir un resultado esperado',
                ],
                correctIndex: 2,
                explanation: 'Un algoritmo no debe depender de adivinar intenciones: cada paso tiene que estar completamente definido.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          {
            id: 1,
            title: 'Arrays y listas enlazadas',
            duration: '14:00',
            description: 'Las dos formas más básicas de almacenar colecciones de datos en memoria.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: '¿Cuál es la principal ventaja de un array frente a una lista enlazada?',
                options: [
                  'Acceso directo a cualquier elemento por su posición',
                  'Tamaño siempre dinámico',
                  'No ocupa memoria',
                  'Se ordena solo',
                ],
                correctIndex: 0,
                explanation: 'Los arrays permiten acceso directo (por índice) en tiempo constante, algo que una lista enlazada no puede hacer sin recorrerla.',
              },
              {
                question: '¿Qué caracteriza a una lista enlazada?',
                options: [
                  'Todos sus elementos están en posiciones consecutivas de memoria',
                  'Cada elemento apunta al siguiente',
                  'Tiene un tamaño fijo desde su creación',
                  'No permite agregar elementos',
                ],
                correctIndex: 1,
                explanation: 'Cada nodo de una lista enlazada guarda su valor y una referencia (puntero) al siguiente nodo.',
              },
              {
                question: '¿Qué operación es generalmente más costosa en un array que en una lista enlazada?',
                options: [
                  'Acceder a un elemento por su posición',
                  'Insertar un elemento al principio',
                  'Recorrer todos los elementos',
                  'Leer el primer elemento',
                ],
                correctIndex: 1,
                explanation: 'Insertar al principio de un array obliga a desplazar todos los demás elementos; en una lista enlazada basta con cambiar una referencia.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          {
            id: 1,
            title: 'Modelo entidad-relación',
            duration: '13:20',
            description: 'Cómo traducir un problema del mundo real en tablas y relaciones.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: "En un modelo entidad-relación, ¿qué representa una 'entidad'?",
                options: [
                  'Una acción del sistema',
                  'Un objeto o concepto del mundo real que queremos guardar (ej. un cliente)',
                  'Una consulta SQL',
                  'Un tipo de índice',
                ],
                correctIndex: 1,
                explanation: "Una entidad es algo identificable y relevante para el sistema, como 'Cliente', 'Producto' o 'Pedido'.",
              },
              {
                question: "¿Qué muestra una 'relación' entre dos entidades?",
                options: [
                  'Cuál entidad es más importante',
                  'Cómo se conectan o interactúan dos entidades entre sí',
                  'El color de la tabla',
                  'El nombre de la base de datos',
                ],
                correctIndex: 1,
                explanation: "Las relaciones describen cómo se asocian las entidades, por ejemplo: un Cliente 'realiza' un Pedido.",
              },
              {
                question: '¿Qué es un atributo dentro de una entidad?',
                options: [
                  'Otra entidad relacionada',
                  'Una característica o dato que describe a la entidad (ej. nombre, edad)',
                  'Una tabla completa',
                  'Una consulta SQL',
                ],
                correctIndex: 1,
                explanation: 'Los atributos son los datos concretos que describen a una entidad, por ejemplo: un Cliente tiene nombre, correo y teléfono.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          {
            id: 1,
            title: 'Clases y objetos',
            duration: '13:10',
            description: 'El vocabulario básico de la programación orientada a objetos.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: '¿Qué es una clase en programación orientada a objetos?',
                options: [
                  'Una instancia específica de un objeto',
                  'Un molde o plantilla que define atributos y comportamientos',
                  'Una función suelta',
                  'Un tipo de base de datos',
                ],
                correctIndex: 1,
                explanation: 'La clase define la estructura; el objeto es una instancia concreta creada a partir de esa clase.',
              },
              {
                question: '¿Qué es un objeto?',
                options: [
                  'El nombre de una clase',
                  'Una instancia concreta de una clase, con sus propios datos',
                  'Un error de compilación',
                  'Una variable global',
                ],
                correctIndex: 1,
                explanation: "Si 'Perro' es la clase, 'Firulais' sería un objeto: una instancia concreta con sus propios valores.",
              },
              {
                question: '¿Qué representan los métodos de una clase?',
                options: [
                  'Los datos que almacena el objeto',
                  'Las acciones o comportamientos que el objeto puede realizar',
                  'El nombre del archivo',
                  'Un tipo de variable',
                ],
                correctIndex: 1,
                explanation: 'Los métodos son las funciones definidas dentro de una clase: representan lo que un objeto puede hacer.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          {
            id: 1,
            title: 'Modelo OSI y TCP/IP',
            duration: '15:00',
            description: 'Las capas que hacen posible la comunicación entre dispositivos.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: '¿Para qué sirve el modelo OSI?',
                options: [
                  'Para acelerar internet',
                  'Para organizar en capas las funciones de la comunicación entre dispositivos',
                  'Para diseñar interfaces gráficas',
                  'Para escribir bases de datos',
                ],
                correctIndex: 1,
                explanation: 'El modelo OSI divide la comunicación en 7 capas, cada una con una responsabilidad específica.',
              },
              {
                question: '¿Cuántas capas tiene el modelo OSI?',
                options: ['4', '5', '7', '10'],
                correctIndex: 2,
                explanation: 'El modelo OSI tiene 7 capas, desde la física (cables, señales) hasta la de aplicación (lo que usa el usuario final).',
              },
              {
                question: '¿Qué capa del modelo OSI se encarga de las aplicaciones que usa directamente el usuario (como el navegador)?',
                options: ['La capa física', 'La capa de aplicación', 'La capa de red', 'La capa de enlace de datos'],
                correctIndex: 1,
                explanation: 'La capa de aplicación es la más cercana al usuario: ahí operan protocolos como HTTP, que usan programas como el navegador.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          {
            id: 1,
            title: 'Ciclo de vida del software',
            duration: '13:40',
            description: 'Las etapas por las que pasa todo proyecto, del análisis al mantenimiento.',
            videoId: DEMO_VIDEO_ID,
            quiz: [
              {
                question: "¿Qué es el 'ciclo de vida del software'?",
                options: [
                  'El tiempo que dura una reunión de equipo',
                  'Las etapas por las que pasa un proyecto, desde el análisis hasta el mantenimiento',
                  'La vida útil de una computadora',
                  'El lenguaje de programación usado',
                ],
                correctIndex: 1,
                explanation: 'Incluye etapas como análisis, diseño, desarrollo, pruebas, despliegue y mantenimiento.',
              },
              {
                question: '¿Por qué es importante la etapa de mantenimiento?',
                options: [
                  'Porque ahí se factura el proyecto',
                  'Porque el software sigue necesitando ajustes y correcciones después de entregado',
                  'Porque ahí se contrata al equipo',
                  'No es una etapa real',
                ],
                correctIndex: 1,
                explanation: "Ningún software queda 'terminado para siempre': sigue necesitando correcciones, mejoras y actualizaciones.",
              },
              {
                question: '¿En qué etapa del ciclo de vida se identifica qué necesita realmente el usuario?',
                options: ['Mantenimiento', 'Análisis de requisitos', 'Despliegue', 'Pruebas'],
                correctIndex: 1,
                explanation: 'El análisis de requisitos es donde se define qué problema hay que resolver, antes de empezar a diseñar o programar.',
              },
            ],
          },
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
          notesLink: NOTES_PDF_PLACEHOLDER,
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
// Cuántas clases (videos) pide CADA nivel, contando desde cero — el "gap" que
// se reinicia cada vez que subes de nivel. El índice 0 (Nivel 1) no aplica,
// es el punto de partida. El índice 1 es el Nivel 2 y así sucesivamente.
// Con las 27 clases que existen hoy en el sitio se puede llegar hasta media
// tabla; los niveles más altos quedan como meta a futuro, para cuando
// agregues más cursos y clases.
const LEVEL_GAPS = [0, 2, 4, 8, 10, 15, 20, 25, 30, 35, 40];

const LEVELS = LEVEL_TITLES.map((title, i) => ({
  level: i + 1,
  title,
  gap: LEVEL_GAPS[i] || 0,
  classesNeeded: LEVEL_GAPS.slice(0, i + 1).reduce((a, b) => a + b, 0),
}));

/* ---------------------------- DISEÑO POR NIVEL ---------------------------- */
/* Sistema de "looks" por nivel: a medida que el estudiante sube, el escudo que
   lo representa (en el header y en el escalafón) puede lucir cada vez más
   trabajado, hasta un diseño mágico y único en el nivel máximo (Leyenda de
   Kingdom Level). Por ahora solo está definido el Nivel 1 (el diseño base,
   sobrio, tal como se ve hoy) — los niveles 2 al 11 se irán agregando de a
   uno en los siguientes pasos, cada uno mejorando sobre el anterior.
   getLevelVisual() es el único lugar que hay que tocar para eso: cuando se
   agregue la entrada del nivel 2, 3, etc. a LEVEL_VISUALS, el header y el
   escalafón la van a usar automáticamente sin tocar nada más. */
const LEVEL_VISUALS = {
  1: {
    tier: 'base',
    label: 'Diseño base',
    crestColor: C.gold,
    ringEffect: false, // sin anillo mágico alrededor del escudo todavía
    extraGlow: false, // sin brillo extra todavía
    barShimmer: false, // barra de XP lisa, sin brillo
    unlockMessage: null,
  },
  2: {
    tier: 'apprentice',
    label: 'Primer brillo mágico',
    crestColor: C.goldBright,
    ringEffect: true, // primer anillo mágico girando alrededor del escudo
    extraGlow: true, // resplandor propio detrás del escudo
    barShimmer: true, // la barra de XP ahora tiene un brillo que la recorre
    sparkles: false,
    unlockMessage: 'Tu insignia empezó a brillar con un halo mágico.',
  },
  3: {
    tier: 'squire',
    label: 'Constelación del escudero',
    crestColor: '#F6E2AE', // dorado aún más luminoso, casi blanco-dorado
    ringEffect: true,
    extraGlow: true,
    barShimmer: true,
    sparkles: true, // NUEVO: chispas mágicas orbitando el escudo
    unlockMessage: 'Pequeñas chispas de magia empezaron a orbitar tu escudo.',
  },
  4: {
    tier: 'page',
    label: 'Insignia de la corte',
    crestColor: '#F8E9C2', // dorado casi blanco, la base del escudo
    accentColor: '#B98CE0', // NUEVO: degradado a violeta cortesano
    ringEffect: true,
    doubleRing: true, // NUEVO: segundo anillo girando en sentido contrario
    secondaryColor: '#B98CE0',
    extraGlow: true,
    barShimmer: true,
    sparkles: true,
    shine: true, // NUEVO: barrido de brillo cruzando el escudo
    unlockMessage: 'Tu escudo fue admitido en la corte: ahora luce dos anillos y un brillo violeta.',
  },
  5: {
    tier: 'novice-knight',
    label: 'Guardia de acero',
    crestColor: '#F8E9C2', // el mismo dorado casi blanco del nivel 4
    accentColor: '#7FA8D9', // NUEVO: el violeta cortesano da paso al acero del caballero
    ringEffect: true,
    doubleRing: true,
    secondaryColor: '#7FA8D9',
    extraGlow: true,
    barShimmer: true,
    sparkles: true,
    shine: true,
    rim: true, // NUEVO: remache de escudo con 8 destellos alrededor, como un caballero de verdad
    unlockMessage: 'Un remache de acero rodea tu escudo: ya eres un caballero novicio.',
  },
};

function getLevelVisual(level) {
  return LEVEL_VISUALS[level] || LEVEL_VISUALS[1];
}

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
  // Contador del nivel actual: cuántas clases llevas de este nivel (arranca en 0
  // apenas subes) y cuántas pide el siguiente nivel en total. No es acumulado
  // desde el inicio del reino, sino desde la última vez que subiste de nivel.
  const classesDoneInLevel = completedCount - current.classesNeeded;
  const classesNeededInLevel = next ? next.classesNeeded - current.classesNeeded : 0;
  const pct = next ? Math.min(100, Math.round((classesDoneInLevel / classesNeededInLevel) * 100)) : 100;
  return {
    level: current.level,
    title: current.title,
    pct,
    xp: completedCount * XP_PER_CLASS,
    xpForNext: next ? next.classesNeeded * XP_PER_CLASS : current.classesNeeded * XP_PER_CLASS,
    classesForNext: next ? next.classesNeeded - completedCount : 0,
    classesDoneInLevel,
    classesNeededInLevel,
    isMaxLevel: !next,
  };
}

/* -------------------------------- RACHA ----------------------------------- */
/* Racha de días de estudio, al estilo Duolingo: se cuenta un día como "activo"
   la primera vez que el estudiante marca una clase como completada ese día.
   Si al día siguiente vuelve a estudiar, la racha sube; si deja pasar más de
   un día sin actividad, se rompe y vuelve a empezar en 1. */

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(`${dateStrA}T00:00:00`);
  const b = new Date(`${dateStrB}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

// Calcula la racha "efectiva" a mostrar: si pasaron 2 días o más desde la
// última actividad, la racha ya está rota aunque el número guardado todavía
// diga otra cosa (porque no hubo actividad nueva que la recalculara).
function getEffectiveStreak(streak) {
  if (!streak || !streak.lastActiveDate) return 0;
  const diff = daysBetween(streak.lastActiveDate, todayStr());
  return diff <= 1 ? streak.currentStreak : 0;
}

function isActiveToday(streak) {
  return !!streak && streak.lastActiveDate === todayStr();
}

/* ---------------------------- PLANIFICADOR --------------------------------- */
/* Helpers de fecha para el planificador semanal: arrancan la semana en lunes
   y trabajan siempre con fechas locales (mismo criterio que la racha). */

const PLANNER_WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PLANNER_WEEKDAY_FULL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const PLANNER_MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatLongDate(d) {
  const weekday = PLANNER_WEEKDAY_FULL[(d.getDay() + 6) % 7]; // getDay(): 0=domingo..6=sábado → lunes=0
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${label} ${d.getDate()} de ${PLANNER_MONTH_LABELS[d.getMonth()]}`;
}

function getMonthGridDays(monthCursor) {
  const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const start = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i)); // 6 semanas fijas, la grilla nunca "salta" de tamaño
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo, 1 = lunes, ...
  const diff = (day === 0 ? -6 : 1) - day; // retrocede hasta el lunes de esa semana
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/* ------------------------------ INSIGNIAS ---------------------------------- */
/* Insignias extra, aparte del nivel: celebran logros puntuales (el primer
   tema, el primer curso, una racha larga, etc.) en vez de solo el progreso
   acumulado. Una vez desbloqueada, una insignia queda guardada para siempre,
   aunque después el estudiante desmarque alguna clase. */

function computeBadgeContext(completedMap, streak) {
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  let anyTopicComplete = false;
  let anyCourseComplete = false;
  let coursesTouched = 0;
  const courseCompletionMap = {};

  courseData.forEach((course) => {
    let courseDone = 0;
    let courseTotal = 0;
    let touched = false;
    course.topics.forEach((topic) => {
      let topicDone = 0;
      topic.classes.forEach((cl) => {
        courseTotal += 1;
        const done = !!completedMap[`${course.id}-${topic.id}-${cl.id}`];
        if (done) {
          courseDone += 1;
          topicDone += 1;
          touched = true;
        }
      });
      if (topic.classes.length > 0 && topicDone === topic.classes.length) anyTopicComplete = true;
    });
    if (touched) coursesTouched += 1;
    const courseFullyDone = courseTotal > 0 && courseDone === courseTotal;
    courseCompletionMap[course.id] = courseFullyDone;
    if (courseFullyDone) anyCourseComplete = true;
  });

  return {
    completedCount,
    overallPct: TOTAL_CLASSES ? Math.round((completedCount / TOTAL_CLASSES) * 100) : 0,
    anyTopicComplete,
    anyCourseComplete,
    coursesTouched,
    courseCompletionMap,
    longestStreak: (streak && streak.longestStreak) || 0,
  };
}

const BADGES = [
  {
    id: 'first-class',
    title: 'Primeros pasos',
    description: 'Completaste tu primera clase.',
    icon: Rocket,
    color: C.gold,
    check: (ctx) => ctx.completedCount >= 1,
  },
  {
    id: 'first-topic',
    title: 'Tema dominado',
    description: 'Terminaste todas las clases de un tema.',
    icon: Layers,
    color: '#5B8DBF',
    check: (ctx) => ctx.anyTopicComplete,
  },
  {
    id: 'first-course',
    title: 'Curso conquistado',
    description: 'Terminaste un curso completo.',
    icon: Award,
    color: C.emerald,
    check: (ctx) => ctx.anyCourseComplete,
  },
  {
    id: 'explorer',
    title: 'Explorador del reino',
    description: `Diste al menos una clase en cada uno de los ${courseData.length} cursos.`,
    icon: Compass,
    color: C.amethyst,
    check: (ctx) => ctx.coursesTouched >= courseData.length,
  },
  {
    id: 'streak-3',
    title: 'Racha de 3 días',
    description: 'Estudiaste 3 días seguidos.',
    icon: Flame,
    color: '#E08D4B',
    check: (ctx) => ctx.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Racha de 7 días',
    description: 'Estudiaste 7 días seguidos.',
    icon: Flame,
    color: '#FF6B4A',
    check: (ctx) => ctx.longestStreak >= 7,
  },
  {
    id: 'halfway',
    title: 'Mitad del camino',
    description: 'Completaste la mitad de las clases del sitio.',
    icon: TrendingUp,
    color: '#B5495B',
    check: (ctx) => ctx.overallPct >= 50,
  },
  {
    id: 'all-kingdom',
    title: 'Todo el reino',
    description: 'Completaste el 100% de las clases del sitio.',
    icon: Crown,
    color: C.gold,
    check: (ctx) => ctx.overallPct >= 100,
  },
];

/* --------------------------- REPASO ESPACIADO ------------------------------ */
/* Tarjetas de repetición espaciada: se generan solas a partir de las preguntas
   de quiz que ya existen en courseData (pregunta = frente, respuesta correcta
   + explicación = dorso). Así, cualquier clase a la que le agregues un `quiz`
   automáticamente le suma tarjetas al repaso, sin escribir nada aparte.

   El algoritmo es un sistema Leitner simple (como el de Anki, simplificado):
   cada tarjeta tiene una "caja" del 0 al 5. Calificarla mejor la sube de caja
   y la programa más lejos en el futuro; calificarla "otra vez" la manda de
   vuelta a la caja 0. Los intervalos son en días desde la última repetición. */

const ALL_FLASHCARDS = (() => {
  const cards = [];
  courseData.forEach((course) => {
    course.topics.forEach((topic) => {
      topic.classes.forEach((cl) => {
        if (cl.quiz && cl.quiz.length) {
          cl.quiz.forEach((q, qi) => {
            cards.push({
              id: `${course.id}-${topic.id}-${cl.id}-q${qi}`,
              courseId: course.id,
              courseTitle: course.title,
              courseColor: course.color,
              topicId: topic.id,
              topicTitle: topic.title,
              classTitle: cl.title,
              front: q.question,
              back: q.explanation ? `${q.options[q.correctIndex]}\n\n${q.explanation}` : q.options[q.correctIndex],
            });
          });
        }
      });
    });
  });
  return cards;
})();

const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
const LEITNER_MAX_BOX = LEITNER_INTERVALS_DAYS.length - 1;

function getCardProgress(flashcardProgress, cardId) {
  return flashcardProgress[cardId] || { box: 0, dueDate: null };
}

// Sin fecha registrada (nunca repasada) siempre cuenta como "pendiente hoy".
function isCardDueToday(progress, today) {
  return !progress.dueDate || progress.dueDate <= today;
}

function nextCardProgress(progress, rating) {
  let box = progress.box || 0;
  if (rating === 'again') box = 0;
  else if (rating === 'good') box = Math.min(box + 1, LEITNER_MAX_BOX);
  else if (rating === 'easy') box = Math.min(box + 2, LEITNER_MAX_BOX);

  const due = new Date();
  due.setDate(due.getDate() + LEITNER_INTERVALS_DAYS[box]);
  const dueDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
  return { box, dueDate };
}

/* ------------------------------ BUSCADOR ----------------------------------- */
/* El "Buscador del reino": un solo índice armado una vez a partir de
   courseData, con cursos, temas, clases y apuntes. Buscar es solo filtrar
   ese índice por texto — no hace falta ninguna librería aparte. */

const SEARCH_INDEX = (() => {
  const index = [];
  courseData.forEach((course) => {
    index.push({
      type: 'course',
      id: `course-${course.id}`,
      title: course.title,
      subtitle: course.tagline,
      searchText: `${course.title} ${course.tagline} ${course.description}`.toLowerCase(),
      color: course.color,
      icon: course.icon,
      courseId: course.id,
    });
    course.topics.forEach((topic) => {
      index.push({
        type: 'topic',
        id: `topic-${course.id}-${topic.id}`,
        title: topic.title,
        subtitle: course.title,
        searchText: `${topic.title} ${topic.description}`.toLowerCase(),
        color: course.color,
        icon: course.icon,
        courseId: course.id,
        topicId: topic.id,
      });
      if (topic.notes) {
        index.push({
          type: 'notes',
          id: `notes-${course.id}-${topic.id}`,
          title: `Apuntes: ${topic.title}`,
          subtitle: course.title,
          searchText: `${topic.notes.summary || ''} ${(topic.notes.keyPoints || []).join(' ')}`.toLowerCase(),
          color: course.color,
          icon: FileText,
          courseId: course.id,
          topicId: topic.id,
        });
      }
      topic.classes.forEach((cl) => {
        index.push({
          type: 'class',
          id: `class-${course.id}-${topic.id}-${cl.id}`,
          title: cl.title,
          subtitle: `${course.title} · ${topic.title}`,
          searchText: `${cl.title} ${cl.description}`.toLowerCase(),
          color: course.color,
          icon: Play,
          courseId: course.id,
          topicId: topic.id,
          classId: cl.id,
        });
      });
    });
  });
  return index;
})();

function searchKingdom(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.searchText.includes(q)).slice(0, 20);
}

/* --------------------------- TIEMPO DE ESTUDIO ------------------------------ */
/* Cada vez que una sesión de enfoque del Pomodoro termina de verdad (no si se
   salta a mano), se guarda un registro: { date, minutes }. A partir de esa
   lista, calculamos cuánto se estudió hoy, esta semana, este mes, y el
   detalle día por día para el gráfico de barras. */

function formatStudyMinutes(total) {
  if (total <= 0) return '0 min';
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function computeStudyStats(studyLog) {
  const today = todayStr();
  const weekDayKeys = Array.from({ length: 7 }, (_, i) => formatDateKey(addDays(startOfWeek(new Date()), i)));
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = {
    todayMinutes: 0, todaySessions: 0,
    weekMinutes: 0, weekSessions: 0,
    monthMinutes: 0, monthSessions: 0,
    totalMinutes: 0, totalSessions: 0,
  };

  studyLog.forEach((entry) => {
    stats.totalMinutes += entry.minutes;
    stats.totalSessions += 1;
    if (entry.date === today) {
      stats.todayMinutes += entry.minutes;
      stats.todaySessions += 1;
    }
    if (weekDayKeys.includes(entry.date)) {
      stats.weekMinutes += entry.minutes;
      stats.weekSessions += 1;
    }
    if (entry.date.startsWith(monthPrefix)) {
      stats.monthMinutes += entry.minutes;
      stats.monthSessions += 1;
    }
  });

  return stats;
}

function getDailyStudyTotals(studyLog, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const dateKey = formatDateKey(d);
    const minutes = studyLog.filter((e) => e.date === dateKey).reduce((sum, e) => sum + e.minutes, 0);
    result.push({ date: d, dateKey, minutes });
  }
  return result;
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
const VIEW_DEPTH = { home: 0, levels: 1, flashcards: 1, planner: 1, studylog: 1, course: 1, topic: 2, class: 3, notesCourse: 1, notesTopic: 2 };

function hashForNav(next) {
  switch (next.view) {
    case 'levels':
      return '#niveles';
    case 'flashcards':
      return '#repaso';
    case 'planner':
      return '#planificador';
    case 'studylog':
      return '#tiempo-de-estudio';
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

const SPARKLE_POSITIONS = [
  { top: '-6%', right: '2%', delay: '0s' },
  { bottom: '4%', left: '-8%', delay: '0.5s' },
  { top: '38%', right: '-10%', delay: '1s' },
];

const RIM_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function Crest({
  color,
  Icon,
  size = 56,
  pulse = false,
  ring = false,
  glow = false,
  sparkles = false,
  doubleRing = false,
  secondaryColor = null,
  accentColor = null,
  shine = false,
  rim = false,
  className = '',
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size * 1.12 }}>
      {glow && <span className="level-extra-glow" style={{ '--glow-color-lvl': color }} />}
      {ring && <span className="level-ring-effect" style={{ '--ring-color-lvl': color }} />}
      {doubleRing && <span className="level-ring-effect-secondary" style={{ '--ring2-color-lvl': secondaryColor || color }} />}
      {sparkles &&
        SPARKLE_POSITIONS.map((p, i) => (
          <span
            key={i}
            className="level-sparkle-dot"
            style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right, animationDelay: p.delay, '--sparkle-color-lvl': color }}
          />
        ))}
      {rim &&
        RIM_ANGLES.map((angle, i) => (
          <span
            key={angle}
            className="level-rim-stud"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${Math.round(size * 0.62)}px)`,
              animationDelay: `${i * 0.15}s`,
              '--rim-color-lvl': secondaryColor || color,
            }}
          />
        ))}
      <div
        className={`relative flex items-center justify-center crest ${pulse ? 'crest-pulse' : ''} ${className}`}
        style={{
          width: size,
          height: size * 1.12,
          zIndex: 1,
          background: accentColor
            ? `linear-gradient(150deg, ${color} 0%, ${accentColor} 100%)`
            : `linear-gradient(150deg, ${color} 0%, ${darken(color, 0.4)} 100%)`,
          clipPath: 'polygon(50% 0%, 100% 18%, 100% 60%, 50% 100%, 0% 60%, 0% 18%)',
          boxShadow: `0 6px 16px ${color}40`,
          '--crest-color': color,
        }}
      >
        <Icon size={Math.round(size * 0.42)} color="#0A0C10" strokeWidth={2.3} />
        {shine && <span className="crest-shine" />}
      </div>
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

function BadgeMedallion({ badge, unlocked, index = 0 }) {
  const Icon = badge.icon;
  return (
    <div
      className="card-in flex flex-col items-center text-center gap-2 p-4 rounded-xl"
      style={{
        background: C.surface,
        border: `1px solid ${unlocked ? badge.color : C.border}`,
        opacity: unlocked ? 1 : 0.5,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div
        className={`flex items-center justify-center rounded-full ${unlocked ? 'crest-pulse' : ''}`}
        style={{
          width: 48,
          height: 48,
          background: unlocked ? `${badge.color}22` : C.border,
          border: `1px solid ${unlocked ? badge.color : '#2E3541'}`,
          '--crest-color': badge.color,
        }}
      >
        {unlocked ? <Icon size={22} color={badge.color} /> : <Lock size={18} color={C.mutedDim} />}
      </div>
      <p className="text-xs font-medium" style={{ color: unlocked ? C.text : C.mutedDim }}>{badge.title}</p>
      <p className="text-xs leading-snug" style={{ color: C.mutedDim }}>{badge.description}</p>
    </div>
  );
}

function Header({
  level,
  rankTitle,
  pct,
  onHome,
  completedCount = 0,
  classesDoneInLevel = 0,
  classesNeededInLevel = 0,
  isMaxLevel = false,
  onOpenLevels,
  progressLoaded = true,
  streak = null,
  pomodoro,
  onPomodoroToggleOpen,
  onPomodoroToggleRun,
  onPomodoroReset,
  onPomodoroSkip,
  onPomodoroChangeFocus,
  onPomodoroChangeBreak,
  onSearchNavigate,
  onOpenFlashcards,
  onOpenPlanner,
}) {
  const visual = getLevelVisual(level);
  const effectiveStreak = progressLoaded ? getEffectiveStreak(streak) : 0;
  const activeToday = progressLoaded && isActiveToday(streak);
  const streakColor = effectiveStreak > 0 ? (activeToday ? '#FF6B4A' : '#E08D4B') : C.mutedDim;
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

      <div className="flex items-center gap-3 flex-wrap">
        <SearchWidget onNavigate={onSearchNavigate} />

        <button
          onClick={onOpenFlashcards}
          className="pomodoro-pill flex items-center gap-2 rounded-full px-3 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
          title="Repaso espaciado (flashcards)"
        >
          <Repeat size={16} color={C.emerald} />
          <span className="text-xs font-semibold" style={{ color: C.text }}>¡Estudiemos!</span>
        </button>

        <button
          onClick={onOpenPlanner}
          className="pomodoro-pill flex items-center gap-2 rounded-full px-3 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
          title="Planificador de estudio"
        >
          <CalendarDays size={16} color={C.gold} />
          <span className="text-xs font-semibold" style={{ color: C.text }}>¡Planifica!</span>
        </button>

        <div
          className="flex items-center gap-2 rounded-full px-3 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
          title={
            !progressLoaded
              ? 'Cargando racha…'
              : effectiveStreak > 0
              ? activeToday
                ? `Ya estudiaste hoy · racha de ${effectiveStreak} ${effectiveStreak === 1 ? 'día' : 'días'}`
                : `Estudia hoy para no perder tu racha de ${effectiveStreak} ${effectiveStreak === 1 ? 'día' : 'días'}`
              : 'Completa una clase para empezar tu racha'
          }
        >
          <Flame size={16} color={streakColor} className={activeToday ? 'flame-flicker' : ''} />
          <span className="text-xs font-semibold" style={{ color: effectiveStreak > 0 ? C.text : C.mutedDim }}>
            {progressLoaded ? effectiveStreak : '–'}
          </span>
        </div>

        <button
          onClick={onOpenLevels}
          className="level-badge flex items-center gap-3 rounded-full px-4 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
        >
          <div key={completedCount} className="relative flex items-center justify-center" style={{ '--ping-color': visual.crestColor }}>
            <span className="xp-ping" />
            {visual.extraGlow && <span className="level-extra-glow" style={{ '--glow-color-lvl': visual.crestColor }} />}
            {visual.ringEffect && <span className="level-ring-effect" style={{ '--ring-color-lvl': visual.crestColor }} />}
            <Trophy size={16} color={visual.crestColor} style={{ position: 'relative', zIndex: 1 }} />
          </div>
          <div className="flex flex-col items-start" style={{ minWidth: 130 }}>
            <span className="text-xs font-semibold" style={{ color: C.text }}>
              {progressLoaded ? `Nv. ${level} · ${rankTitle}` : 'Cargando progreso…'}
            </span>
            <div className="w-full rounded-full mt-1" style={{ height: 4, background: C.border, position: 'relative', overflow: 'hidden' }}>
              <div
                className="rounded-full"
                style={{ height: 4, width: progressLoaded ? `${pct}%` : '100%', opacity: progressLoaded ? 1 : 0.35, background: `linear-gradient(90deg, ${visual.crestColor}, ${C.goldBright})`, transition: 'width 0.4s ease', position: 'relative', overflow: 'hidden' }}
              >
                {progressLoaded && visual.barShimmer && <span className="bar-shimmer" />}
              </div>
            </div>
            <span className="mt-1" style={{ color: C.mutedDim, fontSize: '10px' }}>
              {!progressLoaded ? '\u00A0' : isMaxLevel ? 'Nivel máximo alcanzado' : `${classesDoneInLevel}/${classesNeededInLevel} clases de este nivel`}
            </span>
          </div>
        </button>

        <PomodoroWidget
          mode={pomodoro.mode}
          secondsLeft={pomodoro.secondsLeft}
          running={pomodoro.running}
          sessionsDone={pomodoro.sessionsDone}
          open={pomodoro.open}
          flash={pomodoro.flash}
          focusMinutes={pomodoro.focusMinutes}
          breakMinutes={pomodoro.breakMinutes}
          onToggleOpen={onPomodoroToggleOpen}
          onToggleRun={onPomodoroToggleRun}
          onReset={onPomodoroReset}
          onSkip={onPomodoroSkip}
          onChangeFocusMinutes={onPomodoroChangeFocus}
          onChangeBreakMinutes={onPomodoroChangeBreak}
        />
      </div>
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

function CourseSeal({ label }) {
  return (
    <div className="course-seal" title={label}>
      <div className="course-seal-ring">
        <GraduationCap size={17} color="#241B08" strokeWidth={2.4} />
      </div>
      <span className="course-seal-label">{label}</span>
    </div>
  );
}

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
        position: 'relative',
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
      {course.seal && <CourseSeal label={course.seal} />}
      <div className="flex items-start justify-between">
        <Crest color={course.color} Icon={course.icon} size={52} className="course-crest" />
      </div>
      <div>
        <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-1">
          {course.title}
        </h3>
        <p className="text-sm mb-2" style={{ color: C.muted }}>{course.tagline}</p>
        <span
          className="inline-flex text-xs px-3 py-1 rounded-full"
          style={{ background: `${course.color}22`, color: course.color, border: `1px solid ${course.color}55` }}
        >
          {course.topics.length} temas · {total} clases
        </span>
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
  const embedUrl = driveShareLinkToEmbedUrl(notes.notesLink);
  const pdfWrapRef = useRef(null);

  function handleFullscreenPdf() {
    const el = pdfWrapRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); // Safari
  }

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

      {/* Apuntes completos en PDF, alojados en Google Drive pero mostrados aquí mismo, sin salir de la página */}
      <div className="rounded-2xl p-4 md:p-6" style={{ background: C.surface, border: `1px solid ${course.color}55` }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Crest color={course.color} Icon={FileText} size={44} />
            <div>
              <p style={{ color: C.text }} className="text-sm font-semibold">Apuntes completos del tema</p>
              <p style={{ color: C.mutedDim }} className="text-xs">PDF en Google Drive, visible aquí mismo</p>
            </div>
          </div>
          {embedUrl && (
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={handleFullscreenPdf}
                className="text-xs flex items-center gap-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: course.color, padding: 0 }}
              >
                <Maximize2 size={13} /> Pantalla completa
              </button>
              <a
                href={notes.notesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1"
                style={{ color: course.color }}
              >
                Abrir en una pestaña nueva <ArrowUpRight size={13} />
              </a>
            </div>
          )}
        </div>

        {embedUrl ? (
          <div
            ref={pdfWrapRef}
            className="pdf-viewer-wrap rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.border}`, height: 'min(85vh, 900px)', background: '#1c1c1c' }}
          >
            <iframe
              src={embedUrl}
              title={`Apuntes de ${topic.title}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay"
            />
          </div>
        ) : (
          <div className="rounded-xl p-8 text-center flex flex-col items-center gap-3" style={{ border: `1px dashed ${C.border}` }}>
            <FileText size={28} color={C.mutedDim} />
            <p className="text-sm" style={{ color: C.mutedDim }}>Todavía no hay un PDF configurado para este tema.</p>
          </div>
        )}
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

/* Vitrina de "Repaso espaciado" en la portada: invita a repasar sin entrar
   todavía a la sesión, mostrando cuántas tarjetas hay pendientes hoy. */
function FlashcardsSection({ onOpen }) {
  return (
    <section className="px-6 md:px-10 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8"
        style={{ background: `linear-gradient(135deg, ${C.surface} 0%, #171C26 100%)`, border: `1px solid ${C.border}` }}
      >
        <AmbientGlow variant="community" />
        <Crest color={C.emerald} Icon={Repeat} size={72} pulse className="relative" />
        <div className="flex-1 min-w-0 relative">
          <div className="flex items-center gap-2 mb-3" style={{ color: C.emerald }}>
            <Repeat size={16} />
            <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>Repaso espaciado</span>
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text, lineHeight: 1.25 }} className="text-2xl md:text-3xl mb-4 max-w-xl">
            No dejes que se te olvide lo que ya aprendiste
          </h2>
          <p className="text-sm md:text-base max-w-xl mb-6" style={{ color: C.muted }}>
            Tarjetas cortas generadas a partir de los mini quiz de cada clase. Vos calificás qué tan bien las sabías
            y el sistema decide solo cuándo te las vuelve a mostrar — lo que dominás aparece cada vez más
            espaciado, lo que te cuesta vuelve pronto.
          </p>
          <button
            onClick={onOpen}
            className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.emerald}, #79CF9C)`, color: '#0A0C10' }}
          >
            <Repeat size={16} /> Ir al repaso
          </button>
        </div>
      </div>
    </section>
  );
}

/* Vitrina del planificador en la portada, mismo patrón que las otras secciones. */
function PlannerSection({ onOpen }) {
  return (
    <section className="px-6 md:px-10 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8"
        style={{ background: `linear-gradient(135deg, ${C.surface} 0%, #171C26 100%)`, border: `1px solid ${C.border}` }}
      >
        <AmbientGlow variant="hero" />
        <Crest color={C.gold} Icon={CalendarDays} size={72} pulse className="relative" />
        <div className="flex-1 min-w-0 relative">
          <div className="flex items-center gap-2 mb-3" style={{ color: C.gold }}>
            <CalendarDays size={16} />
            <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>Planificador de estudio</span>
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text, lineHeight: 1.25 }} className="text-2xl md:text-3xl mb-4 max-w-xl">
            Decide hoy cuándo vas a estudiar cada cosa
          </h2>
          <p className="text-sm md:text-base max-w-xl mb-6" style={{ color: C.muted }}>
            Organiza tu semana curso por curso — o agrega algo tuyo, fuera de Kingdom Level. Marca cada sesión como
            hecha a medida que avanzas.
          </p>
          <button
            onClick={onOpen}
            className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, color: '#0A0C10' }}
          >
            <CalendarDays size={16} /> Planificar mi semana
          </button>
        </div>
      </div>
    </section>
  );
}

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

function HomeView({ completedMap, onOpenCourse, onOpenNotesCourse, onOpenFlashcards, onOpenPlanner }) {
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
        <FlashcardsSection onOpen={onOpenFlashcards} />
      </Reveal>
      <Reveal delay={80}>
        <PlannerSection onOpen={onOpenPlanner} />
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
/* Cuaderno personal del estudiante: aparte de los apuntes oficiales del tema,
   cada clase tiene su propio espacio de notas privadas. Se guarda solo, con un
   pequeño retraso mientras escribe, y nunca se pierde texto al cambiar de
   clase rápido (se guarda lo pendiente antes de salir). */
/* Mini quiz opcional al final de una clase: es solo para reforzar, no bloquea
   nada. Cada clase decide si tiene quiz agregando un arreglo `quiz` con sus
   preguntas en courseData; las que no lo tienen simplemente no muestran esta
   sección. Las respuestas no se guardan entre visitas a propósito: es un
   repaso rápido, no una evaluación con historial. */
function ClassQuiz({ quiz }) {
  const [answers, setAnswers] = useState({});

  function selectAnswer(qIndex, optIndex) {
    setAnswers((prev) => (prev[qIndex] !== undefined ? prev : { ...prev, [qIndex]: optIndex }));
  }

  function resetQuiz() {
    setAnswers({});
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = quiz.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const allAnswered = answeredCount === quiz.length;

  return (
    <div className="mt-4 p-4 md:p-5 rounded-xl" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-semibold flex items-center gap-2" style={{ color: C.muted }}>
          <HelpCircle size={14} color={C.gold} /> Mini quiz — opcional, para reforzar
        </p>
        {allAnswered && (
          <span className="text-xs font-semibold" style={{ color: correctCount === quiz.length ? C.emerald : C.mutedDim }}>
            {correctCount}/{quiz.length} correctas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {quiz.map((q, qi) => {
          const selected = answers[qi];
          const answered = selected !== undefined;
          return (
            <div key={qi}>
              <p className="text-sm mb-2" style={{ color: C.text }}>{qi + 1}. {q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex;
                  const isSelectedWrong = answered && oi === selected && !isCorrect;
                  let optStyle = { border: `1px solid ${C.border}`, background: 'transparent', color: C.muted };
                  if (answered && isCorrect) optStyle = { border: `1px solid ${C.emerald}`, background: `${C.emerald}18`, color: C.text };
                  else if (isSelectedWrong) optStyle = { border: '1px solid #B5495B', background: '#B5495B18', color: C.text };
                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      disabled={answered}
                      className="quiz-option text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2"
                      style={{ ...optStyle, cursor: answered ? 'default' : 'pointer' }}
                    >
                      {answered && isCorrect && <CheckCircle2 size={14} color={C.emerald} className="shrink-0" />}
                      {isSelectedWrong && <XCircle size={14} color="#E08D95" className="shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {answered && q.explanation && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: C.mutedDim }}>{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount > 0 && (
        <button
          onClick={resetQuiz}
          className="text-xs mt-4"
          style={{ color: C.mutedDim, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Reintentar quiz
        </button>
      )}
    </div>
  );
}

function PersonalNotebook({ noteKey, value, onSave }) {
  const [draft, setDraft] = useState(value || '');
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const pendingRef = useRef(null); // { key, value, timer }

  function flushPending() {
    if (pendingRef.current) {
      const { key, value: pendingValue, timer } = pendingRef.current;
      clearTimeout(timer);
      onSave(key, pendingValue);
      pendingRef.current = null;
    }
  }

  useEffect(() => {
    flushPending(); // por si veníamos de otra clase con algo sin guardar todavía
    setDraft(value || '');
    setStatus('idle');
    return () => {
      flushPending(); // y al salir de esta clase, tampoco perdemos lo último escrito
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteKey]);

  function handleChange(e) {
    const text = e.target.value;
    setDraft(text);
    setStatus('saving');
    if (pendingRef.current) clearTimeout(pendingRef.current.timer);
    const timer = setTimeout(() => {
      onSave(noteKey, text);
      setStatus('saved');
      pendingRef.current = null;
    }, 700);
    pendingRef.current = { key: noteKey, value: text, timer };
  }

  return (
    <div className="mt-4 rounded-xl p-4 personal-notebook" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-xs font-semibold flex items-center gap-2" style={{ color: C.muted }}>
          <PenLine size={14} color={C.gold} /> Mis apuntes de esta clase
        </p>
        <span className="text-xs" style={{ color: status === 'saving' ? C.mutedDim : C.emerald }}>
          {status === 'saving' ? 'Guardando…' : status === 'saved' ? 'Guardado ✓' : ''}
        </span>
      </div>
      <textarea
        value={draft}
        onChange={handleChange}
        placeholder="Escribe aquí lo que quieras recordar de esta clase. Solo tú lo puedes ver — es tu cuaderno propio, aparte de los apuntes oficiales del tema."
        className="notebook-textarea w-full text-sm"
        rows={5}
      />
    </div>
  );
}

function ClassView({ course, topic, activeClass, completedMap, onBack, onOpenClass, onToggleComplete, personalNotes = {}, onSaveNote = () => {} }) {
  const idx = topic.classes.findIndex((cl) => cl.id === activeClass.id);
  const done = !!completedMap[`${course.id}-${topic.id}-${activeClass.id}`];
  const noteKey = `${course.id}-${topic.id}-${activeClass.id}`;

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

          {/* Mini quiz opcional, solo si esta clase tiene preguntas cargadas */}
          {activeClass.quiz && activeClass.quiz.length > 0 && <ClassQuiz key={noteKey} quiz={activeClass.quiz} />}

          {/* Cuaderno personal del estudiante, aparte de los apuntes oficiales del tema */}
          <PersonalNotebook key={noteKey} noteKey={noteKey} value={personalNotes[noteKey]} onSave={onSaveNote} />
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
function LevelsView({ completedCount, completedMap, streak, unlockedBadges, onBack, onResetProgress }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const info = getLevelInfo(completedCount);
  const overallPct = TOTAL_CLASSES ? Math.round((completedCount / TOTAL_CLASSES) * 100) : 0;
  const visual = getLevelVisual(info.level);
  const effectiveStreak = getEffectiveStreak(streak);

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
        style={{ background: C.surface, border: `1px solid ${visual.crestColor}55` }}
      >
        <Crest
          color={visual.crestColor}
          Icon={Trophy}
          size={78}
          pulse
          ring={visual.ringEffect}
          glow={visual.extraGlow}
          sparkles={visual.sparkles}
          doubleRing={visual.doubleRing}
          secondaryColor={visual.secondaryColor}
          accentColor={visual.accentColor}
          shine={visual.shine}
          rim={visual.rim}
        />
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
            <span className="flex items-center gap-1">
              <Flame size={14} color={effectiveStreak > 0 ? '#FF6B4A' : C.mutedDim} /> Racha de {effectiveStreak} {effectiveStreak === 1 ? 'día' : 'días'}
            </span>
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
          const rowVisual = getLevelVisual(lvl.level);
          return (
            <div
              key={lvl.level}
              className="card-in flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: isCurrent ? `${rowVisual.crestColor}14` : C.surface,
                border: `1px solid ${isCurrent ? rowVisual.crestColor : C.border}`,
                boxShadow: isCurrent ? `0 0 0 1px ${rowVisual.crestColor}33, 0 10px 26px -14px ${rowVisual.crestColor}88` : 'none',
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
                  '--crest-color': rowVisual.crestColor,
                }}
              >
                {achieved ? <CheckCircle2 size={18} className={isCurrent ? '' : 'check-pop'} /> : <Lock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: achieved ? C.text : C.mutedDim }} className="text-sm font-medium truncate">
                  Nivel {lvl.level} · {lvl.title}
                </p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1">
                  {lvl.level === 1
                    ? 'Punto de partida'
                    : isCurrent && info.isMaxLevel
                    ? 'Nivel máximo alcanzado'
                    : isCurrent
                    ? `${info.classesDoneInLevel}/${lvl.gap} clases de este nivel`
                    : `Pide ${lvl.gap} ${lvl.gap === 1 ? 'clase' : 'clases'} (desde el nivel anterior)`}
                </p>
              </div>
              {isCurrent && (
                <span
                  className="text-xs px-3 py-1 rounded-full shrink-0"
                  style={{ background: `${rowVisual.crestColor}22`, color: rowVisual.crestColor, border: `1px solid ${rowVisual.crestColor}55` }}
                >
                  Estás aquí
                </span>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-1 mt-10">
        Insignias del reino
      </h3>
      <p className="text-xs mb-4" style={{ color: C.mutedDim }}>
        Logros aparte del nivel: una vez que los consigues, son tuyos para siempre.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map((badge, idx) => (
          <BadgeMedallion key={badge.id} badge={badge} unlocked={!!unlockedBadges[badge.id]} index={idx} />
        ))}
      </div>

      <div className="mt-10 pt-6 flex flex-col items-center gap-3 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="text-xs"
            style={{ color: C.mutedDim, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Reiniciar mi progreso
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 animate-fadein">
            <p className="text-xs" style={{ color: C.muted }}>
              Esto borra todas las clases completadas y las insignias que dependen de ellas. Tu racha de días no se ve afectada. No se puede deshacer.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onResetProgress();
                  setConfirmingReset(false);
                }}
                className="text-xs px-4 py-2 rounded-full"
                style={{ background: '#4A1F24', color: '#F2A6AC', border: '1px solid #6E2A31', cursor: 'pointer' }}
              >
                Sí, reiniciar
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="text-xs px-4 py-2 rounded-full"
                style={{ background: 'transparent', color: C.mutedDim, border: `1px solid ${C.border}`, cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Tarjetas de repetición espaciada: vista general por curso + sesión de
   repaso con volteo de tarjeta. El progreso (caja/fecha) es lo único que se
   guarda entre visitas; la cola de la sesión en curso es solo local. */
function FlashcardsView({ flashcardProgress, onRate, onBack }) {
  const [session, setSession] = useState(null); // null = vista general

  const today = todayStr();
  const dueCards = ALL_FLASHCARDS.filter((card) => isCardDueToday(getCardProgress(flashcardProgress, card.id), today));

  function startSession(cards) {
    if (cards.length === 0) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setSession({ queue: shuffled, index: 0, showBack: false, total: shuffled.length, reviewedCount: 0, complete: false });
  }

  function flipCard() {
    setSession((s) => ({ ...s, showBack: true }));
  }

  function handleRate(rating) {
    const card = session.queue[session.index];
    onRate(card.id, rating);

    if (rating === 'again') {
      const queue = [...session.queue];
      const [item] = queue.splice(session.index, 1);
      const insertAt = Math.min(queue.length, session.index + 3);
      queue.splice(insertAt, 0, item);
      setSession((s) => ({ ...s, queue, showBack: false }));
      return;
    }

    setSession((s) => {
      const reviewedCount = s.reviewedCount + 1;
      if (s.index + 1 >= s.queue.length) {
        return { ...s, complete: true, reviewedCount };
      }
      return { ...s, index: s.index + 1, showBack: false, reviewedCount };
    });
  }

  // --- Pantalla de cierre de sesión ---
  if (session && session.complete) {
    return (
      <div className="px-6 md:px-10 pb-20">
        <div className="max-w-md mx-auto text-center mt-16 card-in">
          <Crest color={C.emerald} Icon={Trophy} size={72} pulse />
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl mt-6 mb-2">
            ¡Repaso completado!
          </h2>
          <p className="text-sm mb-8" style={{ color: C.muted }}>
            Repasaste {session.reviewedCount} {session.reviewedCount === 1 ? 'tarjeta' : 'tarjetas'}.
          </p>
          <button
            onClick={() => setSession(null)}
            className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.emerald}, #79CF9C)`, color: '#0A0C10' }}
          >
            Volver al repaso
          </button>
        </div>
      </div>
    );
  }

  // --- Sesión de repaso activa (tarjeta con volteo) ---
  if (session) {
    const card = session.queue[session.index];
    return (
      <div className="px-6 md:px-10 pb-20">
        <button
          onClick={() => setSession(null)}
          className="back-btn flex items-center gap-2 text-sm mb-6 mt-6"
          style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ChevronLeft size={16} className="back-chevron" /> Salir del repaso
        </button>

        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between text-xs mb-3" style={{ color: C.mutedDim }}>
            <span>{card.courseTitle} · {card.topicTitle}</span>
            <span>{session.reviewedCount + 1}/{session.total}</span>
          </div>
          <div className="rounded-full mb-6" style={{ height: 4, background: C.border, overflow: 'hidden' }}>
            <div className="rounded-full" style={{ height: 4, width: `${(session.reviewedCount / session.total) * 100}%`, background: card.courseColor, transition: 'width 0.4s ease' }} />
          </div>

          <div className="flashcard-scene" style={{ height: 260 }} onClick={() => !session.showBack && flipCard()}>
            <div className={`flashcard-inner ${session.showBack ? 'flipped' : ''}`}>
              <div className="flashcard-face" style={{ background: C.surface, border: `2px solid ${card.courseColor}`, cursor: session.showBack ? 'default' : 'pointer' }}>
                <div>
                  <span className="text-xs uppercase" style={{ color: card.courseColor, letterSpacing: '0.1em' }}>{card.topicTitle}</span>
                  <p style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mt-3">{card.front}</p>
                  <p className="text-xs mt-5" style={{ color: C.mutedDim }}>Toca la tarjeta para ver la respuesta</p>
                </div>
              </div>
              <div className="flashcard-face back" style={{ background: C.surface, border: `2px solid ${card.courseColor}` }}>
                <p className="text-sm leading-relaxed" style={{ color: C.text, whiteSpace: 'pre-line' }}>{card.back}</p>
              </div>
            </div>
          </div>

          {session.showBack ? (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => handleRate('again')} className="flashcard-rate-btn text-sm px-4 py-2 rounded-full" style={{ background: 'transparent', border: '1px solid #B5495B', color: '#E08D95', cursor: 'pointer' }}>
                Otra vez
              </button>
              <button onClick={() => handleRate('good')} className="flashcard-rate-btn text-sm px-4 py-2 rounded-full" style={{ background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold, cursor: 'pointer' }}>
                Bien
              </button>
              <button onClick={() => handleRate('easy')} className="flashcard-rate-btn text-sm px-4 py-2 rounded-full" style={{ background: 'transparent', border: `1px solid ${C.emerald}`, color: C.emerald, cursor: 'pointer' }}>
                Fácil
              </button>
            </div>
          ) : (
            <p className="text-center text-xs mt-6" style={{ color: C.mutedDim }}>Pensá tu respuesta antes de tocar la tarjeta</p>
          )}
        </div>
      </div>
    );
  }

  // --- Vista general: estadísticas y desglose por curso ---
  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver al reino
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.emerald}55` }}>
        <Crest color={C.emerald} Icon={Repeat} size={78} pulse />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: C.emerald, letterSpacing: '0.2em' }}>Repaso espaciado</span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl md:text-3xl mt-2 mb-2">
            {dueCards.length > 0 ? `Tienes ${dueCards.length} ${dueCards.length === 1 ? 'tarjeta' : 'tarjetas'} para hoy` : '¡Estás al día!'}
          </h2>
          <p className="text-sm md:text-base mb-4" style={{ color: C.muted }}>
            Cada tarjeta sale de las preguntas de los mini quiz. Calificás qué tan bien la sabías y el sistema decide solo cuándo te la vuelve a mostrar: las que dominás aparecen cada vez más espaciadas, las que te cuestan vuelven pronto.
          </p>
          <button
            onClick={() => startSession(dueCards)}
            disabled={dueCards.length === 0}
            className="community-cta btn-tap inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
            style={{
              background: dueCards.length > 0 ? `linear-gradient(90deg, ${C.emerald}, #79CF9C)` : C.border,
              color: dueCards.length > 0 ? '#0A0C10' : C.mutedDim,
              cursor: dueCards.length > 0 ? 'pointer' : 'default',
            }}
          >
            <Repeat size={16} /> {dueCards.length > 0 ? `Repasar todo (${dueCards.length})` : 'Nada pendiente por hoy'}
          </button>
        </div>
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Por curso
      </h3>
      <div className="flex flex-col gap-3">
        {courseData.map((course, idx) => {
          const cardsInCourse = ALL_FLASHCARDS.filter((c) => c.courseId === course.id);
          const dueInCourse = cardsInCourse.filter((c) => isCardDueToday(getCardProgress(flashcardProgress, c.id), today));
          return (
            <button
              key={course.id}
              onClick={() => startSession(cardsInCourse)}
              disabled={cardsInCourse.length === 0}
              className="row-card flex items-center gap-4 p-4 rounded-xl text-left card-in"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: cardsInCourse.length > 0 ? 'pointer' : 'default',
                opacity: cardsInCourse.length > 0 ? 1 : 0.5,
                animationDelay: `${idx * 60}ms`,
                '--row-color': course.color,
              }}
            >
              <Crest color={course.color} Icon={course.icon} size={44} />
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text }} className="text-sm font-medium truncate">{course.title}</p>
                <p style={{ color: C.mutedDim }} className="text-xs mt-1">
                  {cardsInCourse.length === 0 ? 'Sin tarjetas todavía' : `${dueInCourse.length}/${cardsInCourse.length} para repasar`}
                </p>
              </div>
              {cardsInCourse.length > 0 && <ArrowRight size={16} color={course.color} className="row-arrow shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Planificador de estudio semanal: organiza qué día vas a estudiar qué curso
   (o algo propio, fuera de Kingdom Level, con "Otro"). Solo guarda las
   sesiones planificadas; la navegación de semana es local a la vista. */

function SessionCard({ session, onToggleDone, onDelete }) {
  const course = session.courseId === 'custom' ? null : courseData.find((c) => c.id === session.courseId);
  const color = course ? course.color : C.gold;
  const Icon = course ? course.icon : BookOpen;
  const title = course ? course.title : session.customTitle || 'Sesión de estudio';

  return (
    <div
      className="session-card rounded-lg p-2 flex items-start gap-2"
      style={{ background: `${color}14`, border: `1px solid ${color}44`, opacity: session.done ? 0.55 : 1, '--session-color': color }}
    >
      <button
        onClick={onToggleDone}
        className="shrink-0"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 1 }}
        title={session.done ? 'Marcar como pendiente' : 'Marcar como estudiada'}
      >
        {session.done ? <CheckCircle2 size={15} color={color} className="check-pop" /> : <Circle size={15} color={color} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: C.text, textDecoration: session.done ? 'line-through' : 'none' }}>
          <Icon size={11} color={color} className="shrink-0" /> <span className="truncate">{title}</span>
        </p>
        {session.time && <p className="text-xs mt-0.5" style={{ color: C.mutedDim }}>{session.time}</p>}
        {session.note && <p className="text-xs mt-0.5 leading-snug" style={{ color: C.mutedDim }}>{session.note}</p>}
      </div>
      <button onClick={onDelete} className="shrink-0" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedDim, padding: 0 }} title="Eliminar">
        <X size={12} />
      </button>
    </div>
  );
}

function AddSessionForm({ onSubmit, onCancel }) {
  const [courseId, setCourseId] = useState(courseData[0].id);
  const [customTitle, setCustomTitle] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  function submit() {
    if (courseId === 'custom' && !customTitle.trim()) return; // necesita al menos un título si es personalizado
    onSubmit({ courseId, customTitle: customTitle.trim(), time, note: note.trim() });
  }

  return (
    <div className="planner-form-in flex flex-col gap-3 p-3 rounded-xl" style={{ background: '#0F131A', border: `1px solid ${C.border}` }}>
      <div>
        <p className="text-xs mb-2" style={{ color: C.mutedDim }}>¿Qué vas a estudiar?</p>
        <div className="flex flex-wrap gap-1.5">
          {courseData.map((c) => {
            const selected = courseId === c.id;
            const CourseIcon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCourseId(c.id)}
                className="planner-course-chip flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-1.5"
                style={{
                  background: selected ? `${c.color}22` : 'transparent',
                  border: `1px solid ${selected ? c.color : C.border}`,
                  color: selected ? c.color : C.muted,
                }}
                title={c.title}
              >
                <CourseIcon size={12} className="shrink-0" />
                <span className="text-xs truncate" style={{ maxWidth: 96 }}>{c.title}</span>
              </button>
            );
          })}
          <button
            onClick={() => setCourseId('custom')}
            className="planner-course-chip flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-1.5"
            style={{
              background: courseId === 'custom' ? `${C.gold}22` : 'transparent',
              border: `1px solid ${courseId === 'custom' ? C.gold : C.border}`,
              color: courseId === 'custom' ? C.gold : C.muted,
            }}
          >
            <PenLine size={12} className="shrink-0" />
            <span className="text-xs">Otro</span>
          </button>
        </div>
      </div>

      {courseId === 'custom' && (
        <div>
          <p className="text-xs mb-1" style={{ color: C.mutedDim }}>Título</p>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="¿Qué vas a estudiar?"
            className="planner-input text-xs w-full"
            autoFocus
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs mb-1" style={{ color: C.mutedDim }}>Hora (opcional)</p>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="planner-input text-xs w-full" />
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: C.mutedDim }}>Nota (opcional)</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: tema 3"
            className="planner-input text-xs w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={submit}
          className="planner-save-btn btn-tap text-xs px-4 py-2 rounded-full"
          style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, color: '#0A0C10', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Guardar sesión
        </button>
        <button onClick={onCancel} className="text-xs px-4 py-2 rounded-full" style={{ background: 'transparent', color: C.mutedDim, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function PlannerView({ sessions, onAddSession, onToggleDone, onDeleteSession, onBack }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [monthCursor, setMonthCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [addingForDay, setAddingForDay] = useState(null);

  const todayKeyValue = formatDateKey(new Date());

  function handleSubmit(dateKey, data) {
    onAddSession({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: dateKey,
      done: false,
      ...data,
    });
    setAddingForDay(null);
  }

  // --- Vista de mes (grilla tipo Google Calendar) ---
  const monthDays = useMemo(() => getMonthGridDays(monthCursor), [monthCursor]);
  const monthLabel = `${PLANNER_MONTH_LABELS[monthCursor.getMonth()].charAt(0).toUpperCase()}${PLANNER_MONTH_LABELS[monthCursor.getMonth()].slice(1)} ${monthCursor.getFullYear()}`;
  const sessionsThisMonth = sessions.filter((s) => {
    const [y, m] = s.date.split('-').map(Number);
    return y === monthCursor.getFullYear() && m - 1 === monthCursor.getMonth();
  });
  const doneThisMonth = sessionsThisMonth.filter((s) => s.done).length;

  // --- Vista de semana (columnas por día) ---
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = weekDays[6];
  const weekRangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()} – ${weekEnd.getDate()} de ${PLANNER_MONTH_LABELS[weekStart.getMonth()]}`
      : `${weekStart.getDate()} de ${PLANNER_MONTH_LABELS[weekStart.getMonth()]} – ${weekEnd.getDate()} de ${PLANNER_MONTH_LABELS[weekEnd.getMonth()]}`;
  const sessionsThisWeek = sessions.filter((s) => weekDays.some((d) => formatDateKey(d) === s.date));
  const doneThisWeek = sessionsThisWeek.filter((s) => s.done).length;

  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const selectedDaySessions = sessions.filter((s) => s.date === selectedDate);

  const headerCount = viewMode === 'month' ? { total: sessionsThisMonth.length, done: doneThisMonth, label: 'este mes' } : { total: sessionsThisWeek.length, done: doneThisWeek, label: 'esta semana' };

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver al reino
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.gold}55` }}>
        <Crest color={C.gold} Icon={CalendarDays} size={64} pulse />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: C.gold, letterSpacing: '0.2em' }}>Planificador de estudio</span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-xl md:text-2xl mt-2 mb-2">
            Organiza tu tiempo
          </h2>
          <p className="text-sm" style={{ color: C.muted }}>
            {headerCount.total === 0 ? `Todavía no planificaste nada para ${headerCount.label}.` : `${headerCount.done}/${headerCount.total} sesiones completadas ${headerCount.label}.`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (viewMode === 'month' ? setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)) : setWeekStart((w) => addDays(w, -7)))}
            className="pomodoro-btn flex items-center justify-center rounded-full"
            style={{ width: 30, height: 30, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}
            title={viewMode === 'month' ? 'Mes anterior' : 'Semana anterior'}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
              setWeekStart(startOfWeek(now));
              setSelectedDate(formatDateKey(now));
            }}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer' }}
          >
            Hoy
          </button>
          <button
            onClick={() => (viewMode === 'month' ? setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)) : setWeekStart((w) => addDays(w, 7)))}
            className="pomodoro-btn flex items-center justify-center rounded-full"
            style={{ width: 30, height: 30, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}
            title={viewMode === 'month' ? 'Mes siguiente' : 'Semana siguiente'}
          >
            <ChevronRight size={14} />
          </button>
          <span className="text-sm ml-2" style={{ color: C.text }}>{viewMode === 'month' ? monthLabel : weekRangeLabel}</span>
        </div>

        <div className="flex items-center gap-1 rounded-full p-1" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <button
            onClick={() => setViewMode('month')}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: viewMode === 'month' ? C.gold : 'transparent', color: viewMode === 'month' ? '#0A0C10' : C.muted, border: 'none', cursor: 'pointer', fontWeight: viewMode === 'month' ? 600 : 400 }}
          >
            Mes
          </button>
          <button
            onClick={() => setViewMode('week')}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: viewMode === 'week' ? C.gold : 'transparent', color: viewMode === 'week' ? '#0A0C10' : C.muted, border: 'none', cursor: 'pointer', fontWeight: viewMode === 'week' ? 600 : 400 }}
          >
            Semana
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* Grilla mensual: 7 columnas fijas, como Google Calendar */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {PLANNER_WEEKDAY_LABELS.map((lbl) => (
              <div key={lbl} className="text-center text-xs" style={{ color: C.mutedDim }}>{lbl}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {monthDays.map((d, i) => {
              const dateKey = formatDateKey(d);
              const inMonth = d.getMonth() === monthCursor.getMonth();
              const isToday = dateKey === todayKeyValue;
              const isSelected = dateKey === selectedDate;
              const daySessions = sessions.filter((s) => s.date === dateKey);
              const visible = daySessions.slice(0, 2);
              const extra = daySessions.length - visible.length;
              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className="month-cell card-in flex flex-col items-start p-1.5 md:p-2 rounded-lg text-left"
                  style={{
                    minHeight: 68,
                    background: isSelected ? `${C.gold}14` : C.surface,
                    border: `1px solid ${isSelected ? C.gold : isToday ? `${C.gold}88` : C.border}`,
                    boxShadow: isSelected ? `0 0 0 1px ${C.gold}33` : 'none',
                    opacity: inMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    animationDelay: `${i * 8}ms`,
                  }}
                >
                  {isToday ? (
                    <span className="month-today-badge text-xs">{d.getDate()}</span>
                  ) : (
                    <span className="text-xs" style={{ color: C.text }}>{d.getDate()}</span>
                  )}
                  <div className="flex flex-col gap-1 mt-1.5 w-full">
                    {visible.map((s) => {
                      const course = s.courseId === 'custom' ? null : courseData.find((c) => c.id === s.courseId);
                      const color = course ? course.color : C.gold;
                      const title = course ? course.title : s.customTitle || 'Estudio';
                      return (
                        <span
                          key={s.id}
                          className="month-chip text-xs truncate"
                          style={{
                            background: `${color}20`,
                            borderLeft: `2px solid ${color}`,
                            color,
                            padding: '2px 6px',
                            borderRadius: '0 6px 6px 0',
                            textDecoration: s.done ? 'line-through' : 'none',
                          }}
                        >
                          {title}
                        </span>
                      );
                    })}
                    {extra > 0 && <span className="text-xs" style={{ color: C.mutedDim }}>+{extra} más</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel del día seleccionado */}
          <div className="mt-6 p-4 md:p-5 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: C.text }}>{formatLongDate(selectedDateObj)}</span>
              {selectedDate === todayKeyValue && <span className="text-xs" style={{ color: C.gold }}>Hoy</span>}
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {selectedDaySessions.length === 0 && (
                <p className="text-xs" style={{ color: C.mutedDim }}>Nada planificado para este día todavía.</p>
              )}
              {selectedDaySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onToggleDone={() => onToggleDone(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                />
              ))}
            </div>
            {addingForDay === selectedDate ? (
              <AddSessionForm onSubmit={(data) => handleSubmit(selectedDate, data)} onCancel={() => setAddingForDay(null)} />
            ) : (
              <button
                onClick={() => setAddingForDay(selectedDate)}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
                style={{ background: 'transparent', border: `1px dashed ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}
              >
                <Plus size={12} /> Agregar sesión
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d, i) => {
            const dateKey = formatDateKey(d);
            const isToday = dateKey === todayKeyValue;
            const daySessions = sessions.filter((s) => s.date === dateKey);
            return (
              <div
                key={dateKey}
                className="rounded-xl p-3 flex flex-col gap-2 card-in"
                style={{ background: C.surface, border: `1px solid ${isToday ? C.gold : C.border}`, minHeight: 170, animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: isToday ? C.gold : C.text }}>
                    {PLANNER_WEEKDAY_LABELS[i]} {d.getDate()}
                  </span>
                  {isToday && <span className="text-xs" style={{ color: C.gold }}>Hoy</span>}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {daySessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onToggleDone={() => onToggleDone(session.id)}
                      onDelete={() => onDeleteSession(session.id)}
                    />
                  ))}
                </div>

                {addingForDay === dateKey ? (
                  <AddSessionForm onSubmit={(data) => handleSubmit(dateKey, data)} onCancel={() => setAddingForDay(null)} />
                ) : (
                  <button
                    onClick={() => setAddingForDay(dateKey)}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: 'transparent', border: `1px dashed ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}
                  >
                    <Plus size={12} /> Agregar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Buscador del reino: un ícono compacto en el header que despliega un panel
   con resultados en vivo mientras escribís. La búsqueda en sí es local a
   este componente (no necesita persistir ni sobrevivir a la navegación). */
function SearchWidget({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const results = useMemo(() => searchKingdom(query), [query]);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  }
  function handleClose() {
    setOpen(false);
    setQuery('');
  }
  function handleSelect(result) {
    onNavigate(result);
    handleClose();
  }

  return (
    <div className="relative">
      <button
        onClick={() => (open ? handleClose() : handleOpen())}
        className="pomodoro-pill flex items-center gap-2 rounded-full px-3 py-2"
        style={{ background: C.surface, border: `1px solid ${open ? C.gold : C.border}`, cursor: 'pointer' }}
        title="Buscar en el reino"
      >
        <Search size={16} color={open ? C.gold : C.muted} />
      </button>

      {open && (
        <>
          <div className="search-backdrop" onClick={handleClose} />
          <div
            className="planner-form-in rounded-2xl p-3"
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 280,
              maxWidth: '85vw',
              background: C.surface,
              border: `1px solid ${C.gold}`,
              boxShadow: `0 16px 40px -14px ${C.gold}66`,
              zIndex: 40,
            }}
          >
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-2" style={{ background: '#0F131A', border: `1px solid ${C.border}` }}>
              <Search size={14} color={C.mutedDim} className="shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && handleClose()}
                placeholder="Busca un curso, tema, clase o apunte…"
                className="search-input text-sm flex-1"
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedDim, padding: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {query.trim() === '' && (
                <p className="text-xs text-center py-4" style={{ color: C.mutedDim }}>Escribe para buscar en todo el reino.</p>
              )}
              {query.trim() !== '' && results.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: C.mutedDim }}>No encontramos nada con &quot;{query}&quot;.</p>
              )}
              {results.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className="search-result-row flex items-center gap-2 p-2 rounded-lg text-left"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                  >
                    <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: `${r.color}22` }}>
                      <Icon size={13} color={r.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: C.text }}>{r.title}</p>
                      <p className="text-xs truncate" style={{ color: C.mutedDim }}>{r.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Tarjeta de estadística chica, reutilizada 3 veces en el registro de tiempo. */
function StudyStatCard({ label, value, sub, color, Icon }) {
  return (
    <div className="rounded-2xl p-5 card-in" style={{ background: C.surface, border: `1px solid ${color}55` }}>
      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        <Icon size={16} />
        <span className="text-xs uppercase" style={{ letterSpacing: '0.15em' }}>{label}</span>
      </div>
      <p style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-2xl mb-1">{value}</p>
      <p className="text-xs" style={{ color: C.mutedDim }}>{sub}</p>
    </div>
  );
}

/* Registro de tiempo de estudio: se alimenta solo de las sesiones de Pomodoro
   que terminan de verdad (no de las que se saltan a mano). */
function StudyLogView({ studyLog, onBack }) {
  const stats = computeStudyStats(studyLog);
  const daily = getDailyStudyTotals(studyLog, 14);
  const maxMinutes = Math.max(...daily.map((d) => d.minutes), 1);

  return (
    <div className="px-6 md:px-10 pb-20">
      <button
        onClick={onBack}
        className="back-btn flex items-center gap-2 text-sm mb-8 mt-6"
        style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronLeft size={16} className="back-chevron" /> Volver al reino
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8 p-6 md:p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.gold}55` }}>
        <Crest color={C.gold} Icon={Timer} size={64} pulse />
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase" style={{ color: C.gold, letterSpacing: '0.2em' }}>Tiempo de estudio</span>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-xl md:text-2xl mt-2 mb-2">
            Tu registro con el Pomodoro
          </h2>
          <p className="text-sm" style={{ color: C.muted }}>
            {stats.totalSessions === 0
              ? 'Todavía no completaste ninguna sesión de enfoque. Arranca el Pomodoro cuando quieras.'
              : `En total llevas ${formatStudyMinutes(stats.totalMinutes)} estudiados, en ${stats.totalSessions} ${stats.totalSessions === 1 ? 'sesión' : 'sesiones'}.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StudyStatCard
          label="Hoy"
          value={formatStudyMinutes(stats.todayMinutes)}
          sub={`${stats.todaySessions} ${stats.todaySessions === 1 ? 'sesión' : 'sesiones'}`}
          color={C.gold}
          Icon={Flame}
        />
        <StudyStatCard
          label="Esta semana"
          value={formatStudyMinutes(stats.weekMinutes)}
          sub={`${stats.weekSessions} ${stats.weekSessions === 1 ? 'sesión' : 'sesiones'}`}
          color={C.emerald}
          Icon={CalendarDays}
        />
        <StudyStatCard
          label="Este mes"
          value={formatStudyMinutes(stats.monthMinutes)}
          sub={`${stats.monthSessions} ${stats.monthSessions === 1 ? 'sesión' : 'sesiones'}`}
          color="#5B8DBF"
          Icon={TrendingUp}
        />
      </div>

      <h3 style={{ fontFamily: FONT_DISPLAY, color: C.text }} className="text-lg mb-4">
        Últimos 14 días
      </h3>
      <div className="flex flex-col gap-2 rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {daily.map((d) => {
          const isToday = d.dateKey === todayStr();
          const pct = Math.round((d.minutes / maxMinutes) * 100);
          return (
            <div key={d.dateKey} className="flex items-center gap-3">
              <span className="text-xs shrink-0" style={{ color: isToday ? C.gold : C.mutedDim, width: 46 }}>
                {PLANNER_WEEKDAY_LABELS[(d.date.getDay() + 6) % 7]} {d.date.getDate()}
              </span>
              <div className="flex-1 rounded-full" style={{ height: 10, background: C.border, overflow: 'hidden', position: 'relative' }}>
                {d.minutes > 0 && (
                  <div
                    className="rounded-full"
                    style={{ height: 10, width: `${Math.max(pct, 4)}%`, background: isToday ? C.gold : `${C.gold}99`, transition: 'width 0.5s ease' }}
                  />
                )}
              </div>
              <span className="text-xs shrink-0 text-right" style={{ color: d.minutes > 0 ? C.text : C.mutedDim, width: 64 }}>
                {d.minutes > 0 ? formatStudyMinutes(d.minutes) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ POMODORO ---------------------------------- */
/* Temporizador de estudio global: vive en el componente principal (App), no
   dentro de ninguna vista, así que cambiar de clase, tema o curso NUNCA lo
   reinicia ni lo detiene — sigue corriendo de fondo mientras el estudiante
   navega por todo Kingdom Level. Si recarga la página por completo sí se
   reinicia (como cualquier cronómetro de una pestaña), pero moverse dentro
   del sitio jamás lo toca. El estudiante puede ajustar cuánto dura cada
   sesión de concentración y cada descanso; esa preferencia sí se guarda
   entre visitas (el conteo en marcha, no). */

const POMODORO_DEFAULT_FOCUS_MIN = 25;
const POMODORO_DEFAULT_BREAK_MIN = 5;
const POMODORO_FOCUS_MIN_RANGE = [5, 90];
const POMODORO_BREAK_MIN_RANGE = [1, 30];
const POMODORO_FOCUS_STEP = 5;
const POMODORO_BREAK_STEP = 1;
const POMODORO_LABELS = { focus: 'Enfoque', break: 'Descanso' };

function formatPomodoroTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Un pequeño "ding" con Web Audio, sin archivos de sonido externos. Si el
// navegador lo bloquea (algunos entornos con iframes lo hacen), simplemente
// no suena nada — el aviso visual sigue funcionando igual.
function playPomodoroChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch (err) {
    // silencio si el navegador bloquea audio
  }
}

function PomodoroWidget({
  mode,
  secondsLeft,
  running,
  sessionsDone,
  open,
  flash,
  focusMinutes,
  breakMinutes,
  onToggleOpen,
  onToggleRun,
  onReset,
  onSkip,
  onChangeFocusMinutes,
  onChangeBreakMinutes,
}) {
  const modeColor = mode === 'focus' ? C.gold : C.emerald;
  const modeLabel = POMODORO_LABELS[mode];
  const totalForMode = (mode === 'focus' ? focusMinutes : breakMinutes) * 60;
  const pct = Math.round(((totalForMode - secondsLeft) / totalForMode) * 100);
  const [focusMin, focusMax] = POMODORO_FOCUS_MIN_RANGE;
  const [breakMin, breakMax] = POMODORO_BREAK_MIN_RANGE;

  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        className="pomodoro-pill flex items-center gap-2 rounded-full px-3 py-2"
        style={{ background: C.surface, border: `1px solid ${modeColor}`, cursor: 'pointer' }}
      >
        <Timer size={16} color={modeColor} className={running ? 'icon-twinkle' : ''} />
        <span className="text-xs font-semibold" style={{ color: C.text }}>{formatPomodoroTime(secondsLeft)}</span>
      </button>

      {(open || flash) && (
        <div
          className="flex flex-col items-end gap-3"
          style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 30 }}
        >
          {flash && (
            <div className="pomodoro-flash" style={{ maxWidth: 240 }}>
              <div className="text-xs px-3 py-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${modeColor}`, color: C.text }}>
                {flash}
              </div>
            </div>
          )}

          {open && (
            <div
              className="rounded-2xl p-4"
              style={{ width: 240, background: C.surface, border: `1px solid ${modeColor}`, boxShadow: `0 14px 34px -12px ${modeColor}77` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase" style={{ color: modeColor, letterSpacing: '0.1em' }}>
                  {modeLabel}
                </span>
                <button
                  onClick={onToggleOpen}
                  title="Cerrar"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedDim, padding: 0 }}
                >
                  <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>

              <div className="text-center mb-3">
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: '2.1rem', color: C.text }}>{formatPomodoroTime(secondsLeft)}</span>
              </div>

              <div className="rounded-full mb-4" style={{ height: 4, background: C.border, overflow: 'hidden' }}>
                <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: modeColor, transition: 'width 1s linear' }} />
              </div>

              <div className="flex items-center justify-center gap-3 mb-3">
                <button onClick={onReset} title="Reiniciar esta fase" className="pomodoro-btn flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}>
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={onToggleRun}
                  title={running ? 'Pausar' : 'Iniciar'}
                  className="pomodoro-btn-main flex items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, background: modeColor, border: 'none', color: '#0A0C10', cursor: 'pointer' }}
                >
                  {running ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                </button>
                <button onClick={onSkip} title="Saltar a la siguiente fase" className="pomodoro-btn flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim, cursor: 'pointer' }}>
                  <SkipForward size={14} />
                </button>
              </div>

              <p className="text-center text-xs mb-3" style={{ color: C.mutedDim }}>
                {sessionsDone} {sessionsDone === 1 ? 'sesión completada' : 'sesiones completadas'}
              </p>

              <div className="flex flex-col gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.muted }}>Concentración</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeFocusMinutes(-POMODORO_FOCUS_STEP)}
                      disabled={running || focusMinutes <= focusMin}
                      title="Menos minutos de concentración"
                      className="pomodoro-stepper flex items-center justify-center rounded-full"
                      style={{ width: 22, height: 22, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim }}
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-semibold" style={{ color: C.text, minWidth: 44, textAlign: 'center' }}>
                      {focusMinutes} min
                    </span>
                    <button
                      onClick={() => onChangeFocusMinutes(POMODORO_FOCUS_STEP)}
                      disabled={running || focusMinutes >= focusMax}
                      title="Más minutos de concentración"
                      className="pomodoro-stepper flex items-center justify-center rounded-full"
                      style={{ width: 22, height: 22, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.muted }}>Descanso</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeBreakMinutes(-POMODORO_BREAK_STEP)}
                      disabled={running || breakMinutes <= breakMin}
                      title="Menos minutos de descanso"
                      className="pomodoro-stepper flex items-center justify-center rounded-full"
                      style={{ width: 22, height: 22, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim }}
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-semibold" style={{ color: C.text, minWidth: 44, textAlign: 'center' }}>
                      {breakMinutes} min
                    </span>
                    <button
                      onClick={() => onChangeBreakMinutes(POMODORO_BREAK_STEP)}
                      disabled={running || breakMinutes >= breakMax}
                      title="Más minutos de descanso"
                      className="pomodoro-stepper flex items-center justify-center rounded-full"
                      style={{ width: 22, height: 22, background: 'transparent', border: `1px solid ${C.border}`, color: C.mutedDim }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
                {running && (
                  <p className="text-xs mt-1" style={{ color: C.mutedDim }}>
                    Pausa el temporizador para cambiar la duración.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
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
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, lastActiveDate: null });
  const [unlockedBadges, setUnlockedBadges] = useState({});
  const [personalNotes, setPersonalNotes] = useState({});

  // --- Progreso guardado en el navegador (sin necesidad de login) ---------
  // Usamos el almacenamiento propio de los artifacts de Claude (window.storage),
  // NO localStorage: dentro de Claude.ai, localStorage está bloqueado y no
  // funciona en este entorno. window.storage sí persiste, y es personal (cada
  // estudiante ve solo su propio progreso, nadie más). Guardamos las clases
  // completadas, la racha de días, las insignias desbloqueadas y los apuntes
  // personales juntos, en una sola clave.
  //
  // El guardado tiene un pequeño retraso (debounce): en vez de llamar a
  // window.storage.set en cada cambio (por ejemplo, cada letra que el
  // estudiante escribe en sus notas personales), esperamos un momento sin
  // cambios nuevos antes de guardar. Así evitamos disparar el guardado
  // decenas de veces por segundo mientras alguien está escribiendo.
  //
  // Nota para cuando publiques Kingdom Level como sitio propio, fuera de
  // Claude.ai: window.storage ya no va a existir ahí. En un sitio normal
  // reemplaza estas dos funciones por localStorage.getItem/setItem (ahí sí
  // funciona sin restricciones) o, más adelante, por una base de datos real
  // si agregas cuentas de usuario.
  const STORAGE_KEY = 'kingdomlevel-progress';
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (!cancelled && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed && typeof parsed === 'object') {
            if (parsed.completedMap) setCompletedMap(parsed.completedMap);
            if (parsed.streak) setStreak(parsed.streak);
            if (parsed.unlockedBadges) setUnlockedBadges(parsed.unlockedBadges);
            if (parsed.personalNotes) setPersonalNotes(parsed.personalNotes);
          }
        }
      } catch (err) {
        // Primera visita (todavía no hay nada guardado) o falló la lectura:
        // seguimos con todo en cero, sin romper la app.
      } finally {
        if (!cancelled) setProgressLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!progressLoaded) return; // evita pisar lo guardado con datos vacíos antes de terminar de cargar
    const t = setTimeout(() => {
      (async () => {
        try {
          await window.storage.set(STORAGE_KEY, JSON.stringify({ completedMap, streak, unlockedBadges, personalNotes }), false);
        } catch (err) {
          // Si falla el guardado no bloqueamos la experiencia; se reintentará
          // solo con el próximo cambio de progreso.
        }
      })();
    }, 600);
    return () => clearTimeout(t);
  }, [completedMap, streak, unlockedBadges, personalNotes, progressLoaded]);

  function saveNote(key, text) {
    setPersonalNotes((prev) => ({ ...prev, [key]: text }));
  }

  // Registra que hoy hubo actividad y actualiza la racha (solo al MARCAR una
  // clase como completada, nunca al desmarcarla).
  function registerStudyActivityToday() {
    const today = todayStr();
    setStreak((prev) => {
      if (prev.lastActiveDate === today) return prev; // hoy ya contaba, sin cambios
      const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : null;
      const nextCurrent = diff === 1 ? prev.currentStreak + 1 : 1;
      return {
        currentStreak: nextCurrent,
        longestStreak: Math.max(prev.longestStreak || 0, nextCurrent),
        lastActiveDate: today,
      };
    });
  }

  function resetProgress() {
    setCompletedMap({});
    setUnlockedBadges({}); // las insignias dependen del progreso, así que se reinician junto con él
    // La racha de días NO se toca: es sobre constancia, no sobre cuánto contenido completaste.
  }

  // --- Registro de tiempo de estudio --------------------------------------
  // Se alimenta solo de sesiones de enfoque del Pomodoro que terminan de
  // verdad (nunca de una salteada a mano). Guarda { date, minutes } por cada
  // sesión completada, en su propia clave.
  const STUDY_LOG_KEY = 'kingdomlevel-study-log';
  const [studyLog, setStudyLog] = useState([]);
  const [studyLogLoaded, setStudyLogLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(STUDY_LOG_KEY, false);
        if (!cancelled && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed)) setStudyLog(parsed);
        }
      } catch (err) {
        // Primera visita: todavía no hay nada registrado.
      } finally {
        if (!cancelled) setStudyLogLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!studyLogLoaded) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await window.storage.set(STUDY_LOG_KEY, JSON.stringify(studyLog), false);
        } catch (err) {
          // Sin bloquear la experiencia; se reintenta con el próximo cambio.
        }
      })();
    }, 500);
    return () => clearTimeout(t);
  }, [studyLog, studyLogLoaded]);

  function logStudySession(minutes) {
    setStudyLog((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: todayStr(), minutes }]);
  }

  // --- Temporizador Pomodoro (global) -------------------------------------
  // Vive acá, en App, y no dentro de ninguna vista — por eso nunca se
  // reinicia al cambiar de clase, tema o curso. La duración de cada fase es
  // configurable por el estudiante y esa preferencia sí se guarda entre
  // visitas (el conteo en marcha, no).
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(POMODORO_DEFAULT_FOCUS_MIN);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(POMODORO_DEFAULT_BREAK_MIN);
  const [pomodoroMode, setPomodoroMode] = useState('focus');
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(POMODORO_DEFAULT_FOCUS_MIN * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSessionsDone, setPomodoroSessionsDone] = useState(0);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [pomodoroFlash, setPomodoroFlash] = useState(null);

  // Guarda solo la preferencia de duración (no el conteo en marcha) para que,
  // si el estudiante ya ajustó "35 min de enfoque, 8 de descanso", se lo
  // encuentre así la próxima vez que entre.
  const POMODORO_SETTINGS_KEY = 'kingdomlevel-pomodoro-settings';
  const [pomodoroSettingsLoaded, setPomodoroSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(POMODORO_SETTINGS_KEY, false);
        if (!cancelled && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed && typeof parsed === 'object') {
            if (parsed.focusMinutes) {
              setPomodoroFocusMinutes(parsed.focusMinutes);
              setPomodoroSecondsLeft(parsed.focusMinutes * 60); // recién arrancando, el modo sigue siendo 'focus'
            }
            if (parsed.breakMinutes) setPomodoroBreakMinutes(parsed.breakMinutes);
          }
        }
      } catch (err) {
        // Primera visita: seguimos con 25/5 minutos por defecto.
      } finally {
        if (!cancelled) setPomodoroSettingsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pomodoroSettingsLoaded) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await window.storage.set(
            POMODORO_SETTINGS_KEY,
            JSON.stringify({ focusMinutes: pomodoroFocusMinutes, breakMinutes: pomodoroBreakMinutes }),
            false
          );
        } catch (err) {
          // Sin bloquear la experiencia; se reintenta con el próximo cambio.
        }
      })();
    }, 500);
    return () => clearTimeout(t);
  }, [pomodoroFocusMinutes, pomodoroBreakMinutes, pomodoroSettingsLoaded]);

  // --- Repaso espaciado (flashcards) --------------------------------------
  // Solo se guarda el progreso por tarjeta (caja + próxima fecha), en su
  // propia clave. La cola de una sesión de repaso es local a FlashcardsView.
  const FLASHCARDS_KEY = 'kingdomlevel-flashcards';
  const [flashcardProgress, setFlashcardProgress] = useState({});
  const [flashcardsLoaded, setFlashcardsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(FLASHCARDS_KEY, false);
        if (!cancelled && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed && typeof parsed === 'object') setFlashcardProgress(parsed);
        }
      } catch (err) {
        // Primera visita: todas las tarjetas arrancan pendientes.
      } finally {
        if (!cancelled) setFlashcardsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!flashcardsLoaded) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await window.storage.set(FLASHCARDS_KEY, JSON.stringify(flashcardProgress), false);
        } catch (err) {
          // Sin bloquear la experiencia; se reintenta con el próximo cambio.
        }
      })();
    }, 500);
    return () => clearTimeout(t);
  }, [flashcardProgress, flashcardsLoaded]);

  function rateFlashcard(cardId, rating) {
    setFlashcardProgress((prev) => ({ ...prev, [cardId]: nextCardProgress(getCardProgress(prev, cardId), rating) }));
  }

  // --- Planificador de estudio ---------------------------------------------
  const PLANNER_KEY = 'kingdomlevel-planner';
  const [plannerSessions, setPlannerSessions] = useState([]);
  const [plannerLoaded, setPlannerLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(PLANNER_KEY, false);
        if (!cancelled && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed)) setPlannerSessions(parsed);
        }
      } catch (err) {
        // Primera visita: arrancamos sin nada planificado.
      } finally {
        if (!cancelled) setPlannerLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!plannerLoaded) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await window.storage.set(PLANNER_KEY, JSON.stringify(plannerSessions), false);
        } catch (err) {
          // Sin bloquear la experiencia; se reintenta con el próximo cambio.
        }
      })();
    }, 500);
    return () => clearTimeout(t);
  }, [plannerSessions, plannerLoaded]);

  function addPlannerSession(session) {
    setPlannerSessions((prev) => [...prev, session]);
  }
  function togglePlannerSessionDone(id) {
    setPlannerSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }
  function deletePlannerSession(id) {
    setPlannerSessions((prev) => prev.filter((s) => s.id !== id));
  }

  // El "tick" del reloj: baja un segundo por vez mientras esté corriendo.
  useEffect(() => {
    if (!pomodoroRunning) return undefined;
    const id = setInterval(() => {
      setPomodoroSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [pomodoroRunning]);

  function advancePomodoroPhase(completedNaturally) {
    playPomodoroChime();
    setPomodoroRunning(false);
    if (pomodoroMode === 'focus') {
      setPomodoroSessionsDone((n) => n + 1);
      if (completedNaturally) logStudySession(pomodoroFocusMinutes); // solo cuenta si el tiempo se cumplió de verdad
      setPomodoroMode('break');
      setPomodoroSecondsLeft(pomodoroBreakMinutes * 60);
      setPomodoroFlash('¡Sesión de enfoque terminada! Hora de un descanso.');
    } else {
      setPomodoroMode('focus');
      setPomodoroSecondsLeft(pomodoroFocusMinutes * 60);
      setPomodoroFlash('Descanso terminado. ¿Listo para otra sesión de enfoque?');
    }
    setTimeout(() => setPomodoroFlash(null), 5000);
  }

  // Cuando el conteo llega a 0 mientras corre, avanza de fase automáticamente.
  useEffect(() => {
    if (pomodoroRunning && pomodoroSecondsLeft === 0) {
      advancePomodoroPhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoroSecondsLeft, pomodoroRunning]);

  function togglePomodoroRun() {
    setPomodoroRunning((r) => !r);
    setPomodoroOpen(true); // al iniciar/pausar, mostramos el panel para que vea qué pasó
  }
  function resetPomodoroPhase() {
    setPomodoroRunning(false);
    setPomodoroSecondsLeft((pomodoroMode === 'focus' ? pomodoroFocusMinutes : pomodoroBreakMinutes) * 60);
  }
  function skipPomodoroPhase() {
    advancePomodoroPhase();
  }
  function togglePomodoroOpen() {
    setPomodoroOpen((o) => !o);
  }

  // Cambia cuántos minutos dura cada fase. Solo se permite mientras el
  // temporizador está pausado (los botones ya vienen deshabilitados si está
  // corriendo, esto es una segunda barrera de seguridad).
  function changePomodoroFocusMinutes(delta) {
    if (pomodoroRunning) return;
    const [min, max] = POMODORO_FOCUS_MIN_RANGE;
    const next = Math.min(max, Math.max(min, pomodoroFocusMinutes + delta));
    setPomodoroFocusMinutes(next);
    if (pomodoroMode === 'focus') setPomodoroSecondsLeft(next * 60);
  }
  function changePomodoroBreakMinutes(delta) {
    if (pomodoroRunning) return;
    const [min, max] = POMODORO_BREAK_MIN_RANGE;
    const next = Math.min(max, Math.max(min, pomodoroBreakMinutes + delta));
    setPomodoroBreakMinutes(next);
    if (pomodoroMode === 'break') setPomodoroSecondsLeft(next * 60);
  }

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
  const {
    title: rankTitle,
    level,
    pct,
    xp,
    xpForNext,
    classesForNext,
    classesDoneInLevel,
    classesNeededInLevel,
    isMaxLevel,
  } = getLevelInfo(completedCount);

  // Pequeña celebración cuando el estudiante sube de nivel al completar clases.
  const [levelUpToast, setLevelUpToast] = useState(null);
  const prevLevelRef = useRef(null); // null = todavía no sabemos el nivel real guardado
  useEffect(() => {
    if (!progressLoaded) return undefined; // esperamos a que cargue el progreso guardado

    if (prevLevelRef.current === null) {
      // Primera vez que conocemos el nivel real (recién cargado desde el
      // guardado): lo registramos en silencio, sin festejar un "level up" falso.
      prevLevelRef.current = level;
      return undefined;
    }

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
      setLevelUpToast({ level, title: rankTitle, particles, isMaxLevel, unlockMessage: getLevelVisual(level).unlockMessage });
      const t = setTimeout(() => setLevelUpToast(null), 3600);
      prevLevelRef.current = level;
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
    return undefined;
  }, [level, rankTitle, isMaxLevel, progressLoaded]);

  // Detecta insignias nuevas cada vez que cambia el progreso o la racha, y las
  // guarda para siempre (una vez desbloqueada, no se vuelve a bloquear).
  const [badgeToast, setBadgeToast] = useState(null);
  useEffect(() => {
    if (!progressLoaded) return undefined;
    const ctx = computeBadgeContext(completedMap, streak);
    const merged = { ...unlockedBadges };
    let newlyUnlocked = null;
    BADGES.forEach((b) => {
      if (!merged[b.id] && b.check(ctx)) {
        merged[b.id] = true;
        if (!newlyUnlocked) newlyUnlocked = b;
      }
    });
    if (newlyUnlocked) {
      setUnlockedBadges(merged);
      setBadgeToast(newlyUnlocked);
      const t = setTimeout(() => setBadgeToast(null), 3600);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedMap, streak, progressLoaded]);

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
  function openFlashcards() {
    goTo({ view: 'flashcards', courseId: null, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
  }
  function openPlanner() {
    goTo({ view: 'planner', courseId: null, topicId: null, classId: null, notesCourseId: null, notesTopicId: null });
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
    setCompletedMap((prev) => {
      const willBeDone = !prev[key];
      if (willBeDone) registerStudyActivityToday();
      return { ...prev, [key]: willBeDone };
    });
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

  function handleSearchNavigate(result) {
    if (result.type === 'course') openCourse(result.courseId);
    else if (result.type === 'topic') openTopic(result.courseId, result.topicId);
    else if (result.type === 'class') openClass(result.courseId, result.topicId, result.classId);
    else if (result.type === 'notes') openNotesTopic(result.courseId, result.topicId);
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

        /* Sello fijo de curso (ej. "Materia de universidad"), estilo lacre. */
        @keyframes sealWobble {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(-4deg); }
        }
        .course-seal {
          position: absolute;
          top: -14px;
          right: -10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
          pointer-events: none;
        }
        .course-seal-ring {
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 30%, #F0DFA0, #C9A227 55%, #8C6E17 100%);
          border: 2px solid #F0DFA0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.45), inset 0 0 0 3px rgba(0,0,0,0.15);
          animation: sealWobble 3.6s ease-in-out infinite;
        }
        .course-seal-label {
          margin-top: 4px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-align: center;
          color: #F0DFA0;
          background: #14181f;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          border: 1px solid rgba(240,223,160,0.4);
        }

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

        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.08) rotate(-4deg); }
          50% { transform: scale(0.96) rotate(3deg); }
          75% { transform: scale(1.05) rotate(-2deg); }
        }
        .flame-flicker { animation: flameFlicker 1.6s ease-in-out infinite; display: inline-flex; }

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

        /* Temporizador Pomodoro (flotante, global) */
        .pomodoro-pill { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .pomodoro-pill:hover { transform: translateY(-2px); }
        .pomodoro-pill:active { transform: translateY(0) scale(0.97); }
        .pomodoro-btn { transition: border-color 0.2s ease, color 0.2s ease, transform 0.15s ease; }
        .pomodoro-btn:hover { border-color: ${C.gold} !important; color: ${C.gold} !important; }
        .pomodoro-btn:active { transform: scale(0.94); }
        .pomodoro-btn-main { transition: transform 0.15s ease, filter 0.2s ease; }
        .pomodoro-btn-main:hover { filter: brightness(1.1); transform: scale(1.05); }
        .pomodoro-btn-main:active { transform: scale(0.96); }
        @keyframes pomodoroFlashIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pomodoro-flash { animation: pomodoroFlashIn 0.35s ease both; }

        /* Mini quiz al final de la clase */
        .quiz-option { transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease; }
        .quiz-option:not(:disabled):hover { border-color: ${C.gold} !important; transform: translateX(2px); }
        .quiz-option:not(:disabled):active { transform: translateX(1px) scale(0.99); }

        /* Tarjeta de repaso con volteo 3D */
        .flashcard-scene { perspective: 1200px; width: 100%; }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s cubic-bezier(.4,.2,.2,1);
          transform-style: preserve-3d;
        }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          text-align: center;
        }
        .flashcard-face.back { transform: rotateY(180deg); overflow-y: auto; }
        .flashcard-rate-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .flashcard-rate-btn:hover { filter: brightness(1.2); transform: translateY(-2px); }
        .flashcard-rate-btn:active { transform: translateY(0) scale(0.96); }

        /* Planificador de estudio */
        .planner-input {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 8px;
          padding: 6px 10px;
          color: ${C.text};
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .planner-input::placeholder { color: ${C.mutedDim}; }
        .planner-input:focus { border-color: ${C.gold}; box-shadow: 0 0 0 3px ${C.gold}22; }
        .planner-input[type='time']::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }

        .planner-course-chip { transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease; cursor: pointer; }
        .planner-course-chip:hover { transform: translateY(-1px); border-color: ${C.gold} !important; }
        .planner-course-chip:active { transform: translateY(0) scale(0.96); }

        .planner-save-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .planner-save-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .planner-save-btn:active { transform: translateY(0) scale(0.97); }

        @keyframes plannerFormIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .planner-form-in { animation: plannerFormIn 0.25s cubic-bezier(.2,.8,.2,1) both; }

        .month-cell { transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
        .month-cell:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -12px rgba(0,0,0,0.6); }
        .month-cell:active { transform: translateY(0) scale(0.98); }
        .month-today-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: ${C.gold};
          color: #0A0C10;
          font-weight: 700;
        }
        .month-chip { transition: transform 0.12s ease; }

        .session-card { transition: transform 0.15s ease, border-color 0.15s ease; }
        .session-card:hover { transform: translateX(2px); border-color: var(--session-color, ${C.border}) !important; }

        /* Buscador del reino */
        .search-backdrop { position: fixed; inset: 0; z-index: 35; background: transparent; cursor: default; }
        .search-input { background: transparent; border: none; outline: none; color: ${C.text}; }
        .search-input::placeholder { color: ${C.mutedDim}; }
        .search-result-row { transition: background 0.15s ease, transform 0.1s ease; }
        .search-result-row:hover { background: ${C.border}; transform: translateX(2px); }
        .search-result-row:active { transform: translateX(1px) scale(0.99); }

        /* Cuaderno personal del estudiante, dentro de cada clase */
        .personal-notebook {
          background-color: #12151b;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 25px,
            ${C.gold}24 26px
          );
        }
        .notebook-textarea {
          background: transparent;
          border: none;
          outline: none;
          resize: vertical;
          color: ${C.text};
          line-height: 26px;
          font-family: ${FONT_BODY};
          min-height: 130px;
        }
        .notebook-textarea::placeholder { color: ${C.mutedDim}; }

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

        @keyframes badgeToastIn {
          from { opacity: 0; transform: translate(24px, -10px) scale(0.9); }
          to { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        .badge-up-toast { animation: badgeToastIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
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
          background: radial-gradient(circle, var(--ping-color, ${C.gold}) 0%, transparent 70%);
          animation: xpPing 0.7s ease-out;
          pointer-events: none;
        }

        /* Anillo mágico giratorio alrededor del escudo, activado desde el Nivel 2. */
        @keyframes levelRingSpin { to { transform: rotate(360deg); } }
        .level-ring-effect {
          position: absolute;
          inset: -9px;
          border-radius: 9999px;
          background: conic-gradient(from 0deg, var(--ring-color-lvl, ${C.gold}), transparent 40%, var(--ring-color-lvl, ${C.gold}));
          animation: levelRingSpin 3s linear infinite;
          opacity: 0.6;
          pointer-events: none;
        }

        /* Segundo anillo, girando en sentido contrario y con su propio color,
           activado desde el Nivel 4 (entrada a la corte). */
        @keyframes levelRingSpinReverse { to { transform: rotate(-360deg); } }
        .level-ring-effect-secondary {
          position: absolute;
          inset: -15px;
          border-radius: 9999px;
          background: conic-gradient(from 180deg, var(--ring2-color-lvl, ${C.gold}), transparent 35%, var(--ring2-color-lvl, ${C.gold}));
          animation: levelRingSpinReverse 4.5s linear infinite;
          opacity: 0.45;
          pointer-events: none;
        }

        /* Barrido de brillo cruzando la cara del escudo, activado desde el Nivel 4. */
        @keyframes crestShineSweep {
          0% { background-position: 130% 0%; }
          100% { background-position: -30% 100%; }
        }
        .crest-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 48%, transparent 66%);
          background-size: 240% 240%;
          animation: crestShineSweep 3.2s ease-in-out infinite;
          pointer-events: none;
        }

        /* Remache de escudo (8 destellos alrededor), activado desde el Nivel 5. */
        @keyframes rimGlint {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .level-rim-stud {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 3px;
          height: 9px;
          border-radius: 1px;
          background: var(--rim-color-lvl, ${C.gold});
          box-shadow: 0 0 4px var(--rim-color-lvl, ${C.gold});
          animation: rimGlint 2.4s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* Resplandor propio detrás del escudo, activado desde el Nivel 2. */
        @keyframes extraGlowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.08); }
        }
        .level-extra-glow {
          position: absolute;
          inset: -10px;
          border-radius: 9999px;
          background: radial-gradient(circle, var(--glow-color-lvl, ${C.gold}) 0%, transparent 70%);
          filter: blur(5px);
          animation: extraGlowPulse 2.4s ease-in-out infinite;
          pointer-events: none;
        }

        /* Chispas mágicas orbitando el escudo, activadas desde el Nivel 3. */
        .level-sparkle-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: var(--sparkle-color-lvl, ${C.gold});
          box-shadow: 0 0 6px 1px var(--sparkle-color-lvl, ${C.gold});
          animation: twinkle 1.8s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
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
          .nav-transition,
          .pomodoro-flash,
          .planner-form-in {
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
          .badge-up-toast,
          .level-up-particle,
          .xp-ping,
          .level-ring-effect,
          .level-ring-effect-secondary,
          .level-extra-glow,
          .level-sparkle-dot,
          .crest-shine,
          .level-rim-stud,
          .flame-flicker,
          .course-seal-ring {
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
        classesDoneInLevel={classesDoneInLevel}
        classesNeededInLevel={classesNeededInLevel}
        isMaxLevel={isMaxLevel}
        onOpenLevels={openLevels}
        progressLoaded={progressLoaded}
        streak={streak}
        pomodoro={{
          mode: pomodoroMode,
          secondsLeft: pomodoroSecondsLeft,
          running: pomodoroRunning,
          sessionsDone: pomodoroSessionsDone,
          open: pomodoroOpen,
          flash: pomodoroFlash,
          focusMinutes: pomodoroFocusMinutes,
          breakMinutes: pomodoroBreakMinutes,
        }}
        onPomodoroToggleOpen={togglePomodoroOpen}
        onPomodoroToggleRun={togglePomodoroRun}
        onPomodoroReset={resetPomodoroPhase}
        onPomodoroSkip={skipPomodoroPhase}
        onPomodoroChangeFocus={changePomodoroFocusMinutes}
        onPomodoroChangeBreak={changePomodoroBreakMinutes}
        onSearchNavigate={handleSearchNavigate}
        onOpenFlashcards={openFlashcards}
        onOpenPlanner={openPlanner}
      />

      <div
        key={`${view}-${courseId || ''}-${topicId || ''}-${classId || ''}-${notesCourseId || ''}-${notesTopicId || ''}`}
        className={`nav-transition nav-${direction}`}
      >
        {view === 'home' && (
          <HomeView completedMap={completedMap} onOpenCourse={openCourse} onOpenNotesCourse={openNotesCourse} onOpenFlashcards={openFlashcards} onOpenPlanner={openPlanner} />
        )}

        {view === 'levels' && (
          <LevelsView
            completedCount={completedCount}
            completedMap={completedMap}
            streak={streak}
            unlockedBadges={unlockedBadges}
            onBack={goHome}
            onResetProgress={resetProgress}
          />
        )}

        {view === 'flashcards' && (
          <FlashcardsView flashcardProgress={flashcardProgress} onRate={rateFlashcard} onBack={goHome} />
        )}

        {view === 'planner' && (
          <PlannerView
            sessions={plannerSessions}
            onAddSession={addPlannerSession}
            onToggleDone={togglePlannerSessionDone}
            onDeleteSession={deletePlannerSession}
            onBack={goHome}
          />
        )}

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
            personalNotes={personalNotes}
            onSaveNote={saveNote}
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
              {levelUpToast.unlockMessage && (
                <p style={{ color: C.mutedDim }} className="text-xs mt-0.5">{levelUpToast.unlockMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {badgeToast && (
        <div className="badge-up-toast" style={{ position: 'fixed', top: 88, right: 16, zIndex: 50, maxWidth: 260 }}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: C.surface, border: `1px solid ${badgeToast.color}`, boxShadow: `0 10px 30px -10px ${badgeToast.color}88` }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 36, height: 36, background: `${badgeToast.color}22`, border: `1px solid ${badgeToast.color}` }}
            >
              <badgeToast.icon size={18} color={badgeToast.color} />
            </div>
            <div className="text-left leading-tight">
              <p style={{ color: C.text }} className="text-xs font-semibold">¡Insignia desbloqueada!</p>
              <p style={{ color: badgeToast.color }} className="text-xs">{badgeToast.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}