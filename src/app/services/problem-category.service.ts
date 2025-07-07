import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs'; // Importa BehaviorSubject
import { catchError, tap } from 'rxjs/operators';     // Importa tap para efectos secundarios
import { ProblemCategory } from '../models/problem-category.model';

@Injectable({
    providedIn: 'root'
})
export class ProblemCategoryService {
    private categoriesUrl = 'http://localhost:3000/categorias';

    // 1. Declara un BehaviorSubject privado. Inicialízalo con un array vacío.
    private categoriesSubject = new BehaviorSubject<ProblemCategory[]>([]);

    // 2. Expón un Observable público a partir del BehaviorSubject. Los componentes se suscribirán a este.
    public categories$: Observable<ProblemCategory[]> = this.categoriesSubject.asObservable();

    private nextId = 1;

    constructor(private http: HttpClient) {
        console.log('ProblemCategoryService: Constructor - Llamando a loadInitialCategories.');
        this.loadInitialCategories();
    }

    private loadInitialCategories(): void {
        console.log('ProblemCategoryService: loadInitialCategories - Iniciando petición HTTP.');
        this.http.get<ProblemCategory[]>(this.categoriesUrl).pipe(
            tap(data => { // 'tap' es para efectos secundarios sin modificar el stream
                console.log('ProblemCategoryService: Datos recibidos de HTTP en loadInitialCategories:', data);
                if (data && data.length > 0) {
                    // Calcula nextId basado en los datos cargados
                    this.nextId = Math.max(...data.map(c => Number(c.id))) + 1;
                    console.log('ProblemCategoryService: nextId calculado:', this.nextId);
                } else {
                    console.warn('ProblemCategoryService: No hay datos en el JSON o está vacío.');
                }
            }),
            catchError(err => {
                console.error('ProblemCategoryService: ¡ERROR AL CARGAR JSON INICIALMENTE!', err);
                return of([] as ProblemCategory[]); // Devuelve array vacío en caso de error
            })
        ).subscribe(dataFromHttp => {
            // 3. Cuando los datos lleguen (o haya un error y llegue un array vacío),
            //    emite este nuevo valor a través del BehaviorSubject.
            this.categoriesSubject.next(dataFromHttp);
            console.log('ProblemCategoryService: Nuevos datos emitidos a través de categoriesSubject.');
        });
    }

    // 4. El componente llamará a este método. Simplemente devuelve el observable categories$.
    getCategories(): Observable<ProblemCategory[]> {
        console.log('ProblemCategoryService: getCategories() llamado. Devolviendo categories$ observable.');
        // El componente se suscribe a categories$. Recibirá el valor inicial ([])
        // y luego recibirá los datos cargados cuando categoriesSubject.next() se llame.
        return this.categories$;
    }

    getCategoryById(id: number): Observable<ProblemCategory | undefined> {
        // Obtiene el valor actual del BehaviorSubject para buscar.
        const category = this.categoriesSubject.getValue().find(c => c.id === id);
        console.log('ProblemCategoryService: getCategoryById() para ID:', id, 'Encontrado:', category);
        return of(category);
    }

    addCategory(category: Omit<ProblemCategory, 'id'>): Observable<ProblemCategory> {
        const currentCategories = this.categoriesSubject.getValue(); // Obtiene el array actual
        const newCategory: ProblemCategory = { ...category, id: this.nextId++ };
        const updatedCategories = [...currentCategories, newCategory];
        this.categoriesSubject.next(updatedCategories); // Emite el array actualizado
        console.log('ProblemCategoryService: Categoría agregada. Nuevo array emitido.');
        return of(newCategory);
    }

    updateCategory(updatedCategoryData: ProblemCategory): Observable<ProblemCategory | null> {
        let currentCategories = this.categoriesSubject.getValue();
        const index = currentCategories.findIndex(c => c.id === updatedCategoryData.id);

        if (index !== -1) {
            // Para asegurar la inmutabilidad y la detección de cambios, crea un nuevo array
            const updatedCategories = currentCategories.map(cat =>
                cat.id === updatedCategoryData.id ? updatedCategoryData : cat
            );
            this.categoriesSubject.next(updatedCategories); // Emite el array actualizado
            console.log('ProblemCategoryService: Categoría actualizada. Nuevo array emitido.');
            return of(updatedCategoryData);
        }
        console.warn('ProblemCategoryService: updateCategory - Categoría no encontrada para ID:', updatedCategoryData.id);
        return of(null);
    }

    deleteCategory(id: number): Observable<boolean> {
        let currentCategories = this.categoriesSubject.getValue();
        const updatedCategories = currentCategories.filter(c => c.id !== id);
        const success = updatedCategories.length < currentCategories.length;

        if (success) {
            this.categoriesSubject.next(updatedCategories); // Emite el array actualizado
            console.log('ProblemCategoryService: Categoría eliminada para ID:', id, '. Nuevo array emitido.');
        } else {
            console.warn('ProblemCategoryService: deleteCategory - Categoría no encontrada para ID:', id);
        }
        return of(success);
    }
}