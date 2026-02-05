# @reactive-cache/map

<a href="https://www.npmjs.com/package/@reactive-cache/map">
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
</a>

A TypeScript library providing reactive, cached map data structures for Angular and RxJS-based projects. Part of the `@reactive-cache` ecosystem.

## Installation

```bash
npm install @reactive-cache/map
```

## Features

- **Reactive Caching**: Automatically caches values as RxJS Observables
- **Lazy Loading**: Values are only fetched when first requested
- **Multiple Map Types**: Choose between regular maps and weak maps
- **Mutable & Immutable Options**: Select constant (immutable) or mutable cache behavior
- **Flexible Input**: Accepts Observables, Promises, or raw values as factory functions
- **TypeScript Support**: Full type safety with generics
- **Memory Efficient**: WeakMap variants allow automatic garbage collection

## Map Types

| Class | Key Type | Mutable | Use Case |
|-------|----------|---------|----------|
| `ReactiveMap` | `string \| number \| symbol` | Yes | General-purpose cached data with primitive keys |
| `WeakReactiveMap` | `object` | Yes | Object-keyed data with automatic memory cleanup |
| `ConstantReactiveMap` | `string \| number \| symbol` | No | Read-only cached data with primitive keys |
| `ConstantWeakReactiveMap` | `object` | No | Read-only object-keyed data with memory cleanup |

## API Reference

### ReactiveMap<K, V>

A reactive map with primitive keys that supports mutable operations.

```typescript
import { ReactiveMap } from '@reactive-cache/map';

const map = new ReactiveMap<string, User>(
  'usersMap',                              // name for debugging
  (key) => fetchUser(key)                  // factory function
);
```

#### Constructor

```typescript
new ReactiveMap<K, V>(
  name: string,
  machine: (key: K) => Observable<V> | Promise<V> | V,
  params?: { constant?: boolean }
)
```

#### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `get(key: K)` | `Observable<V>` | Get or create a cached observable for the key |
| `next(key: K, value: V)` | `void` | Emit a new value for the key |
| `reset(key: K)` | `void` | Reset the cache state for the key |
| `update(key: K)` | `Observable<V>` | Force refresh the cached value |
| `delete(key: K)` | `void` | Remove the key from the map |
| `has(key: K)` | `boolean` | Check if the key exists |
| `clear()` | `void` | Remove all entries |

### WeakReactiveMap<K, V>

Same API as `ReactiveMap` but uses `WeakMap` internally. Keys must be objects.

```typescript
import { WeakReactiveMap } from '@reactive-cache/map';

const map = new WeakReactiveMap<UserRef, UserData>(
  'weakUsersMap',
  (userRef) => fetchUserData(userRef.id)
);
```

### ConstantReactiveMap<K, V>

An immutable reactive map with primitive keys. Does not support `next`, `reset`, or `update` methods.

```typescript
import { ConstantReactiveMap } from '@reactive-cache/map';

const map = new ConstantReactiveMap<string, Config>(
  'configMap',
  (key) => loadConfig(key)
);
```

#### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `get(key: K)` | `Observable<V>` | Get or create a cached observable for the key |
| `delete(key: K)` | `void` | Remove the key from the map |
| `clear()` | `void` | Remove all entries |

### ConstantWeakReactiveMap<K, V>

Same API as `ConstantReactiveMap` but uses `WeakMap` internally. Keys must be objects.

```typescript
import { ConstantWeakReactiveMap } from '@reactive-cache/map';

const map = new ConstantWeakReactiveMap<Document, Metadata>(
  'docMetaMap',
  (doc) => extractMetadata(doc)
);
```

## Usage Examples

### Basic Usage with Synchronous Values

```typescript
import { ReactiveMap } from '@reactive-cache/map';

const greetingMap = new ReactiveMap<string, string>(
  'greetings',
  (name) => `Hello, ${name}!`
);

greetingMap.get('World').subscribe(console.log);
// Output: Hello, World!

// Update the value
greetingMap.next('World', 'Hi, World!');
greetingMap.get('World').subscribe(console.log);
// Output: Hi, World!
```

### Async Data Fetching

