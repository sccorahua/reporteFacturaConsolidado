import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-pagina-inicio',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './pagina-inicio.component.html',
  styleUrl: './pagina-inicio.component.css'
})
export class PaginaInicioComponent {

}
