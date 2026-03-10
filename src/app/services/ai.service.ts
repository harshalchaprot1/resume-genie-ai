import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private apiKey = environment.geminiApiKey;

  constructor(private http: HttpClient) {}

  analyzeResume(resumeText: string, jobDescription: string) {

    const prompt = `
You are an ATS resume analyzer.

Compare the resume with the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return:
1. Match Score %
2. Matching Skills
3. Missing Skills
4. Suggestions to improve the resume.
`;

    return this.http.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );
  }
}