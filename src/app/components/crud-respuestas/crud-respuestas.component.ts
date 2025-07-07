import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Respuestas } from '../../models/Respuestas';
import { RespuestaService } from '../../services/respuestas-foros.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ReporteProblemasService } from '../../services/reporte-problemas.service';
import { Reportes } from '../../models/Reportes';
import { VtnModalComponent } from '../../shared/vtn-modal/vtn-modal.component';

@Component({
  selector: 'app-crud-respuestas',
  templateUrl: './crud-respuestas.component.html',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatIconModule,
    NgIf,
    VtnModalComponent,
    NgClass,
  ],
  styleUrls: ['./crud-respuestas.component.css'],
})
export class CrudRespuestasComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  currentId!: number;
  reportes: any[] = [];
  showForm = false;
  selectedRespuesta: any = null;
  isModalOpen = false;
  respuestaAEliminar: any = null;
  esFuncionario: boolean = false; //para el login

  displayedColumns: string[] = [
    'id',
    'titulo',
    'categoria',
    'funcionario',
    'mensaje',
    'estado',
    'fecha',
    'actions',
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private respuestaService: RespuestaService,
    private reporteService: ReporteProblemasService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReportes();
    const rol = localStorage.getItem('rol');
    this.esFuncionario = rol === 'funcionario';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.paginator.pageSize = 10;
  }

  initForm(): void {
    this.form = this.fb.group({
      reporteId: [null, Validators.required],
      funcionario: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      fecha: [new Date().toISOString().split('T')[0]],
      estado: ['Pendiente', Validators.required],
      archivo: [null],
    });
  }

  loadReportes(): void {
    this.respuestaService.getReportesConRespuestas().subscribe({
      next: (data) => {
        this.reportes = data;
        this.dataSource.data = data;
        if (this.paginator) {
          this.paginator.firstPage();
        }
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
      },
    });
  }

  search(searchInput: HTMLInputElement): void {
    if (searchInput.value) {
      const filteredData = this.reportes.filter(
        (reporte) =>
          reporte.titulo
            .toLowerCase()
            .includes(searchInput.value.toLowerCase()) ||
          reporte.categoria
            .toLowerCase()
            .includes(searchInput.value.toLowerCase()) ||
          reporte.funcionario
            .toLowerCase()
            .includes(searchInput.value.toLowerCase())
      );
      this.dataSource.data = filteredData;
    } else {
      this.dataSource.data = this.reportes;
    }
  }

  responderReporte(item: any) {
    this.isEditMode = false; // modo creación
    this.selectedRespuesta = {
      reporteId: item.reporteId || item.id,
      funcionario: '',
      mensaje: '',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
    };

    this.form.reset(); // opcional
    this.form.patchValue(this.selectedRespuesta);

    this.showForm = true;
    setTimeout(() => {
      document
        .querySelector('.form-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Si es edición, incluir el ID
    if (this.isEditMode) {
      formValue.id = this.currentId;
    }

    const operation = this.isEditMode
      ? this.respuestaService.updateRespuesta(formValue)
      : this.respuestaService.addRespuesta(formValue);

    operation.subscribe({
      next: () => {
        this.closeForm();
        this.loadReportes(); // Recargar siempre para asegurar datos actualizados
      },
      error: (err) => console.error('Error:', err),
    });
  }

  nuevaRespuesta(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.form.reset({
      reporteId: null,
      funcionario: '',
      mensaje: '',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
    });

    document
      .querySelector('.form-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  // En el componente
  eliminarRespuesta(id: number): void {
    if (confirm('¿Eliminar esta respuesta?')) {
      this.respuestaService.deleteRespuesta(id).subscribe({
        next: () => {
          // Recargar desde backend para asegurar consistencia
          this.loadReportes();
        },
        error: (err) => {
          console.error('Error eliminando:', err);
        },
      });
    }
  }

  editarRespuesta(item: any) {
    if (!item.tieneRespuesta) return;

    // Obtener el ID de la respuesta real
    this.respuestaService
      .getRespuestasByReporte(item.id)
      .subscribe((respuestas) => {
        if (respuestas.length > 0) {
          const respuesta = respuestas[0];
          this.isEditMode = true;
          this.currentId = respuesta.id; // Guardar el ID real de la respuesta

          this.selectedRespuesta = {
            id: respuesta.id,
            reporteId: item.id,
            funcionario: respuesta.funcionario,
            mensaje: respuesta.mensaje,
            estado: respuesta.estado,
            fecha: respuesta.fecha,
          };

          this.form.patchValue(this.selectedRespuesta);
          this.showForm = true;

          setTimeout(() => {
            document
              .querySelector('.form-section')
              ?.scrollIntoView({ behavior: 'smooth' });
          }, 0);
        }
      });
  }

  resetForm(): void {
    this.form.reset({
      reporteId: null,
      funcionario: '',
      mensaje: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      archivo: null,
    });
    this.isEditMode = false;
    this.currentId = 0;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  openEliminarModal(item: any) {
    this.respuestaAEliminar = item;
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.respuestaAEliminar = null;
  }

  confirmarAccion() {
    if (this.respuestaAEliminar) {
      this.eliminarRespuesta(this.respuestaAEliminar);
    }
    this.cerrarModal();
  }
}
