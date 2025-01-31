import {ReactiveMap} from "./index.js";
import {Observable} from "rxjs";

const map = new ReactiveMap<string, string>('map', (key) => 'Hello ' + key);

map.get('world').subscribe(console.log);
map.next('world', 'Hello world!');
map.get('world').subscribe(console.log);
console.log(map.has('world'));

const map2 = new ReactiveMap<string, string>('testmap', (key) => new Observable<string>(sub => {
  console.log('fetch called')
  setTimeout(() => {
    sub.next('Hello ' + key + '_' + Math.random());
    sub.complete();
  }, 1000)
}));

map2.get('world').subscribe(console.log);
console.log(map2.has('world'));
console.log(map2.has('world2'));
map2.update('world').subscribe(console.log);