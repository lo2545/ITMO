import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointService, Point } from '../../services/point.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="graph-container">
      <svg
        viewBox="-220 -220 440 440"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        class="graph-svg"
        (click)="onPlotClick($event)"
      >
        <line x1="-220" y1="0" x2="220" y2="0" stroke="black" stroke-width="2"/>
        <line x1="0" y1="-220" x2="0" y2="220" stroke="black" stroke-width="2"/>

        <polygon points="220,0 210,-5 210,5" fill="black"/>
        <polygon points="0,-220 -5,-210 5,-210" fill="black"/>

        <ng-container *ngFor="let i of [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]">
             <line [attr.x1]="i * ppu" y1="-3" [attr.x2]="i * ppu" y2="3" stroke="black" stroke-width="1"/>
             <text [attr.x]="i * ppu" y="15" font-size="10" text-anchor="middle">{{i}}</text>

             <line x1="-3" [attr.y1]="-i * ppu" x2="3" [attr.y2]="-i * ppu" stroke="black" stroke-width="1"/>
             <text x="-10" [attr.y]="-i * ppu + 3" font-size="10" text-anchor="end">{{i}}</text>
        </ng-container>

        <text x="210" y="-10" font-weight="bold">X</text>
        <text x="10" y="-210" font-weight="bold">Y</text>

        <ng-container *ngIf="r !== null">
          <ng-container *ngIf="r > 0">
            <rect x="0" [attr.y]="-r * ppu"
                  [attr.width]="(r/2) * ppu" [attr.height]="r * ppu"
                  fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />

            <path [attr.d]="'M 0,0 L ' + (-r/2 * ppu) + ',0 A ' + (r/2 * ppu) + ',' + (r/2 * ppu) + ' 0 0,1 0,' + (-r/2 * ppu) + ' Z'"
                  fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />

            <polygon [attr.points]="'0,0 ' + (-r * ppu) + ',0 0,' + (r * ppu)"
                     fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />
          </ng-container>

          <ng-container *ngIf="r < 0">
            <rect [attr.x]="(r/2) * ppu"
                  [attr.y]="0"
                  [attr.width]="-(r/2) * ppu"
                  [attr.height]="(-r) * ppu"
                  fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />
            <path [attr.d]="'M 0,0 L ' + (-r/2 * ppu) + ',0 A ' + (-r/2 * ppu) + ',' + (-r/2 * ppu) + ' 0 0,1 0,' + (-r/2 * ppu) + ' Z'"
                  fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />

            <polygon [attr.points]="'0,0 ' + (-r * ppu) + ',0 0,' + (r * ppu)"
                     fill="#3b82f6" fill-opacity="0.5" stroke="#2563eb" />
          </ng-container>

          <circle *ngIf="r === 0"
                  cx="0" cy="0"
                  r="5"
                  fill="#3b82f6"
                  stroke="#2563eb"
                  stroke-width="2" />
        </ng-container>

        <rect [attr.x]="-3 * ppu"
              [attr.y]="-3 * ppu"
              [attr.width]="6 * ppu"
              [attr.height]="8 * ppu"
              fill="none"
              stroke="red"
              stroke-width="2"
              stroke-dasharray="5,5" />

        <circle
            *ngFor="let p of points"
            [attr.cx]="p.x * ppu"
            [attr.cy]="-p.y * ppu"
            r="5"
            [attr.fill]="p.result ? '#22c55e' : '#ef4444'"
            stroke="#333"
            stroke-width="1"
            class="point-dot"
        />
      </svg>

      <div *ngIf="r === null" class="overlay-msg">
        Введите R
      </div>
    </div>
  `,
  styles: [`
    .graph-container {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        background: white;
    }
    .graph-svg {
        width: 100%;
        height: 100%;
        display: block;
        cursor: crosshair;
    }
    .overlay-msg {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #ccc;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: bold;
        color: #555;
        pointer-events: none;
    }
    .point-dot { transition: r 0.2s; cursor: pointer; }
    .point-dot:hover { r: 7; stroke-width: 2; }
  `]
})
export class GraphComponent implements OnInit {
  @Input() r: number | null = null;
  @Output() mapClick = new EventEmitter<{x: number, y: number}>();

  points: Point[] = [];
  ppu = 40;

  constructor(private pointService: PointService) {}

  ngOnInit() {
    this.pointService.points$.subscribe(pts => this.points = pts);
  }

  onPlotClick(event: MouseEvent) {
    if (this.r === null) return;

    const svg = event.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    let x = parseFloat((svgP.x / this.ppu).toFixed(6));
    let y = parseFloat((-svgP.y / this.ppu).toFixed(6));

    if (x < -3) x = -3;
    if (x > 3) x = 3;

    if (y < -5) y = -5;
    if (y > 3) y = 3;

    this.mapClick.emit({ x, y });
  }
}
