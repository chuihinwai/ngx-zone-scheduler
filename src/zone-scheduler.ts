import { NgZone } from '@angular/core';

import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';

export class ZoneScheduler extends AsyncScheduler {
	public constructor( public readonly ngZone: NgZone ) {
		super( AsyncAction );
	}

	public flush( action: AsyncAction<any> ) {
		const { actions, ngZone } = this;

		if( this.active ) {
			actions.push( action );
			return;
		}

		this.active = true;

		let error: any;
		do {
			if( error = ngZone.run( () =>
				action.execute( action.state, action.delay )
			) ) {
				break;
			}
		} while( action = actions.shift() );

		this.active = false;

		if( error ) {
			while( action = actions.shift() ) {
				action.unsubscribe();
			}
			throw error;
		}
	}
}
