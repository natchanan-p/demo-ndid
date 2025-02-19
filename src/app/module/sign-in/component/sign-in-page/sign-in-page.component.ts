import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {min} from 'rxjs';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.css',
})
export class SignInPageComponent implements OnInit {

  form: FormGroup;
  txtErrorUsername: string = '';
  readonly txtErrorPasswordMin8: string = 'กรุณาระบุรหัสผ่านอย่างน้อย 8 ตัว';
  readonly txtErrorPasswordNumber: string = 'กรุณาระบุตัวเลขอย่างน้อย 1 ตัว';
  readonly txtErrorPasswordSpecial: string = 'กรุณาระบุตัวสัญลักษณ์อย่างน้อย 1 ตัว';


  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)  // Correct regular expression
      ]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  // (?=.*\d)(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*+]).{8,}
  }

  ngOnInit() {
    console.log('SignInPageComponent ngOnInit');
  }

  validateUsername() {
    if(!this.form.controls['username'].valid) {
      this.txtErrorUsername = 'กรุณากรอก Email ให้ถูกต้อง'
    } else {
      this.txtErrorUsername = '';
    }
  }

  validatePassword() {
    // step1
  }
}
