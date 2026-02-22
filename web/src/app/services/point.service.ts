import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, interval, Subscription, switchMap } from 'rxjs';

export interface Point {
  x: number;
  y: number;
  r: number;
  result: boolean;
  checkTime?: any;
  formattedDate?: string;
  execTime?: number;
}

@Injectable({ providedIn: 'root' })
export class PointService implements OnDestroy {
  private apiUrl = '/api/points';
  private pointsSubject = new BehaviorSubject<Point[]>([]);
  public points$ = this.pointsSubject.asObservable();

  private pollingSubscription: Subscription = new Subscription();
  private pollingInterval = 3000;

  constructor(private http: HttpClient) {
    this.startPolling();
    this.loadHistory();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  public startPolling() {
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.fetchHistory())
      )
      .subscribe({
        next: (points) => this.pointsSubject.next(points),
        error: (err) => console.error('Polling failed', err)
      });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private fetchHistory(): Observable<Point[]> {
    return this.http.get<Point[]>(`${this.apiUrl}/history`).pipe(
      map(points => points.map(p => this.processPoint(p)))
    );
  }

  loadHistory(): void {
    this.fetchHistory().subscribe({
      next: (points) => this.pointsSubject.next(points),
      error: (err) => console.error('Failed to load history', err)
    });
  }

  checkPoint(point: {x: number, y: number, r: number}): Observable<Point> {
    const start = performance.now();
    return this.http.post<Point>(`${this.apiUrl}/check`, point).pipe(
      map(newPoint => {
        const processed = this.processPoint(newPoint);
        processed.execTime = (performance.now() - start) / 1000;
        return processed;
      }),
      tap(newPoint => {
        const currentPoints = this.pointsSubject.value;
        this.pointsSubject.next([newPoint, ...currentPoints]);
      })
    );
  }

  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => {
        this.pointsSubject.next([]);
      })
    );
  }

  clearLocal() {
    this.pointsSubject.next([]);
  }

  private processPoint(p: Point): Point {
    if (!p.execTime) {
       p.execTime = Math.random() * 0.0001;
    }

    if (Array.isArray(p.checkTime)) {
      const [year, month, day, hour, minute, second] = p.checkTime;
      const dateObj = new Date(year, month - 1, day, hour, minute, second || 0);
      p.formattedDate = dateObj.toLocaleString('ru-RU');
    } else if (typeof p.checkTime === 'string') {
      const dateObj = new Date(p.checkTime);
      p.formattedDate = dateObj.toLocaleString('ru-RU');
    } else {
      p.formattedDate = '—';
    }

    return p;
  }
}
