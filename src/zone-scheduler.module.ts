import { NgModule, NgZone } from '@angular/core';

import { ZoneScheduler } from './zone-scheduler';

@NgModule( {
	providers: [
		{ provide: ZoneScheduler, useFactory: ngZone => new ZoneScheduler( ngZone ), deps: [ NgZone ] }
	]
} )
export class ZoneSchedulerModule {}
