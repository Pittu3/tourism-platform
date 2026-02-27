import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  rememberMe = true;
  submitted = false;
  successMessage = '';

  onSubmit(form: NgForm): void {
    this.submitted = true;
    this.successMessage = '';

    if (form.invalid) {
      return;
    }

    this.successMessage = `Logged in as ${this.email}.`;
    form.resetForm({ rememberMe: this.rememberMe });
    this.submitted = false;
  }
}
