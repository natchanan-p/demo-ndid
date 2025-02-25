import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalService} from 'ng-zorro-antd/modal';
import Swal from 'sweetalert2'
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {AuthService} from '../../../../service/auth/auth.service';
import {DataService} from '../../../../service/data-service/data-service.service';
import {Router} from '@angular/router';
import { concatMap, delay, of, switchMap, tap} from 'rxjs';



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
  readonly txtErrorPasswordSpecialChr: string = 'กรุณาระบุตัวสัญลักษณ์อย่างน้อย 1 ตัว';

  // set true สำหรับกรณีเข้ามาแล้วยังไม่ได้กรอก
  statusHaveEng: boolean = true;
  statusHaveNumber: boolean = true;
  statusHaveSpecialChr: boolean = true;
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private authService: AuthService,
    private http: HttpClient,
    private dataService: DataService,
    private router: Router,
    private modal: NzModalService
  ) {
    this.form = this.fb.group({
      username: ['', {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
        ],
        updateOn: 'blur'
      }],
      password: ['', {
        validators: [
          Validators.required,
          Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*+]).{8,}$/)
        ],
        updateOn: 'blur'
      }]
    });
  }

  ngOnInit() {
  }

  validateUsername() {
    if(!this.form.controls['username'].valid) {
      this.txtErrorUsername = 'กรุณากรอก Email ให้ถูกต้อง'
    } else {
      this.txtErrorUsername = '';
    }
  }

  validatePassword() {
    const regExpNumber =  RegExp (/(?=.*\d).+$/);
    this.statusHaveNumber = regExpNumber.test(this.form.controls['password'].value);
    const regExpSpecialChr =  RegExp (/(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/|\\`~]).+/);
    this.statusHaveSpecialChr =  regExpSpecialChr.test(this.form.controls['password'].value);

  }

  submitForm() {
    this.loading = true;

    if(this.form.controls['password'].invalid) {
        let content = '';

        if(!this.statusHaveNumber) {
          content += this.txtErrorPasswordNumber;
        }
        if(!this.statusHaveSpecialChr) {
          content += '<br>'+this.txtErrorPasswordSpecialChr;
        }
        if(this.form.controls['password'].value.length < 8) {
          content += '<br>'+this.txtErrorPasswordMin8
        }

      this.modal.error({
        nzTitle: 'รหัสผ่านไม่ปลอดภัย',
        nzContent: content,
        nzOkText: 'ตกลง',
        nzCentered: true
      });
        this.loading = false;

    } else {
      const username = this.form.controls['username'].value;
      const password = this.form.controls['password'].value;
      const authProcess$ = of('กำลังเรียก API').pipe(
        tap((message) => {
          this.message = message;
        }),
        delay(3000),
        concatMap(() => {
          return this.authService.signIn(username, password).pipe(
            switchMap((response: any) => {
              console.log({response});
              if (response.errorCode === 200) {
                this.message = 'ได้รับ Token';
                this.dataService.set('token', response.token);
                this.dataService.set('currentUser', response.username);

              } else {
                this.loading = false;
                this.message = response.detail;

              }
              return of(response).pipe(delay(3000));

            })
          );
        }),
        concatMap((response: any) => {
          if (response.errorCode === 200) {
            this.message = 'กำลังเปลี่ยนไปหน้า info';
          }
          return of(response).pipe(delay(3000));
        })

      );

      authProcess$.subscribe({
        next: (result) => {
          this.message = '';
          this.loading = false;
        },
        complete: () => {
          this.navigateToInfo();
        },
      });
    }
  }

  navigateToInfo() {
    this.router.navigate(['/account-info']);
  }

  validateShowButton() {
    return this.form.controls['username'].invalid || this.form.controls['password'].invalid || !this.statusHaveNumber || !this.statusHaveSpecialChr;
  }

}
