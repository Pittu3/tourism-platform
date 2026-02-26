import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { Highlights } from '../../components/highlights/highlights';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, Hero, Highlights],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {}
