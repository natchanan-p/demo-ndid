import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, concatMap, delay, from, interval, Observable, of, switchMap, takeUntil, tap} from 'rxjs';
import * as CryptoJS from 'crypto-js';
// crypto-js.d.ts
declare module 'crypto-js' {
  namespace mode {
    const GCM: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  ALGORITHM = "AES-GCM";
  HASH = "SHA-256";
  KEY_SIZE = 256;
  ITERATION_COUNT = 100000;
  secretKey = 'top_secret';
  textEncoder = new TextEncoder()
  message: string = '';
  constructor(
    private http: HttpClient,
  ) { }

  signIn(username: string, password: string): Observable<any> {
    return from(this.encryptAesGcm(username,password)).pipe(
      switchMap(({ cipherU, cipherP, tagP, tagU}) => {
        const body = {
          cipherU, tagP: tagP, cipherP, tagU: tagU
        };
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // ส่ง request ไปยัง API
        return this.http.post<any>('/api/sign-in', body, { headers: headers }).pipe(
          catchError((error) => {
            this.message = 'เกิดข้อผิดพลาดในการเรียก API';
            return of(error);
          })
        );
      })
    )
  }

  signIna(username: string, passwordInput: string): Observable<any> {
    console.log({username})
    return from(this.encryptAesGcm(username,passwordInput)).pipe(
      tap(() => this.message = 'กำลังเรียกไปที่ API'),
      switchMap(({ cipherU, cipherP, tagP, tagU}) => {
        // สร้าง body สำหรับส่งไปยัง API
        console.log(this.message)
        const body = {
          cipherU, tagP: tagP, cipherP, tagU: tagU
        };

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // ส่ง request ไปยัง API
        return this.http.post<any>('/api/sign-in', body, { headers: headers }).pipe(
          catchError((error) => {
            this.message = 'เกิดข้อผิดพลาดในการเรียก API';
            return of(error);
          })
        );
      }),
      concatMap((response) => {
        // แสดงข้อความ "ได้รับ Token" และ delay 3 วินาที
        this.message = `ได้รับ Token: ${response.token}`; // อัปเดต message เมื่อได้รับ Token

        return of({ ...response, message: this.message }).pipe(delay(3000));
      }),
      concatMap((response) => {
        // แสดงข้อความ "กำลังเปลี่ยนไปหน้า info" และ delay 3 วินาที
        this.message = 'กำลังเปลี่ยนไปหน้า info'; // อัปเดต message เมื่อเปลี่ยนหน้า
        // return of(response).pipe(delay(3000));
        return of({ ...response, message: this.message }).pipe(delay(3000));
      })
    );
  }



  // signIn(username: string, passwordInput: string): Observable<any> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   // const key = crypto.getRandomValues(new Uint8Array(32)); // คีย์ 256 บิต
  //   const nonce = crypto.getRandomValues(new Uint8Array(12)); // nonce 12 ไบต์
  //
  //   const keyString = "top_secret";
  //   const encoder = new TextEncoder();
  //   const key = encoder.encode(keyString);
  //
  //   // เข้ารหัส password
  //   return from(this.encryptAesGcm(passwordInput)).pipe(
  //
  //     switchMap(({ ciphertext, tag }) => {
  //       // สร้าง body สำหรับส่งไปยัง API
  //       const body = {
  //         username,
  //         ciphertext: ciphertext,
  //         tag
  //       };
  //
  //       const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //       // ส่ง request ไปยัง API
  //       return this.http.post<any>('/api/sign-in', body,  { headers: headers }).pipe(
  //         catchError((error) => {
  //           console.error('เกิดข้อผิดพลาดในการเรียก API:', error);
  //           return of(error);
  //         })
  //       );
  //     }),
  //     concatMap((response) => {
  //       // จำลองการรอ 3 วินาที
  //       return of(`ได้รับ Token: ${response.token}`).pipe(delay(3000));
  //     }),
  //     concatMap(() => {
  //       // จำลองการเปลี่ยนหน้า
  //       return of("กำลังเปลี่ยนไปหน้า info").pipe(delay(3000));
  //     })
  //   );
  //
  // // signIn(username: string, passwordInput: string): Observable<any> {
  // //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  // //   const key = crypto.getRandomValues(new Uint8Array(32)); // คีย์ 256 บิต
  // //   const nonce = crypto.getRandomValues(new Uint8Array(12)); // nonce 12 ไบต์
  // //
  // //   // console.log( this.encrypt(passwordInput))
  // //   const password = this.encryptAesGcm(passwordInput,key,nonce);
  // //   from(this.encryptAesGcm(passwordInput, key, nonce)).pipe(
  // //     switchMap(({ ciphertext, tag }) => {
  // //
  // //     })
  // //   ))
  // //
  // //   const body = {
  // //     username,
  // //     password: password,
  // //     tag,
  // //     nonce: btoa(String.fromCharCode(...nonce)) // แปลง nonce เป็น Base64
  // //   };    // const request =  this.http.post<any>('http://localhost:8080/sign-in', JSON.stringify(body), {headers, observe: 'response'}).pipe(
  // //   //   catchError((error) => {
  // //   //     return of(error)
  // //   //   })
  // //   // )
  // //   return of("กำลังเรียกไปที่ API").pipe(
  // //     delay(3000), // ⏳ รอ 3 วินาที
  // //     concatMap(() => {
  // //       // เรียก API และรอ 3 วิ
  // //       return this.http.post<{ token: string }>('http://localhost:8080/sign-in', body).pipe(
  // //         concatMap(response => of(`ได้รับ Token: ${response.token}`).pipe(delay(3000)))
  // //       );
  // //     }),
  // //     concatMap(() => of("กำลังเปลี่ยนไปหน้า info").pipe(delay(3000)))
  // //   );
  // }

