import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AnalysisResult } from '../../models/analysis-result.model';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule, MatDividerModule
  ],
  templateUrl: './analysis-result.component.html',
  styleUrl: './analysis-result.component.css'
})
export class AnalysisResultComponent {
  @Input() result: AnalysisResult | null = null;

  get scoreClass(): string {
    if (!this.result) return '';
    if (this.result.matchScore >= 70) return 'high';
    if (this.result.matchScore >= 40) return 'medium';
    return 'low';
  }

  get scoreLabel(): string {
    if (!this.result) return '';
    if (this.result.matchScore >= 70) return 'Great Match';
    if (this.result.matchScore >= 40) return 'Moderate Match';
    return 'Needs Improvement';
  }
}
