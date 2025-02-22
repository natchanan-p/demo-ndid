import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalService} from 'ng-zorro-antd/modal';
import Swal from 'sweetalert2'
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../../service/auth/auth.service';
import {DataService} from '../../../../service/data-service/data-service.service';
import {Router} from '@angular/router';


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
  ) {
    this.form = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)  // Correct regular expression
      ]],
      password: ['',
        [Validators.required,
         Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*+]).{8,}$/)]
      ]
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

  submitForm() {
    this.loading = true;

    // this.form.controls['password'].addValidators([Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&*+]).{8,}$/g)])

    const regExpNumber =  RegExp (/(?=.*\d).+$/);
    this.statusHaveNumber = regExpNumber.test(this.form.controls['password'].value);
    const regExpSpecialChr =  RegExp (/(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/|\\`~]).+/);
    this.statusHaveSpecialChr =  regExpSpecialChr.test(this.form.controls['password'].value);

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

        // if(this.statusHaveNumber || this.statusHaveSpecialChr || this.form.controls['password'].value.length) {
        //   content += '<br>'+this.txtErrorPasswordMin8
        // }
        Swal.fire({
          title: "รหัสผ่านไม่ปลอดภัย",
          html: content,
          icon: "error",
          confirmButtonText: 'ปิด'
        });
    } else {
      const username = this.form.controls['username'].value;
      const password = this.form.controls['password'].value;

      this.authService.signIn(username, password).subscribe({
        next: (result) => {
          console.log('ได้รับ result:', result); // ตรวจสอบ result
          this.dataService.set('token', result.token);
          this.dataService.set('currentUser', result.username)
          this.message = result; // อัปเดต message
          this.loading = false;
        },
        error: (error) => {
          this.message = 'เกิดข้อผิดพลาดในการเรียก API';
          this.loading = false;
        },
        complete: () => {
          console.log('กระบวนการเสร็จสิ้น'); // ตรวจสอบ complete
          this.message = 'กำลังเปลี่ยนไปหน้า info';
          this.navigateToInfo();
        },
      });
      // console.log('กำลังเรียกไปที่ api')
      // this.authService.signIn(username, password).subscribe({
      //   next: (result) => {
      //     console.log('next')
      //     this.message = result;
      //     this.loading = false;
      //   },
      //   error: (error) => {
      //     this.message = 'เกิดข้อผิดพลาดในการเรียก API';
      //     this.loading = false;
      //   },
      //   complete: () => {
      //     this.message = 'กำลังเปลี่ยนไปหน้า info';
      //     // ทำการเปลี่ยนหน้าไปที่ info หลังจากเสร็จสิ้น
      //     // this.navigateToInfo();
      //   },
      // })
      // this.encryptPassword().then((result) => {
      //   console.log(result);
      // })
    }
  }

  navigateToInfo() {
    this.router.navigate(['/account-info']);
  }

  validateShowButton() {
    return this.form.controls['username'].invalid || this.form.controls['password'].invalid || !this.statusHaveNumber || !this.statusHaveSpecialChr;
  }

  async encryptPassword() {
    const plaintext = new TextEncoder().encode("Hello, world!");
    // คีย์ลับ 256-bit
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    console.log({key})

    // IV ที่ใช้ในการเข้ารหัส
    const iv = crypto.getRandomValues(new Uint8Array(12));  // 12 bytes for GCM

    // การเข้ารหัส
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      plaintext
    );
    console.log({encrypted})
    return encrypted;
  }

}
