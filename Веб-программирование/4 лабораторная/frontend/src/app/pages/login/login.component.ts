import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessagesModule],
  template: `
    <div class="login-page">
      <div class="header">
        <div class="student-info">
          <div class="student-name">Елизавета Львовна</div>
          <div class="student-group">Группа P3232 • Вариант 475247</div>
        </div>
      </div>

      <div class="login-container">
        <div class="auth-card">
          <h2>{{ isRegister ? 'Регистрация' : 'Вход' }}</h2>

          <p-messages [(value)]="msgs" [enableService]="false" [closable]="true"></p-messages>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <span class="p-float-label">
                <input
                  pInputText
                  id="username"
                  formControlName="username"
                  class="w-full" />
                <label for="username">Логин</label>
              </span>
              <small *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
                Минимум 3 символа
              </small>
            </div>

            <div class="field">
              <span class="p-float-label">
                <p-password
                  id="password"
                  formControlName="password"
                  [feedback]="false"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full">
                </p-password>
                <label for="password">Пароль</label>
              </span>
              <small *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
                Минимум 6 символов
              </small>
            </div>

            <p-button
              type="submit"
              [label]="isRegister ? 'Зарегистрироваться' : 'Войти'"
              [loading]="loading"
              styleClass="w-full submit-btn">
            </p-button>

            <div class="toggle-mode">
              <button
                type="button"
                class="p-button p-button-link"
                (click)="toggleMode()">
                {{ isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="footer">
        © 2026 Веб-программирование, 4 семестр
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  isRegister = false;
  loading = false;
  msgs: Message[] = [];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.msgs = [];
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.msgs = [];
    const val = this.form.value;

    const request = this.isRegister ? this.auth.register(val) : this.auth.login(val);

    request.subscribe({
      next: () => {
        console.log('Login successful, token:', localStorage.getItem('token'));
        this.router.navigate(['/main']);
      },
      error: (err) => {
        this.loading = false;
        let detail = 'Произошла ошибка сервера';

        if (err.status === 401) detail = 'Неверный логин или пароль';
        else if (err.status === 409) detail = 'Пользователь с таким логином уже существует';
        else if (err.status === 400) detail = 'Некорректные данные. Проверьте поля';
        else if (err.status === 403) detail = 'Доступ запрещен';
        else if (err.status === 0) detail = 'Нет соединения с сервером';

        this.msgs = [{ severity: 'error', summary: 'Ошибка', detail }];
      }
    });
  }
}

