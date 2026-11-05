import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

/** Solo estudiantes. Si falta la pantalla «Primera vez», la exige. */
export const studentGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const s = auth.student();
  if (!s) return router.createUrlTree(['/ingreso']);
  const free = state.url.startsWith('/primera-vez') || state.url.startsWith('/conectando');
  if (!s.aceptaPrivacidad && !free) return router.createUrlTree(['/primera-vez']);
  return true;
};

/** Solo docentes. */
export const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.teacher() ? true : inject(Router).createUrlTree(['/ingreso/docente']);
};

/** Entrada: estudiante → Conectando; docente → Panel; sin sesión → Ingreso. */
export const homeRedirect = () => {
  const auth = inject(AuthService);
  return auth.student() ? '/conectando' : auth.teacher() ? '/docente' : '/ingreso';
};
