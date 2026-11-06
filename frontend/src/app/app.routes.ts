import { Routes } from '@angular/router';
import { homeRedirect, studentGuard, teacherGuard } from './core/auth.guard';

/** Rutas de las pantallas de diseño (PROMPT_SISTEMAS · sección 5). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: homeRedirect },

  // A. Entrada
  { path: 'ingreso', title: 'Ingreso · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  { path: 'ingreso/docente', title: 'Ingreso docente · GADMI Sost-Empresarial', data: { rol: 'docente' }, loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  { path: 'ingreso/estudiante', title: 'Ingreso estudiante · GADMI Sost-Empresarial', data: { rol: 'estudiante' }, loadComponent: () => import('./pages/entrada/login').then((m) => m.LoginPage) },
  // Verificar certificado: página pública del QR
  { path: 'verificar', title: 'Verificar certificado · GADMI Sost-Empresarial', loadComponent: () => import('./pages/final/verificar').then((m) => m.VerificarPage) },
  { path: 'verificar/:codigo', title: 'Verificar certificado · GADMI Sost-Empresarial', loadComponent: () => import('./pages/final/verificar').then((m) => m.VerificarPage) },

  // Créditos y licencia (pública, enlazada desde el pie de página)
  { path: 'creditos', title: 'Créditos y licencia · GADMI Sost-Empresarial', loadComponent: () => import('./pages/final/creditos').then((m) => m.CreditosPage) },

  // E. Docente
  {
    path: 'docente',
    canActivate: [teacherGuard],
    children: [
      { path: '', title: 'Panel del curso · GADMI Sost-Empresarial', loadComponent: () => import('./pages/docente/panel').then((m) => m.PanelDocentePage) },
      { path: 'estudiante/:id', title: 'Detalle del estudiante · GADMI Sost-Empresarial', loadComponent: () => import('./pages/docente/detalle').then((m) => m.DetalleDocentePage) },
      { path: 'bitacoras', title: 'Revisar bitácoras · GADMI Sost-Empresarial', loadComponent: () => import('./pages/docente/bitacoras').then((m) => m.RevisarBitacorasPage) },
    ],
  },

  // Estudiante
  {
    path: '',
    canActivate: [studentGuard],
    children: [
      { path: 'conectando', title: 'Conectando · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/conectando').then((m) => m.ConectandoPage) },
      { path: 'primera-vez', title: 'Primera vez · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/primera-vez').then((m) => m.PrimeraVezPage) },
      { path: 'bienvenida', title: 'Bienvenida · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/bienvenida').then((m) => m.BienvenidaPage) },
      { path: 'video', title: 'Video de bienvenida · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/video').then((m) => m.VideoPage) },
      { path: 'carta', title: 'Carta de la junta · GADMI Sost-Empresarial', loadComponent: () => import('./pages/entrada/carta').then((m) => m.CartaPage) },
      // B. Recorrido
      { path: 'ruta', title: 'Ruta · GADMI Sost-Empresarial', loadComponent: () => import('./pages/juego/ruta').then((m) => m.RutaPage) },
      { path: 'modulo/:id', title: 'Módulo · GADMI Sost-Empresarial', loadComponent: () => import('./pages/juego/intro-modulo').then((m) => m.IntroModuloPage) },
      { path: 'reto/:code', title: 'Reto · GADMI Sost-Empresarial', loadComponent: () => import('./retos/reto-page').then((m) => m.RetoPage) },
      // C. Cierre de módulo
      { path: 'bitacora/:id', title: 'Bitácora · GADMI Sost-Empresarial', loadComponent: () => import('./pages/juego/bitacora').then((m) => m.BitacoraPage) },
      { path: 'temporada/:id', title: 'Temporada · GADMI Sost-Empresarial', loadComponent: () => import('./pages/juego/temporada').then((m) => m.TemporadaPage) },
      { path: 'logros', title: 'Mis logros · GADMI Sost-Empresarial', loadComponent: () => import('./pages/juego/logros').then((m) => m.LogrosPage) },
      // D. Final
      { path: 'inversion', title: 'Ronda de inversión · GADMI Sost-Empresarial', loadComponent: () => import('./pages/final/inversion').then((m) => m.InversionPage) },
      // Certificado e informe en una sola pantalla (la ruta /informe ya no existe)
      { path: 'barra', title: 'Tu barra · GADMI Sost-Empresarial', loadComponent: () => import('./pages/final/barra').then((m) => m.BarraPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
