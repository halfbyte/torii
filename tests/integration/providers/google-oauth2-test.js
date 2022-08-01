import { configure } from '@adopted-ember-addons/torii/configuration';
import MockPopup from '../../helpers/mock-popup';
import { module, test } from 'qunit';
import configuration from '../../../config/environment';
import {
  setupContext,
  teardownContext,
  setupApplicationContext,
  setApplication,
} from '@ember/test-helpers';
import Application from 'dummy/app';

module('Integration | Provider | Google', function (hooks) {
  hooks.beforeEach(async function () {
    setApplication(Application.create(configuration.APP));
    await setupContext(this, {});
    await setupApplicationContext(this);

    this.mockPopup = new MockPopup();
    this.failPopup = new MockPopup({ state: 'invalid-state' });

    this.torii = this.owner.lookup('service:torii');
    configure({
      providers: {
        'google-oauth2': { apiKey: 'dummy' },
      },
    });
  });

  hooks.afterEach(async function () {
    this.mockPopup.opened = false;
    this.failPopup.opened = false;
    await teardownContext(this);
  });

  test('Opens a popup to Google', function (assert) {
    const mockPopup = this.mockPopup;

    this.owner.register('torii-service:popup', mockPopup, {
      instantiate: false,
    });

    assert.expect(1);

    this.torii.open('google-oauth2').finally(function () {
      assert.ok(mockPopup.opened, 'Popup service is opened');
    });
  });

  test('Validates the state parameter in the response', function (assert) {
    this.owner.register('torii-service:popup', this.failPopup, {
      instantiate: false,
    });

    assert.expect(1);

    this.torii.open('google-oauth2').then(null, function (e) {
      assert.ok(
        /has an incorrect session state/.test(e.message),
        'authentication fails due to invalid session state response'
      );
    });
  });
});
