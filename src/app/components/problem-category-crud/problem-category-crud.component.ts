import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Importa AbstractControl

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Para diálogos de confirmación
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para notificaciones
// Podrías necesitar MatSelectModule, MatCheckboxModule, etc., para más tipos de campos

// Model and Service
import { ProblemCategory } from '../../models/problem-category.model';
import { ProblemCategoryService } from '../../services/problem-category.service';

// Opcional: Si creas un componente de diálogo de confirmación reutilizable
// import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-problem-category-crud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
    // Agrega aquí otros módulos de Angular Material que uses (ej: MatSelectModule)
  ],
  templateUrl: './problem-category-crud.component.html',
  styleUrls: ['./problem-category-crud.component.scss']
})
export class ProblemCategoryCrudComponent implements OnInit {
  // Inyección de dependencias moderna con inject()
  private fb = inject(FormBuilder);
  private problemCategoryService = inject(ProblemCategoryService);
  public dialog = inject(MatDialog); // Para diálogos de confirmación
  private snackBar = inject(MatSnackBar); // Para mostrar notificaciones

  categoryForm!: FormGroup;
  categories: ProblemCategory[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'icon', 'color', 'actions'];
  editingCategory: ProblemCategory | null = null;
  isLoading: boolean = false; // Para feedback visual durante la carga

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    // El formulario debe tener al menos 4 campos de al menos 3 tipos diferentes
    // Aquí tenemos: name (texto), description (textarea), icon (texto), color (texto/color)
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Tipo: Caja de texto
      description: ['', Validators.required],                     // Tipo: Textarea (se renderiza como textarea en el HTML)
      icon: [''],                                                 // Tipo: Caja de texto (para nombre de ícono o URL)
      color: ['#FFFFFF', [Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]] // Tipo: Input color (validación básica de hexadecimal)
      // Ejemplo de otro tipo, si fuera necesario un cuarto tipo diferente:
      // isCritical: [false] // Tipo: Checkbox (requeriría MatCheckboxModule)
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.problemCategoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading = false;
        this.showNotification('Error al cargar las categorías.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched(); // Muestra errores si los campos no son válidos
      this.showNotification('Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    this.isLoading = true;
    const categoryData = this.categoryForm.value;

    if (this.editingCategory && this.editingCategory.id) {
      // Actualizar Categoría
      const updatedCategory: ProblemCategory = { ...this.editingCategory, ...categoryData };
      this.problemCategoryService.updateCategory(updatedCategory).subscribe({
        next: (updated) => {
          if (updated) {
            this.loadCategories(); // Recarga la lista
            this.resetForm();
            this.showNotification('Categoría actualizada con éxito.', 'success');
          } else {
            this.showNotification('No se pudo actualizar la categoría.', 'error');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating category:', err);
          this.isLoading = false;
          this.showNotification('Error al actualizar la categoría.', 'error');
        }
      });
    } else {
      // Crear Nueva Categoría
      this.problemCategoryService.addCategory(categoryData).subscribe({
        next: () => {
          this.loadCategories(); // Recarga la lista
          this.resetForm();
          this.showNotification('Categoría agregada con éxito.', 'success');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error adding category:', err);
          this.isLoading = false;
          this.showNotification('Error al agregar la categoría.', 'error');
        }
      });
    }
  }

  editCategory(category: ProblemCategory): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    window.scrollTo(0, 0); // Opcional: lleva el scroll al inicio para ver el formulario
  }

  deleteCategory(id: number): void {
    // Ejemplo usando un diálogo de confirmación simple del navegador.
    // Para el proyecto, idealmente usarías un MatDialog con un componente reutilizable.
    const confirmation = confirm(`¿Estás seguro de que quieres eliminar la categoría con ID ${id}? Esta acción no se puede deshacer.`);

    if (confirmation) {
      this.isLoading = true;
      this.problemCategoryService.deleteCategory(id).subscribe({
        next: (success) => {
          if (success) {
            this.loadCategories(); // Recarga la lista
            this.resetForm(); // Limpia el formulario si la categoría eliminada estaba siendo editada
            this.showNotification('Categoría eliminada con éxito.', 'success');
          } else {
            this.showNotification('No se pudo eliminar la categoría (quizás no fue encontrada).', 'error');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          this.isLoading = false;
          this.showNotification('Error al eliminar la categoría.', 'error');
        }
      });
    }
  }
  /*
  // Ejemplo con MatDialog (requiere crear ConfirmationDialogComponent)
  deleteCategoryWithDialog(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message: `¿Estás seguro de que quieres eliminar la categoría con ID ${id}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Si el usuario confirma en el diálogo
        this.isLoading = true;
        this.problemCategoryService.deleteCategory(id).subscribe({
          // ... (lógica similar a la de arriba)
        });
      }
    });
  }
  */

  resetForm(): void {
    this.categoryForm.reset({
      name: '',
      description: '',
      icon: '',
      color: '#FFFFFF' // Restablece el color por defecto
    });
    this.editingCategory = null;
    // Si usas validadores que se activan con blur, puede ser útil resetear su estado:
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  // Helper para mostrar notificaciones (feedback al usuario)
  showNotification(message: string, panelClass: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000, // Duración en ms
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${panelClass}`] // Clases CSS para estilizar (snackbar-success, snackbar-error)
    });
  }

  // Helpers para acceder a los controles del formulario en la plantilla (opcional pero útil)
  get nameControl(): AbstractControl | null { return this.categoryForm.get('name'); }
  get descriptionControl(): AbstractControl | null { return this.categoryForm.get('description'); }
  get colorControl(): AbstractControl | null { return this.categoryForm.get('color'); }

  // Función para aplicar estilo de color en la tabla (si es necesario)
  getBackgroundColor(color: string | undefined): string {
    return color || 'transparent'; // Devuelve transparente si no hay color
  }
}