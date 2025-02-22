import { Inject,Injectable,NgZone  } from '@angular/core';
import  {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    @Inject(SESSION_STORAGE)
    private storageService: StorageService,
    private router: Router
  ) {
  }

  get<T>(key: string): T {
    return this.storageService.get(key);
  }

  refresh<T>(key: string){
    this.storageService.remove(key);
    this.router.navigate(['/']);
  }

  set<T>(key: string, value: T) {
     this.storageService.set(key,value);
  }

  clear() {
    this.storageService.clear();
  }
}
