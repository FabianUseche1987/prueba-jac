import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginForm } from '../auth/login-form/login-form';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, LoginForm],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  protected readonly auth = inject(AuthService);

  // Cada tarjeta corresponde a un módulo de la base de datos
  servicios = [
    {
      icono: 'bi-calendar-event',
      titulo: 'Reuniones y asambleas',
      texto: 'Consulta las convocatorias, el orden del día y lo que se decidió en cada reunión.',
    },
    {
      icono: 'bi-house-heart',
      titulo: 'Proyectos comunitarios',
      texto: 'Sigue el avance y el presupuesto de las obras, y deja tu opinión.',
    },
    {
      icono: 'bi-megaphone',
      titulo: 'Avisos',
      texto: 'Recibe las convocatorias y noticias importantes de tu junta.',
    },
    {
      icono: 'bi-file-earmark-text',
      titulo: 'Actas y documentos',
      texto: 'Revisa las actas, informes y demás documentos de la junta.',
    },
    {
      icono: 'bi-people',
      titulo: 'Junta directiva',
      texto: 'Conoce quiénes son el presidente, tesorero, secretario y demás dignatarios.',
    },
    {
      icono: 'bi-buildings',
      titulo: 'Bienes comunales',
      texto: 'Conoce el salón comunal, las canchas y los parques que administra tu junta.',
    },
  ];

  pasos = [
    { titulo: 'Regístrate', texto: 'Crea tu cuenta con tus datos básicos.' },
    { titulo: 'Ingresa', texto: 'Inicia sesión para ver la información de tu junta.' },
    { titulo: 'Participa', texto: 'Asiste a las reuniones, sigue los proyectos y comenta.' },
  ];
}
