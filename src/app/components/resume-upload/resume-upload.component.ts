import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { GeminiService } from '../../services/gemini.service';
import { AnalysisResult } from '../../models/analysis-result.model';
import { AnalysisResultComponent } from '../analysis-result/analysis-result.component';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [
    FormsModule, CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule,
    MatSnackBarModule, MatStepperModule, MatDividerModule, MatChipsModule,
    AnalysisResultComponent
  ],
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.css'
})
export class ResumeUploadComponent {

  selectedFile: File | null = null;
  resumeText: string = '';
  jobDescription: string = '';
  analysisResult: AnalysisResult | null = null;
  isAnalyzing: boolean = false;
  errorMessage: string = '';
  isDragOver: boolean = false;

  private readonly ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  get fileIcon(): string {
    if (!this.selectedFile) return 'insert_drive_file';
    if (this.selectedFile.type === 'application/pdf') return 'picture_as_pdf';
    if (this.selectedFile.type === 'text/plain') return 'description';
    return 'article'; // doc/docx
  }

  constructor(
    private geminiService: GeminiService,
    private snackBar: MatSnackBar
  ) {}

  private isValidFile(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return this.ACCEPTED_TYPES.includes(file.type) ||
      ['pdf','doc','docx','txt'].includes(ext ?? '');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.isValidFile(file)) {
      this.selectedFile = file;
    } else if (file) {
      this.snackBar.open('Unsupported file. Use PDF, DOC, DOCX or TXT.', 'OK', { duration: 3000 });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidFile(file)) {
      this.selectedFile = file;
    } else {
      this.snackBar.open('Please drop a PDF file.', 'OK', { duration: 3000 });
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  async analyzeResume() {
    if (!this.selectedFile) {
      this.snackBar.open('Please upload a resume first.', 'OK', { duration: 3000 });
      return;
    }
    if (!this.jobDescription.trim()) {
      this.snackBar.open('Please enter a job description.', 'OK', { duration: 3000 });
      return;
    }

    const fileType = this.selectedFile.type;
    const fileExt = this.selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileType === 'application/pdf' || fileExt === 'pdf') {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        try {
          const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let extractedText = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            extractedText += content.items.map((item: any) => item.str).join(' ');
          }
          this.runAnalysis(extractedText);
        } catch {
          this.errorMessage = 'Failed to read PDF. Try a different file.';
        }
      };
      fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }

  private runAnalysis(text: string) {
    this.resumeText = text;
    this.isAnalyzing = true;
    this.errorMessage = '';
    this.analysisResult = null;

    this.geminiService.analyzeResume(this.resumeText, this.jobDescription).subscribe({
      next: (result) => {
        this.analysisResult = result;
        this.isAnalyzing = false;
        this.snackBar.open('Analysis complete!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.errorMessage = 'Failed to analyze resume. Please check your API key and try again.';
        this.isAnalyzing = false;
        console.error(err);
      }
    });
  }
}