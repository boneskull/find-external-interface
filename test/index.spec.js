'use strict';

const expect = require('unexpected').clone();
const os = require('os');
const {findExternalInterface} = require('../index');
const sinon = require('sinon');
const allInterfaces = require('./interfaces.json');
const cloneDeep = require('lodash.clonedeep');

describe('findExternalInterface()', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  describe('when an external interface is not present', () => {
    beforeEach(() => {
      const interfaces = cloneDeep(allInterfaces);
      delete interfaces.en13;
      sandbox.stub(os, 'networkInterfaces').returns(interfaces);
    });

    it('should return null', () => {
      expect(findExternalInterface(), 'to be', null);
    });
  });

  describe('when an external interface is present', () => {
    beforeEach(() => {
      sandbox.stub(os, 'networkInterfaces').returns(allInterfaces);
    });

    it('should return the name of the interface', () => {
      expect(findExternalInterface(), 'to be', 'en13');
    });
  });

  describe('when "IPv6" option is truthy', () => {
    beforeEach(() => {
      sandbox.stub(os, 'networkInterfaces').returns(allInterfaces);
    });

    it('should not return an IPv4 interface', () => {
      expect(findExternalInterface({IPv6: true}), 'to be', 'utun0');
    });
  });

  describe('when "name" option is a nonempty string', () => {
    describe('and the interface is external', () => {
      beforeEach(() => {
        const interfaces = Object.assign({}, allInterfaces);
        interfaces.en14 = interfaces.en13;
        sandbox.stub(os, 'networkInterfaces').returns(interfaces);
      });

      it('should return an interface by that name', () => {
        expect(findExternalInterface({name: 'en14'}), 'to be', 'en14');
      });
    });

    describe('and the interface is internal', () => {
      beforeEach(() => {
        const interfaces = cloneDeep(allInterfaces);
        interfaces.en14 = interfaces.en13;
        interfaces.en14[0].internal = true;
        sandbox.stub(os, 'networkInterfaces').returns(interfaces);
      });

      it('should return null', () => {
        expect(findExternalInterface({name: 'en14'}), 'to be', null);
      });
    });

    describe('and there is no matching interface', () => {
      beforeEach(() => {
        const interfaces = Object.assign({}, allInterfaces);
        interfaces.en14 = interfaces.en13;
        sandbox.stub(os, 'networkInterfaces').returns(interfaces);
      });

      it('should return null', () => {
        expect(findExternalInterface({name: 'en15'}), 'to be', null);
      });
    });
  });

  describe('when "name" option is an empty string', () => {
    beforeEach(() => {
      sandbox.stub(os, 'networkInterfaces').returns(allInterfaces);
    });

    it('should return the first external IPv4 interface', () => {
      expect(findExternalInterface({name: ''}), 'to be', 'en13');
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
