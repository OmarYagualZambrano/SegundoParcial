import { 
  Component, 
  ChangeDetectionStrategy, 
  AfterViewInit, 
  ViewChild, 
  OnInit, 
  TemplateRef 
} from '@angular/core';

// (Angular Common) -- Utilidades para directivas estructurales.
import { NgFor, NgIf } from '@angular/common';


import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

// (Angular Forms) -- Herramientas para la creación y validación de formularios.
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


// (Angular Platform Browser) -- Servicios para la manipulación de recursos en el DOM.
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

// (Módulos de UI) -- Componentes de Angular Material para la interfaz de usuario.
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';

// (Modelos y Servicios) -- Modelos de datos y servicios del componente.
import { Zona } from '../../models/zonas';
import { ServZonaService } from '../../services/serv-zona.service';

@Component({
  selector: 'app-crud-zonas',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatDividerModule, MatIconModule,ReactiveFormsModule,MatFormFieldModule ,MatInputModule, MatDialogModule,FormsModule,MatExpansionModule,MatListModule ,NgIf, NgFor],
  templateUrl: './crud-zonas.component.html',
  styleUrl: './crud-zonas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
  
export class CrudZonasComponent implements OnInit, AfterViewInit {
  zona: Zona[] = [];
  zonaSeleccionada: Zona | null = null;
  zonaForm!: FormGroup;
  dialogRef!: MatDialogRef<any>;
  filtroCiudad: string = '';
  dataSource = new MatTableDataSource<Zona>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('editarZonaDialog') editarZonaDialog!: TemplateRef<any>;
  @ViewChild('crearZonaDialog') crearZonaDialog!: TemplateRef<any>;
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private servicioZonas: ServZonaService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
  ) { }
    
  displayedColumns: string[] = ['id', 'nombre', 'ciudad','ubicacion', 'acciones'];
  
  //propiedades para manejar la ubicacion (ltd,long) mediante las ciudades con el json
  ciudadesJson: any[] = [];
  provincias: Array<{ nombre: string; ciudades: any[] }> = [];
  
  ngOnInit(): void {
    this.servicioZonas.getZonas().subscribe((data) => {
      this.zona = data;
      this.dataSource.data = data;
    })
    this.cargarCiudades();
  }

  cargarCiudades() {
    this.http.get<any[]>('http://localhost:3000/ciudades').subscribe({
      next: data => {
        this.ciudadesJson = data;
        this.agruparPorProvincia();
      },
      error: err => {
        console.error('Error cargando ciudades:', err);
      }
    });
  }

  agruparPorProvincia() {
    const map = new Map<string, any[]>();
    for (const ciudad of this.ciudadesJson) {
      if (!map.has(ciudad.admin_name)) {
        map.set(ciudad.admin_name, []);
      }
      map.get(ciudad.admin_name)!.push(ciudad);
    }
    this.provincias = Array.from(map, ([nombre, ciudades]) => ({ nombre, ciudades }));
  }

  seleccionarCiudad(ciudad: any) {
    this.zonaForm.patchValue({
      ciudad: ciudad.city,
      ubicacion: `${ciudad.lat}, ${ciudad.lng}`
    });
  }

  seleccionarZona(row: Zona) {
    this.zonaSeleccionada = row;
  }

  //metodo para la ubicacion mediante google maps
  getMapUrl(coords: string): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${coords}&hl=es&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  private inicializarFormulario(zona?: Zona) {
    this.zonaForm = this.fb.group({
      id: [zona ? zona.id : null],
      nombre: [zona ? zona.nombre : '', [Validators.required, Validators.minLength(3)]],
      ciudad: [zona ? zona.ciudad : '', [Validators.required, Validators.minLength(4)]],
      ubicacion: [zona ? zona.ubicacion : '', [Validators.required, Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)]],
      imagenUrl: [zona ? zona.imagenUrl : '', [Validators.required, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i)]]
    });
  }
  
  
  editarZona(zona: any) {
    this.inicializarFormulario(zona);
  
    this.dialogRef   = this.dialog.open(this.editarZonaDialog, {
      width: '600px'
    });
  }
  
  eliminarZona(zona:Zona) {
    this.servicioZonas.eliminarZona(zona).subscribe((zona)=>{});
  }


  cerrarDialog() {
    this.dialogRef.close();
  }
  
  guardarZona() {
    if (this.zonaForm.valid) {
      const zonaActualizada = this.zonaForm.value;
      this.servicioZonas.actualizarZona(zonaActualizada).subscribe((res) => {
        
        this.servicioZonas.getZonas().subscribe(data => {
          this.zona = data;
          this.dataSource.data = data;
          // Reasignar el paginator (por si acaso)
          this.dataSource.paginator = this.paginator;
        });
        this.dialogRef.close();
      });
    } else {
      console.log("Zona no valida");
    }
  }

  abrirDialogoCrearZona() {
    this.inicializarFormulario();
    this.zonaForm.reset(); 
    this.dialogRef = this.dialog.open(this.crearZonaDialog, {
      width:"900px"
    });
  }

  crearZona() {
    const nuevaZona = this.zonaForm.value;
    // Generamos un ID que no se repita
    nuevaZona.id = this.generarIdUnico().toString();
    this.servicioZonas.crearZona(nuevaZona).subscribe(() => {
        this.servicioZonas.getZonas().subscribe((data) => {
        this.zona = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      });  
      this.cerrarDialog(); // Cerrar el modal
    });
  }
  
  generarIdUnico(): number {
    let id: number;
    do {
      id = Math.floor(Math.random() * 1000000); 
    } while (this.zona.some(z => z.id === id));
    return id;
  }

  filtrarZona() {
    this.servicioZonas.getZonasPorCiudad(this.filtroCiudad).subscribe(zonasFiltradas => {
      console.log("ZONA FILTRADA: ",zonasFiltradas);
      this.zona = zonasFiltradas;
      this.dataSource.data = zonasFiltradas;
    });
  }

  resetearFiltro() {
    this.filtroCiudad = '';
    this.servicioZonas.getZonas().subscribe(todasLasZonas => {
      this.zona = todasLasZonas;
      this.dataSource.data = todasLasZonas;
    })
  }
}
