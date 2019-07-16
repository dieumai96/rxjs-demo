import { of, timer, BehaviorSubject, from } from 'rxjs';
import { map, tap, switchMap, mergeMap, shareReplay, concatMap, takeUntil, delay, takeWhile, skipWhile , pluck} from 'rxjs/operators';
import { user } from './data';

let startPage = 0;
let limitPage = 30;

let count = 0;
let time = timer(0, 10000);
let skipTime = new BehaviorSubject<boolean>(false);
let skipTime$ = skipTime.asObservable();
let subTime: boolean = false;
skipTime$.subscribe(data => subTime == data);
time.pipe(
  skipWhile(() => subTime),
  tap(() => {
    startPage++;
    if (startPage == limitPage) {
      startPage = 0;
    }
  }),
  switchMap(page => {
    let from = page * 10;
    let to = (page + 1) * 10;
    let list = [];
    for (let i = from; i < to; i++) {
      list.push(user[i].name)
    }
    return of(list);
  }),
  shareReplay(1),
  concatMap(res => from(res).pipe(
    concatMap((user, index) => {
      if (index <= 10) {
        skipTime.next(true);
        return of(
          {
            user,
            index
          }
        ).pipe(delay(200));
      }
    }), tap((data) => {
      if (data.index >= 9) {
        skipTime.next(false);
      }

    }),
    pluck('user'),
  )
  ),

).subscribe(data => console.log(data));