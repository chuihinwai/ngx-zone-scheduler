import { NgModule, NgZone } from '@angular/core';

import { ZoneScheduler } from './zone-scheduler';

@NgModule( {
	providers: [
		{ provide: ZoneScheduler, useClass: ZoneScheduler, deps: [ NgZone ] }
	]
} )
export class ZoneSchedulerModule {}
