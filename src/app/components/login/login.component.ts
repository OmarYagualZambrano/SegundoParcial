import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/Usuario';
import { Router } from '@angular/router';
import { UsuarioAuthService } from '../../services/usuario-auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOption,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isRegistering = false;
  loginForm: FormGroup;
  errorMessage: string = '';
  usuarios: Usuario[] = [];
  registerForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: UsuarioAuthService // Inyecta el servicio de autenticación

  ) {
    this.loginForm = this.fb.group({
      usuario1: [''],
      contraseña: ['']
    });
    this.registerForm = this.fb.group({
    nombre: [''],
    apellido: [''],
    cedula: [''],
    usuario1: [''],
    tipo_usuario: [''],
    genero: [''],
    direccion: [''],
    contrasenia: ['']
  });
    this.cargarUsuarios();
  }

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
  }
  cargarUsuarios() {
  this.http.get<Usuario[]>('https://localhost:7241/api/usuarios').subscribe((data) => {
    this.usuarios = data;
  });

};

   login() {
    const { usuario1, contraseña } = this.loginForm.value;
    
    
    this.authService.login(usuario1, contraseña).subscribe({
      next: (res) => {
        this.errorMessage = '';
        alert('¡Login exitoso!');
        this.router.navigate(['/usuario']);
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }

  register() {
  if (this.registerForm.invalid) {
    alert('Por favor, complete todos los campos.');
    return;
  }
  const nuevoUsuario = {
    ...this.registerForm.value,
    id: this.generateUserId() 
  
  };
 
  this.http.post<Usuario>('https://localhost:7241/api/usuarios', nuevoUsuario)
    .subscribe({
      next: (usuario) => {
        alert('¡Usuario registrado exitosamente!');
        this.toggleRegister();
        this.cargarUsuarios();
        this.registerForm.reset();
      },
      error: (err) => {
        alert('Error al registrar usuario');
        console.error(err);
      }
    });
}

  redirectHome(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }
   // Genera un ID de 10 caracteres alfanuméricos
  private generateUserId(): string {
  return Math.random().toString(36).substring(2, 12);
}
}
