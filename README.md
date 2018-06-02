# ngx-zone-scheduler #
[![npm version](https://img.shields.io/npm/v/ngx-zone-scheduler.svg)](https://www.npmjs.com/package/ngx-zone-scheduler) [![npm downloads](https://img.shields.io/npm/dw/ngx-zone-scheduler.svg)](https://www.npmjs.com/package/ngx-zone-scheduler) [![Build Status](https://travis-ci.org/Jovalent/ngx-zone-scheduler.svg?branch=master)](https://travis-ci.org/Jovalent/ngx-zone-scheduler) [![dependencies Status](https://david-dm.org/Jovalent/ngx-zone-scheduler/status.svg)](https://david-dm.org/Jovalent/ngx-zone-scheduler) [![devDependencies Status](https://david-dm.org/Jovalent/ngx-zone-scheduler/dev-status.svg)](https://david-dm.org/Jovalent/ngx-zone-scheduler?type=dev) [![peerDependencies Status](https://david-dm.org/Jovalent/ngx-zone-scheduler/peer-status.svg)](https://david-dm.org/Jovalent/ngx-zone-scheduler?type=peer)


A `SchedulerLike` implementation for use with [Angular](https://github.com/angular/angular) and [rxjs](https://github.com/ReactiveX/rxjs).

## Purpose ##

When an Angular component subscribes to an `Observable` data source, the callback will run outside of the Angular zone. If updates are made to the component within the callback, Angular may not detect the changes. This can lead to many strange problems that can be difficult to debug.

This module provides a `SchedulerLike` implementation that will run your callbacks in the Angular zone so the changes will be detected. It can be injected into your services so your components don't need to worry about zones.

This module should be fully [AoT](https://angular.io/guide/aot-compiler) compatible. It is extremely lightweight, as all of its runtime dependencies are [peerDependencies](https://nodejs.org/en/blog/npm/peer-dependencies/).

## Usage ##

Register the `ZoneSchedulerModule` as an import with your `AppModule`

In `app.module.ts`:

```ts
import { NgModule } from '@angular/core';
import { ZoneSchedulerModule } from 'ngx-zone-scheduler';

@NgModule( {
	imports: [ ZoneSchedulerModule ]
	// additional module metadata (declarations, bootstrap, etc)
} )
export class AppModule {}
```

In your services:

```ts
import { Inject } from '@angular/core';
import { Observable, SchedulerLike } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { ZoneScheduler } from 'ngx-zone-scheduler';

export class FooService {
	public constructor(
		@Inject( ZoneScheduler )
		private readonly scheduler: SchedulerLike
	) {}

	private data: Observable<{}>; // TODO: initialize data source

	public foo() {
		return this.data.pipe( observeOn( this.scheduler ) );
	}
}
```

## Alternative Usage ##

You may also choose to inject `ZoneScheduler` directly into your components, and pipe to `observeOn` from the consumer rather than the producer. This approach is less encapsulated, though, and has an increased surface area for maintenance and testing.

It's also possible to construct `ZoneScheduler` without `ZoneSchedulerModule`. You can simply pass an instance of `NgZone` to the `ZoneScheduler` constructor. `ZoneSchedulerModule` simply registers a provider for `ZoneScheduler` dependency injection.