  padKey(key: Uint8Array, requiredLength: number): Uint8Array {
    if (key.length >= requiredLength) {
      return key.slice(0, requiredLength); // ตัดให้เหลือความยาวที่ต้องการ
    }

    const paddedKey = new Uint8Array(requiredLength);
    paddedKey.set(key); // คัดลอกคีย์เดิม
    // เติมข้อมูลที่เหลือด้วยค่าเริ่มต้น (เช่น 0)
    for (let i = key.length; i < requiredLength; i++) {
      paddedKey[i] = 0; // หรือใช้ค่าใด ๆ ตามต้องการ
    }
    return paddedKey;
  }

  async encryptAesGcm(username: string,password: string): Promise< {cipherU: string, cipherP: string, tagP: string, tagU: string } > {
    const encoder = new TextEncoder();
    const keyData = encoder.encode('secret');
    const paddedKey = this.padKey(keyData, 32); // Padding ให้ KEY มีความยาว 32 ไบต์

// สร้าง NONCE
    const iv = encoder.encode('sign');
    const nonce = this.padKey(iv, 12); // Padding ให้ NONCE มีความยาว 12 ไบต์

    console.log({ paddedKey, nonce });

    // นำเข้าคีย์และระบุรูปแบบเป็น raw
    const cryptoKey = await crypto.subtle.importKey(
      'raw', // รูปแบบคีย์ (raw, jwk, pkcs8, spki)
      paddedKey, // ข้อมูลคีย์ที่เติมแล้ว
      { name: 'AES-GCM' }, // อัลกอริธึม
      true, // อนุญาตให้ export คีย์
      ['encrypt', 'decrypt'] // การใช้งานคีย์
    );

    // เข้ารหัสข้อมูล
    const encryptedPassword = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey, // ใช้ cryptoKey โดยตรง
      new TextEncoder().encode(password)
    );

    const encryptedUsername = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey, // ใช้ cryptoKey โดยตรง
      new TextEncoder().encode(username)
    );


    const tagP = encryptedPassword.slice(-16); // แท็ก 16 ไบต์
    const cipherPText = encryptedPassword.slice(0, -16); // ciphertext

    const tagU = encryptedUsername.slice(-16); // แท็ก 16 ไบต์
    const cipherUText = encryptedUsername.slice(0, -16); // ciphertext


    const tagPBase64 = btoa(String.fromCharCode(...new Uint8Array(tagP)));
    const cipherPBase64 = btoa(String.fromCharCode(...new Uint8Array(cipherPText)));

    const tagUBase64 = btoa(String.fromCharCode(...new Uint8Array(tagU)));
    const cipherUBase64 = btoa(String.fromCharCode(...new Uint8Array(cipherUText)));
    return { cipherU: cipherUBase64, cipherP: cipherPBase64, tagP: tagPBase64, tagU: tagUBase64 };
  }

  // encrypt(plaintext: string) {
  //   const nonce = CryptoJS.enc.Hex.parse('test');
  //
  //   // const encrypted =  CryptoJS.AES.encrypt(plaintext, 'top_secret', {
  //   //   iv: nonce,
  //   //   mode: CryptoJS.mode.GCM,
  //   // });
  //
  //   const encrypted =  CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('top_secret'), 'phrase');
  //
  //   // @ts-ignore
  //   const  encryptedTag = encrypted.tag.toString();
  //   console.log('Ciphertext:', encrypted.ciphertext.toString());
  //   console.log('Tag:', encryptedTag);
  // }


// getKey(salt: Buffer) {
  //   return crypto.pbkdf2Sync(this.secretKey, salt, this.ITERATION, this.KEY_LENGTH, 'sha512');
  // }
  //
  // encrypt(plainText: string) {
  //   const salt = crypto.randomBytes(this.SALT_LENGTH);
  //   const iv = crypto.randomBytes(this.IV_LENGTH);
  //
  //   const key = this.getKey(salt);
  //
  //   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  //   const encrypted = Buffer.concat([
  //     cipher.update(String(plainText), 'utf8'),
  //     cipher.final(),
  //   ]);
  //
  //   const tag = cipher.getAuthTag();
  //   return Buffer.concat([salt, iv, encrypted, tag]).toString('base64');
  // }




  // async encryptPassword(password: string) {
  //
  //
  //   const plaintext = new TextEncoder().encode('P@ssw0rd');
  //   // คีย์ลับ 256-bit
  //   const key = await crypto.subtle.generateKey(
  //     { name: "AES-GCM", length: 256 },
  //     false,
  //     ["encrypt"]
  //   );
  //
  //   console.log({key})
  //
  //   // IV ที่ใช้ในการเข้ารหัส
  //   const iv = crypto.getRandomValues(new Uint8Array(12));  // 12 bytes for GCM
  //
  //   // การเข้ารหัส
  //   const encrypted = await crypto.subtle.encrypt(
  //     { name: "AES-GCM", iv: iv },
  //     key,
  //     plaintext
  //   );
  //   console.log({encrypted})
  //   return encrypted;
  // }
}
