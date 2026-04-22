import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  issend: boolean = true;
  file: any;
  code: any

  constructor(private http: HttpClient) {

  }


  toggleCards() {
    this.issend = !this.issend
  }

  filedata = new FormGroup({
    sendFile: new FormControl('', Validators.required),
    timer: new FormControl('', Validators.required)
  })

  fileUplaod(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Convert file to Base64
      reader.onload = () => {
        this.file = reader.result; // Save file as base64 string
      };
    }
  }

  sendFile() {
    const sendData = {
      file: this.file,
      time: this.filedata.get('timer')?.value
    }
    this.filedata.markAllAsTouched()
    if (this.filedata.valid) {

      this.http.post("http://localhost:3000/fileupload", sendData).subscribe((res) => {
        this.code = res;
        this.filedata.reset();
      })
    }
  }

   downloadFile() {
    const inputElement = document.getElementById('getcode') as HTMLInputElement;
    const code = inputElement.value; 
    if (!code) {
      alert('Please enter a valid code!');
      return;
    }
    fetch('http://localhost:3000/receiveFile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    .then(response => {
      this.code = '';
      if (!response.ok) {
        throw new Error('File not found or expired!');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Downloaded_File';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      inputElement.value = "";

    })
    .catch(error => {
      console.error("Error:", error);
      alert(error.message);
    });
  }
  

}
