import chai, { expect } from 'chai';
import { after, afterEach, before, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import { ZoneScheduler } from '../dist';

chai.use( require( 'sinon-chai' ) );

describe( 'ZoneScheduler', () => {
	let callback, fakeTimer, sandbox, state, zone;
	beforeEach( () => {
		sandbox = sinon.sandbox.create();
		fakeTimer = sandbox.useFakeTimers();
		callback = sinon.spy();
		state = Symbol( 'state' );
		zone = {
			run: sinon.stub().callsArg( 0 )
		};
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'calls ngZone.run asynchronously', () => {
		const subject = new ZoneScheduler( zone );
		subject.schedule( callback );
		expect( zone.run ).not.to.have.been.called;
		fakeTimer.tick( 1 );
		expect( zone.run ).to.have.been.calledOnce;
	} );

	it( 'passes state to the callback', () => {
		const subject = new ZoneScheduler( zone );
		subject.schedule( callback, 0, state );
		fakeTimer.tick( 1 );
		expect( callback ).to.have.been.calledOnce.calledWith( state );
	} );
} );
