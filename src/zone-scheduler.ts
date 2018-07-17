import { NgZone } from '@angular/core';
import { SchedulerLike, SchedulerAction, Subscription } from 'rxjs';

export class ZoneAction<T> extends Subscription {
	public id: any;
	public state: T;
	public delay: number;
	private pending: boolean = false;

	constructor( private scheduler: ZoneScheduler, private work: ( this: SchedulerAction<T>, state?: T ) => void ) {
		super();
	}

	public schedule( state?: T, delay: number = 0 ): Subscription {
		if( this.closed ) return this;
		this.state = state;
		const id = this.id;
		const scheduler = this.scheduler;
		if( id != null ) this.id = this.recycleAsyncId( scheduler, id, delay );
		this.pending = true;
		this.delay = delay;
		this.id = this.id || this.requestAsyncId( scheduler, this.id, delay );
		return this;
	}

	private requestAsyncId( scheduler: ZoneScheduler, id?: any, delay: number = 0 ): any {
		return setInterval( scheduler.flush.bind( scheduler, this ), delay );
	}

	private recycleAsyncId( scheduler: ZoneScheduler, id: any, delay: number = 0 ): any {
		if( delay !== null && this.delay === delay && this.pending === false ) return id;
		return clearInterval( id ) && undefined || undefined;
	}

	public execute( state: T, delay: number ): any {
		if( this.closed ) return new Error( 'executing a cancelled action' );
		this.pending = false;
		const error = this._execute(state, delay);
		if( error ) {
			return error;
		} else if( this.pending === false && this.id != null ) {
			this.id = this.recycleAsyncId( this.scheduler, this.id, null );
		}
	}

	private _execute( state: T, delay: number ): any {
		let errored: boolean = false;
		let errorValue: any = undefined;
		try {
			this.work( state );
		} catch( e ) {
			errored = true;
			errorValue = !!e && e || new Error( e );
		}
		if( errored ) {
			this.unsubscribe();
			return errorValue;
		}
	}
}

export class ZoneScheduler implements SchedulerLike {
	public constructor( public readonly ngZone: NgZone ) {}

	public now = Date.now ? Date.now : () => +new Date();
	public actions: Array<ZoneAction<any>> = [];

	public schedule<T>( work: (this: SchedulerAction<T>, state?: T) => void, delay: number = 0, state?: T ): Subscription {
		return new ZoneAction<T>( this, work ).schedule( state, delay );
	}

	public flush( action?: ZoneAction<any> ): void {
		const { actions, ngZone } = this;
		let error: any;
		let index = -1;
		let count = actions.length;
		action = action || actions.shift();
		do {
			try {
				error = ngZone.run( () => action.execute( action.state, action.delay ) );
			} catch( e ) {
				error = e;
			}
			if( error ) break;
		} while( ++index < count && ( action = actions.shift() ) );
		if( error ) {
			while( ++index < count && ( action = actions.shift() ) ) {
				action.unsubscribe();
			}
			throw error;
		}
	}
}
