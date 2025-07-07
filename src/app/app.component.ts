import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'reportes-comunidad';

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuarioLogueado');
  }

  logout() {
    localStorage.removeItem('usuarioLogueado');
    window.location.reload();
  }
}
