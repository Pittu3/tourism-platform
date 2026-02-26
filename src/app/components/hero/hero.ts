import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class Hero {
  heroSlides = [
    {
      title: 'Temple Heritage Circuits',
      image: 'https://3.bp.blogspot.com/-eKlAydd6GDw/U9DtLeczIzI/AAAAAAAAFmo/6RMDHTcIH4Q/s1600/Tirupati+Balaji+Temple.jpg'
    },
    {
      title: 'Backwaters and Coastal Escapes',
      image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/cc/95/14/alleppey-backwater-tour.jpg?w=1200&h=900&s=1'
    },
    {
      title: 'Hill Stations and Forest Trails',
      image: 'https://res.cloudinary.com/voyehomes/image/upload/v1657619197/Blogs/ooty/rose_lcgkdk.jpg'
    },
    {
      title: 'Heritage Cities and Forts',
      image: 'https://karnatakatourism.org/wp-content/uploads/2020/05/Hampi.jpg'
    },
    {
      title: 'Coastal Temple Sunsets',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Jog_Falls_05092016.jpg/960px-Jog_Falls_05092016.jpg'
    }
  ];
}



