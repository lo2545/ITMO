import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PointService } from '../../services/point.service';
import { GraphComponent } from '../../components/graph/graph.component';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, GraphComponent,
    ButtonModule, InputNumberModule, TableModule, MessageModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="main-header">
      <div class="header-content">
        <div class="header-left">
          <span class="title">Елизавета • Вариант 475247</span>
          <span class="separator">|</span>
          <span class="username">Пользователь: {{ (auth.user$ | async)?.username }}</span>
        </div>
        <div class="header-right">
          <p-button
            label="Выйти"
            icon="pi pi-sign-out"
            styleClass="p-button-danger logout-btn"
            (onClick)="logout()">
          </p-button>
        </div>
      </div>
    </div>

    <div class="main-container">
      <div class="content-grid">
        <div class="graph-cell">
          <div class="graph-wrapper">
            <app-graph [r]="form.get('r')?.value" (mapClick)="onMapClick($event)"></app-graph>
          </div>
        </div>

        <div class="params-cell">
          <div class="params-card">
            <h2>Параметры</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="field">
                <label>Координата X (-3 ... 3)</label>
                <p-inputNumber formControlName="x" [min]="-3" [max]="3"
                               [maxFractionDigits]="6" styleClass="w-full"
                               placeholder="0.000000" [showButtons]="false"
                               (onInput)="saveFormState()"></p-inputNumber>
                <small *ngIf="form.get('x')?.invalid && form.get('x')?.touched">
                  Введите число от -3 до 3
                </small>
              </div>

              <div class="field">
                <label>Координата Y (-5 ... 3)</label>
                <p-inputNumber formControlName="y" [min]="-5" [max]="3"
                               [maxFractionDigits]="6" styleClass="w-full"
                               placeholder="0.000000" [showButtons]="false"
                               (onInput)="saveFormState()"></p-inputNumber>
                <small *ngIf="form.get('y')?.invalid && form.get('y')?.touched">
                  Введите число от -5 до 3
                </small>
              </div>

              <div class="field">
                <label>Радиус R (-3 ... 3)</label>
                <p-inputNumber formControlName="r" [min]="-3" [max]="3"
                               [maxFractionDigits]="3" styleClass="w-full"
                               placeholder="1" [showButtons]="true"
                               buttonLayout="horizontal"
                               incrementButtonIcon="pi pi-plus"
                               decrementButtonIcon="pi pi-minus"
                               (onInput)="saveFormState()"></p-inputNumber>
                <small *ngIf="form.hasError('invalidR') && form.get('r')?.touched">
                  Радиус должен быть положительным
                </small>
              </div>

              <div class="button-group">
                <p-button type="submit" label="Проверить" icon="pi pi-check"
                          [loading]="loading" [disabled]="form.invalid"
                          styleClass="w-full check-btn"></p-button>
                <p-button type="button" label="Очистить таблицу" icon="pi pi-trash"
                          styleClass="p-button-secondary w-full clear-btn"
                          (onClick)="clearTable()"></p-button>
              </div>
            </form>
          </div>
        </div>

        <div class="table-cell">
          <div class="table-card">
            <h2>История проверок</h2>
            <p-table [value]="(pointService.points$ | async)!"
                     [paginator]="true" [rows]="10"
                     styleClass="p-datatable-striped"
                     [scrollable]="true" scrollHeight="flex"
                     [showCurrentPageReport]="true"
                     currentPageReportTemplate="{first} - {last} из {totalRecords}">
              <ng-template pTemplate="header">
                <tr>
                  <th>X</th><th>Y</th><th>R</th><th>Результат</th><th>Время (мкс)</th><th>Дата</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-p>
                <tr>
                  <td>{{ p.x | number:'1.6-6' }}</td>
                  <td>{{ p.y | number:'1.6-6' }}</td>
                  <td>{{ p.r }}</td>
                  <td>
                    <span [class]="'result-badge ' + (p.result ? 'hit' : 'miss')">
                      {{ p.result ? 'Попал' : 'Промах' }}
                    </span>
                  </td>
                  <td class="font-mono">{{ p.execTime | number:'1.6-6' }}</td>
                  <td>{{ p.formattedDate || (p.checkTime | date:'dd.MM.yyyy HH:mm:ss') }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="6" class="empty-message">Нет данных о проверках</td></tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MainComponent implements OnInit {
  form: FormGroup;
  loading = false;
  private readonly STORAGE_KEY = 'app_form_state';

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public pointService: PointService,
    private messageService: MessageService,

  ) {
    this.form = this.fb.group({
      x: [0, [Validators.required, Validators.min(-3), Validators.max(3)]],
      y: [0, [Validators.required, Validators.min(-5), Validators.max(3)]],
      r: [1, [Validators.required, Validators.min(-3), Validators.max(3)]]
    }, { validators: this.positiveRadiusValidator });
  }

  ngOnInit() {
    console.log('MainComponent loaded, isAuthenticated:', this.auth.isAuthenticated);
    console.log('Token:', localStorage.getItem('token'));
    this.loadFormState();
    this.pointService.loadHistory();
    this.pointService.startPolling();
  }

  positiveRadiusValidator(g: FormGroup) {
    const r = g.get('r')?.value;
    return (r !== null && r <= 0) ? { invalidR: true } : null;
  }

  saveFormState() {
    if (this.form.valid) {
      const state = {
        x: this.form.get('x')?.value,
        y: this.form.get('y')?.value,
        r: this.form.get('r')?.value
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }
  }

  loadFormState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.form.patchValue({
          x: state.x ?? 0,
          y: state.y ?? 0,
          r: state.r ?? 1
        });
      } catch (e) {
        console.error('Failed to load form state', e);
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saveFormState();
    this.sendPoint(this.form.value);
  }

  onMapClick(coords: {x: number, y: number}) {
    const r = this.form.get('r')?.value;
    if (r !== null) {
      this.form.patchValue({ x: coords.x, y: coords.y });
      this.saveFormState();
      this.sendPoint({ x: coords.x, y: coords.y, r });
    }
  }

  sendPoint(point: any) {
    this.loading = true;
    this.pointService.checkPoint(point).subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  clearTable() {
    this.pointService.clearHistory().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Успешно', detail: 'Таблица очищена'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Ошибка', detail: 'Не удалось очистить историю'
        });
      }
    });
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.pointService.clearLocal();
    this.auth.logout();
  }
}

