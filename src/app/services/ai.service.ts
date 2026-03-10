import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private apiKey = "AIzaSyCkS4N9ZI-0L0waw8xNhqY9tvare2M_y4s";

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