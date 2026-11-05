import { Routes } from '@angular/router';
import { homeRedirect, studentGuard, teacherGuard } from './core/auth.guard';

/** Rutas de las pantallas de diseño (PROMPT_SISTEMAS · sección 5). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: homeRedirect },

  // A. Entrada
  { path: 'ingreso', title: 'Ingreso · GADMI', loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  { path: 'ingreso/docente', title: 'Ingreso docente · GADMI', data: { rol: 'docente' }, loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  { path: 'ingreso/estudiante', title: 'Ingreso estudiante · GADMI', data: { rol: 'estudiante' }, loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  // Verificar certificado: página pública del QR
  { path: 'verificar', title: 'Verificar certificado · GADMI', loadComponent: () => import('./pages/final/verificar').then((m) => m.VerificarPage) },
  { path: 'verificar/:codigo', title: 'Verificar certificado · GADMI', loadComponent: () => import('./pages/final/verificar').then((m) => m.VerificarPage) },

  // E. Docente
  {
    path: 'docente',
    canActivate: [teacherGuard],
    children: [
      { path: '', title: 'Panel del curso · GADMI', loadComponent: () => import('./pages/docente/panel').then((m) => m.PanelDocentePage) },
      { path: 'estudiante/:id', title: 'Detalle del estudiante · GADMI', loadComponent: () => import('./pages/docente/detalle').then((m) => m.DetalleDocentePage) },
      { path: 'bitacoras', title: 'Revisar bitácoras · GADMI', loadComponent: () => import('./pages/docente/bitacoras').then((m) => m.RevisarBitacorasPage) },
    ],
  },

  // Estudiante
  {
    path: '',
    canActivate: [studentGuard],
    children: [
      { path: 'conectando', title: 'Conectando · GADMI', loadComponent: () => import('./pages/entrada/conectando').then((m) => m.ConectandoPage) },
      { path: 'primera-vez', title: 'Primera vez · GADMI', loadComponent: () => import('./pages/entrada/primera-vez').then((m) => m.PrimeraVezPage) },
      { path: 'bienvenida', title: 'Bienvenida · GADMI', loadComponent: () => import('./pages/entrada/bienvenida').then((m) => m.BienvenidaPage) },
      { path: 'video', title: 'Video de bienvenida · GADMI', loadComponent: () => import('./pages/entrada/video').then((m) => m.VideoPage) },
      { path: 'carta', title: 'Carta de la junta · GADMI', loadComponent: () => import('./pages/entrada/carta').then((m) => m.CartaPage) },
      // B. Recorrido
      { path: 'ruta', title: 'Ruta · GADMI', loadComponent: () => import('./pages/juego/ruta').then((m) => m.RutaPage) },
      { path: 'modulo/:id', title: 'Módulo · GADMI', loadComponent: () => import('./pages/juego/intro-modulo').then((m) => m.IntroModuloPage) },
      { path: 'reto/:code', title: 'Reto · GADMI', loadComponent: () => import('./retos/reto-page').then((m) => m.RetoPage) },
      // C. Cierre de módulo
      { path: 'bitacora/:id', title: 'Bitácora · GADMI', loadComponent: () => import('./pages/juego/bitacora').then((m) => m.BitacoraPage) },
      { path: 'temporada/:id', title: 'Temporada · GADMI', loadComponent: () => import('./pages/juego/temporada').then((m) => m.TemporadaPage) },
      { path: 'logros', title: 'Mis logros · GADMI', loadComponent: () => import('./pages/juego/logros').then((m) => m.LogrosPage) },
      // D. Final
      { path: 'inversion', title: 'Ronda de inversión · GADMI', loadComponent: () => import('./pages/final/inversion').then((m) => m.InversionPage) },
      // Certificado e informe en una sola pantalla (la ruta /informe ya no existe)
      { path: 'barra', title: 'Tu barra · GADMI', loadComponent: () => import('./pages/final/barra').then((m) => m.BarraPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
