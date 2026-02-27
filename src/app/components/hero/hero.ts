import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class Hero implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') heroCanvas?: ElementRef<HTMLCanvasElement>;

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

  private animationId: number | null = null;
  private particles: Particle[] = [];
  private readonly particleCount = 42;
  private readonly onResize = () => this.resizeCanvas();

  ngAfterViewInit(): void {
    this.resizeCanvas();
    this.bootstrapParticles();
    this.startAnimation();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    window.removeEventListener('resize', this.onResize);
  }

  private resizeCanvas(): void {
    const canvas = this.heroCanvas?.nativeElement;
    if (!canvas) {
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = Math.max(window.innerHeight, 680);
  }

  private bootstrapParticles(): void {
    if (this.particles.length > 0) {
      return;
    }
    const canvas = this.heroCanvas?.nativeElement;
    if (!canvas) {
      return;
    }
    for (let i = 0; i < this.particleCount; i += 1) {
      this.particles.push(this.newParticle(canvas.width, canvas.height));
    }
  }

  private newParticle(width: number, height: number): Particle {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: 1 + Math.random() * 2.6,
      alpha: 0.12 + Math.random() * 0.26
    };
  }

  private startAnimation(): void {
    if (this.animationId !== null) {
      return;
    }
    const draw = () => {
      const canvas = this.heroCanvas?.nativeElement;
      if (!canvas) {
        this.animationId = null;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.animationId = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -6 || p.x > canvas.width + 6 || p.y < -6 || p.y > canvas.height + 6) {
          Object.assign(p, this.newParticle(canvas.width, canvas.height));
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(193, 233, 255, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      this.animationId = requestAnimationFrame(draw);
    };
    this.animationId = requestAnimationFrame(draw);
  }

  private stopAnimation(): void {
    if (this.animationId === null) {
      return;
    }
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
}



