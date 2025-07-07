import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import { VtnModalComponent } from '../../shared/vtn-modal/vtn-modal.component';
import { TablaDinamicaComponent } from '../../shared/tabla-dinamica/tabla-dinamica.component';
import { foro } from '../../models/foro';
import { ServForoService } from '../../services/serv-foro.service';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Usuario } from '../../models/Usuario';
import { Router } from '@angular/router';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-crud-foro',
  imports: [MatButtonModule,
    VtnModalComponent,
    TablaDinamicaComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule],
  templateUrl: './crud-foro.component.html',
  styleUrl: './crud-foro.component.css'
})
export class CrudForoComponent {
isEditMode:boolean=false;
currenId!:number;
form!: FormGroup;
admi:boolean = true;
newPubli:boolean=false;
verTabla=false;
isViewForo=true;
itemPendienteBorrar: any = null;

//variables para el loguin
tipoUsuario: string | null = null;
usuarioLogueado: Usuario | null = null;
//discuciones:foro[]=[];

data:foro[] = [];
displayedColumns=[ 'titulo','contenido','id','acciones'];


//variables del imput
emailFormControl = new FormControl('', [Validators.required, Validators.email]);
matcher = new MyErrorStateMatcher();

constructor(private servicio:ServForoService,private fb:FormBuilder,private router: Router){

}

ngOnInit():void{
    this.cargarDiscuciones();
    console.log(this.data);
    this.form=this.fb.group({
      titulo:["",[Validators.required,Validators.minLength(3)]],
      contenido:["",[Validators.required,Validators.minLength(3)]],
      id:["",[Validators.required]],
    });


const usuarioStorage = localStorage.getItem('usuarioLogueado');
    if (usuarioStorage) {
      this.usuarioLogueado = JSON.parse(usuarioStorage);
      this.tipoUsuario = this.usuarioLogueado?.tipo_usuario || null;
      if (!this.tipoUsuario) {
        this.router.navigate(['/login']);
      }
      if (this.tipoUsuario==="funcionario") {
              this.verTabla=true;
              this.isViewForo=false;
      }else{
              this.verTabla=false;
              this.isViewForo=true;
      }
    } else {
      this.router.navigate(['/login']);
    }

}

cargarDiscuciones():void{
    //lamar al metodo del serivico
  this.servicio.getForo().subscribe((data:foro[])=>{
    this.data=data;
  });
}

//funciones para la table
manejarEdicion(item: foro): void {
  this.newPubli=true;
  console.log('Editar:', item);
  this.isEditMode=true;
  this.editar(item);
}

manejarBorrado(item: any): void {
  console.log('Borrar:', item);
  this.itemPendienteBorrar = item;
  this.isModalOpen=true;
}


// funciones para la  ventana modal
isModalOpen = false;
  openModal() {this.isModalOpen = true;}

  cerrarModal() {
    this.isModalOpen = false;
    this.itemPendienteBorrar=null;
  }

  confirmarAccion() {
    if(this.itemPendienteBorrar){
      console.log('esto esta despues del modal',this.itemPendienteBorrar)
      this.eliminar(this.itemPendienteBorrar);
    }

    this.isModalOpen=false;
  }

editar(foro:foro):void{
    this.isEditMode=true;
    this.currenId=foro.id;
    this.form.setValue({
      titulo:foro.titulo,
      contenido:foro.contenido,
      id:foro.id
    })
  }


  eliminar(foro:foro):void{
    if(foro){
        this.servicio.eliminarForo(foro).subscribe(()=>{
        alert("foro eliminada exitosamente");
        this.cargarDiscuciones();
      })
    }else{
      console.log("algo salio mal");
    }

  }

  //datos enviados
  onSubmit() {
    if(this.form.invalid){
      this.form.markAllAsTouched();
    alert("Algunos datos pueden estar mal");
    return;
    }
    //obtener datos del formulario
    let foroGuardado:foro= this.form.value;

    if(this.isEditMode){
      //editar
      foroGuardado.id=this.currenId
      this.servicio.editForo(foroGuardado).subscribe((foroEditaro)=>{
        alert("se edito correctamente");
        this.cargarDiscuciones();
        this.isEditMode=false;
        this.newPubli=false;
      });
    }else{
      //agregar nuevo
      this.servicio.addForo(foroGuardado).subscribe((foronuevo)=>{
        alert("se Agrego correctamente");
        this.cargarDiscuciones();
      });
    }
  }
autoID() {
  this.newPubli=true
  const data = this.data; // obtiene los datos del JSON
  const lastId = data.length ? Math.max(...data.map(item => item.id)) : 0;
  this.form.setValue({
    id:lastId+1,
    titulo:"",
    contenido:""
  });
}

clearForm(){
    this.form.reset({
      titulo:"",
      contenido:"",
      id:null
    });
    this.isEditMode=false;
    this.currenId=0;
    this.newPubli=false;
  }

  verDatosTabla(){
    if(this.tipoUsuario==="ciudadano"){
      this.verTabla=false;
      alert("esta vista es solo para personal autorizado");
    }else{
      this.isViewForo=false;
      this.verTabla=true;
    }

  }
  verDatosForo(){
    this.verTabla=false;
    this.isViewForo=true;
  }


}
