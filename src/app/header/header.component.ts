import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  nombreUsuario: string = 'Lerith';
  fechaHoy: Date = new Date();
}
