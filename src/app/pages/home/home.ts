import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { Highlights } from '../../components/highlights/highlights';
import { Testimonals } from '../../components/testimonals/testimonals';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, Hero, Highlights, Testimonals],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {}
