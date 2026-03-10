import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResumeUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resume-genie-ai';
}
