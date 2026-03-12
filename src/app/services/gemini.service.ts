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
    const resume = resumeText.substring(0, 2500).trim();
    const job = jobDescription.substring(0, 1000).trim();

    const prompt = `You are an expert resume reviewer. Carefully read the resume and the job description below, then provide a structured analysis.

RESUME:
${resume}

JOB DESCRIPTION:
${job}

Return ONLY valid JSON with no markdown and no extra text:
{
  "summary": "<2 sentences: describe the candidate's background and how well they fit the role>",
  "strengths": [
    "<a specific skill, experience, or qualification from the resume that matches the job>",
    "<another strong match>",
    "<another strong match>"
  ],
  "improvements": [
    "<a specific requirement from the job description that is missing or weak in the resume>",
    "<another missing or weak area>",
    "<another missing or weak area>"
  ],
  "suggestions": [
    "<a concrete, actionable step the candidate can take to address the first improvement point>",
    "<actionable step for the second improvement point>",
    "<actionable step for the third improvement point>"
  ]
}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    return this.http.post<any>(this.API_URL, body).pipe(
      map(response => {
        let text: string = response.candidates[0].content.parts[0].text;
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        const aiResult = JSON.parse(jsonMatch[0]);
        return {
          summary: aiResult.summary,
          strengths: aiResult.strengths,
          improvements: aiResult.improvements,
          suggestions: aiResult.suggestions
        } as AnalysisResult;
      })
    );
  }
}


