import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReporteProblemasService } from '../../services/reporte-problemas.service';
import { Reportes } from '../../models/Reportes';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VtnSubirImagenComponent } from '../../shared/vtn-subir-imagen/vtn-subir-imagen.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/Usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crud-reportes-problemas',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
  ],
  templateUrl: './crud-reportes-problemas.component.html',
})
export class CrudReportesProblemasComponent implements OnInit, AfterViewInit {
  myForm!: FormGroup;
  isEditMode: boolean = false;
  currentId!: number;
  displayedColumns: string[] = [];

  //Login
  tipoUsuario: string | null = null;
  usuarioLogueado: Usuario | null = null;

  verBotones: boolean = false;

  actualizarColumnas() {
    this.displayedColumns = this.verBotones
      ? [
          'id',
          'titulo',
          'categoria',
          'fecha',
          'estado',
          'actions',
          // 'fecha',
          // 'ver',
        ]
      : [
          'id',
          'titulo',
          'categoria',
          'fecha',
          'estado',
          // 'ver',
        ];
  }

  dataSource = new MatTableDataSource<Reportes>();

  //paginación
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private miServicio: ReporteProblemasService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {}

  cargarReportes(): void {
    this.miServicio.getReportes().subscribe((data: Reportes[]) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void {
    this.cargarReportes();

    this.myForm = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.]+$/),
        ],
      ],
      descripcion: ['', Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.]+$/)],
      categoria: ['', [Validators.required]],
      direccion: ['', [Validators.required], Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.]+$/)],
      //y que fecha no se pueda tocar
      //tambien que admita puntos

      fecha: [{ value: new Date(), disabled: true }],
      estado: ['', [Validators.required]],
      imagen: [''],
    });

    const usuarioStorage = localStorage.getItem('usuarioLogueado');
    if (usuarioStorage) {
      this.usuarioLogueado = JSON.parse(usuarioStorage);
      this.tipoUsuario = this.usuarioLogueado?.tipo_usuario || null;
      if (!this.tipoUsuario) {
        this.router.navigate(['/login']);
      }
      if (this.tipoUsuario === 'funcionario') {
        this.verBotones = true;
      } else {
        this.verBotones = false;
      }
    } else {
      this.router.navigate(['/login']);
    }
    this.actualizarColumnas();
  }

  //Método para guardar el reporte
  onSave() {
    this.myForm.get('imagen')?.setValue(this.nombreImagenSeleccionada);
    if (this.myForm.invalid) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    let reporteAGuardar: Reportes = this.myForm.value;

    if (this.isEditMode) {
      //Editar
      reporteAGuardar.id = this.currentId;
      reporteAGuardar.fecha = new Date().toString();

      this.miServicio
        .editReporte(reporteAGuardar)
        .subscribe((reporteEditado) => {
          alert('El report ha sido actualizada correctamente.');
          // this.clearForm();
          this.cargarReportes();
        });
    } else {
      this.miServicio.getReportes().subscribe((data: Reportes[]) => {
        reporteAGuardar.id = this.getIdMayor(data) + 1;
        reporteAGuardar.usuarioId = 1;
        reporteAGuardar.fecha = new Date().toString();
        this.miServicio.addReporte(reporteAGuardar).subscribe(() => {
          alert('El reporte ha sido guardada correctamente.');
          this.cargarReportes();
        });
      });
    }
  }

  //metodo para obtener el id mayor en el json
  getIdMayor(reportes: Reportes[]): number {
    return reportes.reduce((max, r) => (r.id > max ? r.id : max), 0);
  }

  //Abrir el dialogo para subir imagen
  imagenSeleccionada: string | null = null;
  nombreImagenSeleccionada: string | null = null;

  abrirDialogoSubirImagen(): void {
    const dialogRef = this.dialog.open(VtnSubirImagenComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.type === 'file' && result.dataUrl) {
          this.imagenSeleccionada = result.dataUrl;
          this.nombreImagenSeleccionada = result.fileName;
        } else if (result.type === 'url') {
          this.imagenSeleccionada = result.fileName;
          this.nombreImagenSeleccionada = result.fileName;
        }
      }
    });
  }

  //Limpiar formulario
  clearForm() {
    this.myForm.reset();
    this.isEditMode = false;
    this.currentId = 0;
    this.imagenSeleccionada = null;
    this.nombreImagenSeleccionada = null;
  }

  //buscar reportes
  search(cajaTexto: HTMLInputElement) {
    if (cajaTexto.value) {
      this.miServicio
        .getReporteSearch(cajaTexto.value)
        .subscribe((data: Reportes[]) => {
          this.dataSource.data = data;
        });
    } else {
      this.cargarReportes();
    }
  }

  eliminar(reporte: Reportes) {
    if (this.tipoUsuario === 'funcionario') {
      const confirmado = confirm(
        `Está seguro de que desea eliminar el siguiente registro? \n"${reporte.titulo}"`
      );
      if (confirmado) {
        this.miServicio.deleteReporte(reporte).subscribe({
          next: () => {
            alert(`el reporte ha sido eliminado correctamente.`);
            this.cargarReportes();
          },
          error: (err) => {
            console.error('Error al eliminar el reporte:', err);
            alert('Ocurrió un error al intentar eliminar el reporte.');
          },
        });
      }
    } else {
      alert(
        'No tiene permisos para eliminar reportes. Comuníquese con un funcionario.'
      );
    }
  }

  editar(reporte: Reportes) {
    this.isEditMode = true;
    this.currentId = reporte.id;

    this.myForm.setValue({
      titulo: reporte.titulo,
      categoria: reporte.categoria,
      fecha: new Date(reporte.fecha),
      descripcion: reporte.descripcion,
      direccion: reporte.direccion,
      estado: reporte.estado,
      imagen: reporte.imagen,
    });
  }
}
