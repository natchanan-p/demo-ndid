import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, concatMap, delay, from, interval, Observable, of, switchMap, takeUntil, tap} from 'rxjs';
import * as CryptoJS from 'crypto-js';
import {DataService} from '../data-service/data-service.service';
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
    private dataService: DataService,
  ) { }

  isSignIn(): boolean {
    return !!this.dataService.get('token')
  }

  signIn(username: string, password: string): Observable<any> {
    return from(this.encryptAesGcm(username,password)).pipe(
      switchMap(({ cipherU, cipherP, tagP, tagU}) => {
        const body = {
          cipherU, tagP: tagP, cipherP, tagU: tagU
        };
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // ส่ง request ไปยัง API
        return this.http.post<any>('/api/sign-in', body, { headers: headers }).pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error.error);
          })
        );
      })
    )
  }

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

}
