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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient) {}

  analyzeResume(resumeText: string, jobDescription: string): Observable<AnalysisResult> {
    const prompt = `You are an expert resume reviewer. Analyze the following resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond ONLY with a valid JSON object in this exact format (no markdown code blocks, no extra text):
{
  "matchScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    return this.http.post<any>(this.API_URL, body).pipe(
      map(response => {
        const text = response.candidates[0].content.parts[0].text;
        return JSON.parse(text) as AnalysisResult;
      })
    );
  }
}
