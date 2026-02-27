import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,

  imports: [FormsModule],

  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking {

  name = '';
  email = '';
  date = '';

  submit() {
    alert('Booking Successful');
  }

}
