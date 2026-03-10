import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { AnalysisResult } from '../../models/analysis-result.model';
import { AnalysisResultComponent } from '../analysis-result/analysis-result.component';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [FormsModule, CommonModule, AnalysisResultComponent],
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

  constructor(private geminiService: GeminiService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async analyzeResume() {

    if (!this.selectedFile) {
      alert('Please upload a resume first.');
      return;
    }

    if (!this.jobDescription.trim()) {
      alert('Please enter a job description.');
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = async () => {

      const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      let extractedText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        extractedText += strings.join(' ');
      }

      this.resumeText = extractedText;
      this.isAnalyzing = true;
      this.errorMessage = '';
      this.analysisResult = null;

      this.geminiService.analyzeResume(this.resumeText, this.jobDescription).subscribe({
        next: (result) => {
          this.analysisResult = result;
          this.isAnalyzing = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to analyze resume. Please check your API key and try again.';
          this.isAnalyzing = false;
          console.error(err);
        }
      });

    };

    fileReader.readAsArrayBuffer(this.selectedFile);
  }

}