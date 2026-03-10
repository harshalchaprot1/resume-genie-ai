import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatIconModule, ResumeUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resume-genie-ai';
}
