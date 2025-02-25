import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(

  ) {
    console.log('AuthInterceptor');
  }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse)  => {
        console.log(error);
        if (error) {
          console.error('HTTP ERROR : ', error.status, error.message)
        }
        return throwError(() => error);
      })
    )
  }
}