```typescript
import { ReactiveMap } from '@reactive-cache/map';
import { Observable } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

const usersMap = new ReactiveMap<number, User | null>(
  'users',
  (userId) => ajax(`/api/users/${userId}`).pipe(
    catchError((err) => null);
  )
);

// First call fetches from API
usersMap.get(1).subscribe(user => {
  console.log(user.name);
});

// Second call returns cached value
usersMap.get(1).subscribe(user => {
  console.log(user.name); // No API call, uses cache
});

// Force refresh
usersMap.update(1).subscribe(user => {
  console.log('Refreshed:', user.name);
});
```

### Using with Promises

```typescript
import { ReactiveMap } from '@reactive-cache/map';

const dataMap = new ReactiveMap<string, any>(
  'apiData',
  (endpoint) => fetch(`/api/${endpoint}`).then(res => res.json())
);

dataMap.get('posts').subscribe(posts => {
  console.log('Posts:', posts);
});
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { ReactiveMap } from '@reactive-cache/map';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsMap = new ReactiveMap<number, Product>(
    'products',
    (id) => this.http.get<Product>(`/api/products/${id}`)
  );

  constructor(private http: HttpClient) {}

  getProduct(id: number): Observable<Product> {
    return this.productsMap.get(id);
  }

  refreshProduct(id: number): Observable<Product> {
    return this.productsMap.update(id);
  }

  updateProductLocally(id: number, product: Product): void {
    this.productsMap.next(id, product);
  }

  clearCache(): void {
    this.productsMap.clear();
  }
}
```

### Using WeakReactiveMap for Object Keys

```typescript
import { WeakReactiveMap } from '@reactive-cache/map';

interface Component {
  id: string;
  type: string;
}

interface ComponentState {
  isLoaded: boolean;
  data: any;
}

const componentStates = new WeakReactiveMap<Component, ComponentState>(
  'componentStates',
  (component) => ({
    isLoaded: false,
    data: null
  })
);

const myComponent = { id: '1', type: 'widget' };

componentStates.get(myComponent).subscribe(state => {
  console.log('State:', state);
});

// Update state
componentStates.next(myComponent, {
  isLoaded: true,
  data: { content: 'Hello' }
});

// When myComponent is garbage collected, the cache entry is automatically removed
```

### Immutable Configuration Cache

```typescript
import { ConstantReactiveMap } from '@reactive-cache/map';

interface FeatureConfig {
  enabled: boolean;
  settings: Record<string, any>;
}

const configMap = new ConstantReactiveMap<string, FeatureConfig>(
  'featureConfigs',
  (featureName) => fetch(`/api/config/${featureName}`).then(r => r.json())
);

// Values cannot be modified after initial fetch
configMap.get('darkMode').subscribe(config => {
  console.log('Dark mode enabled:', config.enabled);
});

// configMap.next() - Not available on ConstantReactiveMap
// configMap.reset() - Not available on ConstantReactiveMap
```

## Type Definitions

```typescript
// Input type for factory functions
type ArgType<T> = Observable<T> | Promise<T> | T;

// Key types
type PrimitiveKey = string | number | symbol;
type ObjectKey = object;
```

## When to Use Each Map Type

| Scenario | Recommended Type |
|----------|------------------|
| API responses that may need updating | `ReactiveMap` |
| Static configuration data | `ConstantReactiveMap` |
| Component instances as keys | `WeakReactiveMap` |
| DOM elements as keys (read-only) | `ConstantWeakReactiveMap` |
| User session data | `ReactiveMap` |
| Translated strings | `ConstantReactiveMap` |
| Temporary object associations | `WeakReactiveMap` |

## Dependencies

- [rxjs](https://rxjs.dev/) ^7.8.1
- [@reactive-cache/core](https://www.npmjs.com/package/@reactive-cache/core) ^3.2.0

## Related Packages

- [@reactive-cache/core](https://www.npmjs.com/package/@reactive-cache/core) - Core reactive caching functionality

## License

ISC

## Author

[Jor-ban](https://github.com/Jor-ban)

## Repository

[https://github.com/Jor-ban/reactive-cache](https://github.com/Jor-ban/reactive-cache)
