import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AnalysisResult } from '../models/analysis-result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private readonly API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient) {}

  analyzeResume(resumeText: string, jobDescription: string): Observable<AnalysisResult> {
    const prompt = `Analyze resume vs job description. Return JSON only:

Resume: ${resumeText.substring(0, 2000)}

Job: ${jobDescription.substring(0, 800)}

Format:
{
  "matchScore": <0-100>,
  "summary": "<brief 1-2 line assessment>",
  "strengths": ["<strength>","<strength>"],
  "gaps": ["<gap>","<gap>"],
  "suggestions": ["<brief tip>","<brief tip>"]
}

Keep all responses concise.`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    return this.http.post<any>(this.API_URL, body).pipe(
      map(response => {
        let text = response.candidates[0].content.parts[0].text;
        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(text) as AnalysisResult;
      })
    );
  }
}
