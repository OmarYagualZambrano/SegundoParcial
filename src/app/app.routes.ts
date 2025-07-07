import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CrudForoComponent } from './components/crud-foro/crud-foro.component';
import { CrudUsuarioComponent } from './components/crud-usuario/crud-usuario.component';
import { HomeComponent } from './components/home/home.component';
import { ProblemCategoryCrudComponent } from './components/problem-category-crud/problem-category-crud.component';
import { CrudReportesProblemasComponent } from './components/crud-reportes-problemas/crud-reportes-problemas.component';
import { CrudZonasComponent } from './components/crud-zonas/crud-zonas.component';
import { CrudRespuestasComponent } from './components/crud-respuestas/crud-respuestas.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'foro', component: CrudForoComponent },
  { path: 'usuario', component: CrudUsuarioComponent },
  { path: 'home', component: HomeComponent },
  { path: 'categorias', component: ProblemCategoryCrudComponent },
  // {path:"problemas",component:CrudReportesProblemasComponent},
  {
    path: 'reportes',
    title: 'Reportes de Problemas',
    component: CrudReportesProblemasComponent,
  },
  { path: 'zonas', component: CrudZonasComponent },
  { path: 'respuestas', component: CrudRespuestasComponent },
  { path: '**', redirectTo: 'home' },
];
