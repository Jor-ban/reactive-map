import {
  __createReactiveCache__,
  ConstantReactiveCacheObservable,
  ReactiveCacheObservable,
  __REACTIVE_CACHE_WINDOW_PROP_NAME__,
  ReactiveCacheObservableParameters
} from "@reactive-cache/core"
import {Observable, Subject} from "rxjs";

export type ArgType<T> = Observable<T> | Promise<T> | T
export type __ReactiveMapType__ = ReactiveMap<any, any> | WeakReactiveMap<any, any> | ConstantReactiveMap<any, any> | ConstantWeakReactiveMap<any, any>

const __REACTIVE_MAPS_LIST__: __ReactiveMapType__[] = []
const __REACTIVE_MAPS_ON_UPDATE_MAP__: WeakMap<__ReactiveMapType__, Observable<any>> = new WeakMap()
const __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__: Subject<void> = new Subject<void>()

try {
  const WINDOW = this || global || window
  if(WINDOW && typeof WINDOW === 'object') {
    // @ts-ignore
    window.addEventListener('load', () => {
      // @ts-ignore
      if(!WINDOW.__REACTIVE_CACHE_WINDOW_PROP_NAME__) {
        // @ts-ignore
        WINDOW.__REACTIVE_CACHE_WINDOW_PROP_NAME__ = {}
      }
      // @ts-ignore
      WINDOW.__REACTIVE_CACHE_WINDOW_PROP_NAME__['__REACTIVE_MAPS_LIST__'] = __REACTIVE_MAPS_LIST__
      // @ts-ignore
      WINDOW.__REACTIVE_CACHE_WINDOW_PROP_NAME__['__REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__'] = __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__
      // @ts-ignore
      WINDOW.__REACTIVE_CACHE_WINDOW_PROP_NAME__['__REACTIVE_MAPS_ON_UPDATE_MAP__'] = __REACTIVE_MAPS_ON_UPDATE_MAP__
    })
  }
} catch(_ignored) {}

export class ReactiveMap<K extends string | number | symbol, V> {
  private readonly map = new Map<K, ReactiveCacheObservable<V>>()
  private readonly onUpdateSubject = new Subject<V | Symbol>()
  public constructor(public readonly name: string, private readonly machine: (value: K) => ArgType<V>, params?: { constant?: boolean }) {
    __REACTIVE_MAPS_LIST__.push(this)
    __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__.next()
    __REACTIVE_MAPS_ON_UPDATE_MAP__.set(this, this.onUpdateSubject)
  }

  public get(key: K): Observable<V> {
    const value = this.map.get(key)
    if (value) {
      return value
    }
    const { rc } = __createReactiveCache__(this.machine(key), {}, (v) => {
      this.onUpdateSubject.next(v)
    })
    this.map.set(key, rc as ReactiveCacheObservable<V>)
    return rc
  }

  public next(key: K, value: V): void {
    const subject = this.map.get(key)
    if (subject) {
      subject.next(value)
    }
  }

  public reset(key: K): void {
    const subject = this.map.get(key)
    if (subject) {
      subject.resetState()
    }
  }

  public delete(key: K): void {
    this.map.delete(key)
  }

  public update(key: K): Observable<V> {
    const subject = this.map.get(key)
    if (subject) {
      return subject.update()
    }
    return this.get(key)
  }

  public has(key: K): boolean {
    return this.map.has(key)
  }

  public clear(): void {
    this.map.clear()
  }
}

export class WeakReactiveMap<K extends object, V> {
  private readonly map = new WeakMap<K, ReactiveCacheObservable<V>>()
  private readonly onUpdateSubject = new Subject<V | Symbol>()
  public constructor(public readonly name: string, private readonly machine: (value: K) => ArgType<V>, params?: { constant?: boolean }) {
    __REACTIVE_MAPS_LIST__.push(this)
    __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__.next()
    __REACTIVE_MAPS_ON_UPDATE_MAP__.set(this, this.onUpdateSubject)
  }

  public get(key: K): Observable<V> {
    const value = this.map.get(key)
    if (value) {
      return value
    }
    const { rc } = __createReactiveCache__(this.machine(key), {}, (v) => {
      this.onUpdateSubject.next(v)
    })
    this.map.set(key, rc as ReactiveCacheObservable<V>)
    return rc
  }

  public next(key: K, value: V): void {
    const subject = this.map.get(key)
    if (subject) {
      subject.next(value)
    }
  }

  public reset(key: K): void {
    const subject = this.map.get(key)
    if (subject) {
      subject.resetState()
    }
  }

  public delete(key: K): void {
    this.map.delete(key)
  }

  public update(key: K): Observable<V> {
    const subject = this.map.get(key)
    if (subject) {
      return subject.update()
    }
    return this.get(key)
  }

  public has(key: K): boolean {
    return this.map.has(key)
  }
}

export class ConstantReactiveMap<K extends string | number | symbol, V> {
  private readonly map = new Map<K, ConstantReactiveCacheObservable<V>>()
  private readonly onUpdateSubject = new Subject<V | Symbol>()
  public constructor(public readonly name: string, private readonly machine: (value: K) => ArgType<V>) {
    __REACTIVE_MAPS_LIST__.push(this)
    __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__.next()
    __REACTIVE_MAPS_ON_UPDATE_MAP__.set(this, this.onUpdateSubject)
  }

  public get(key: K): Observable<V> {
    const value = this.map.get(key)
    if (value) {
      return value
    }
    const { rc } = __createReactiveCache__(this.machine(key), { constant: true }, (v) => {
      this.onUpdateSubject.next(v)
    })
    this.map.set(key, rc as ConstantReactiveCacheObservable<V>)
    return rc
  }

  public delete(key: K): void {
    this.map.delete(key)
  }

  public clear(): void {
    this.map.clear()
  }
}

export class ConstantWeakReactiveMap<K extends object, V> {
  private readonly map = new Map<K, ConstantReactiveCacheObservable<V>>()
  private readonly onUpdateSubject = new Subject<V | Symbol>()
  public constructor(public readonly name: string, private readonly machine: (value: K) => ArgType<V>) {
    __REACTIVE_MAPS_LIST__.push(this)
    __REACTIVE_MAPS_LIST_UPDATE_OBSERVABLE__.next()
    __REACTIVE_MAPS_ON_UPDATE_MAP__.set(this, this.onUpdateSubject)
  }

  public get(key: K): Observable<V> {
    const value = this.map.get(key)
    if (value) {
      return value
    }
    const { rc } = __createReactiveCache__(this.machine(key), { constant: true }, (v) => {
      this.onUpdateSubject.next(v)
    })
    this.map.set(key, rc as ConstantReactiveCacheObservable<V>)
    return rc
  }

  public delete(key: K): void {
    this.map.delete(key)
  }

  public clear(): void {
    this.map.clear()
  }
}