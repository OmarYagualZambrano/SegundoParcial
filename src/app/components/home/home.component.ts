import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  ngOnInit() {
    document.body.classList.add('home-bg');
  }

  ngOnDestroy() {
    document.body.classList.remove('home-bg');
  }
}
