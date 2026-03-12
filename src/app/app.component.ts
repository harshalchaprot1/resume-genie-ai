import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
    ResumeUploadComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resume-genie-ai';

  isEditing = false;
  draftKey = '';
  savedKey = '';

  constructor(private geminiService: GeminiService) {}

  get maskedKey(): string {
    if (!this.savedKey) return '';
    return this.savedKey.length <= 8
      ? '•'.repeat(this.savedKey.length)
      : this.savedKey.slice(0, 4) + '•'.repeat(this.savedKey.length - 8) + this.savedKey.slice(-4);
  }

  startEdit() {
    this.draftKey = this.savedKey;
    this.isEditing = true;
  }

  saveKey() {
    this.savedKey = this.draftKey.trim();
    this.geminiService.setApiKey(this.savedKey);
    this.isEditing = false;
  }

  cancelEdit() {
    this.draftKey = '';
    this.isEditing = false;
  }
}
