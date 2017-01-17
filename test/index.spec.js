'use strict';

var expect = require('chai').expect;
var os = require('os');
var findExternalInterface = require('../index').findExternalInterface;
var sinon = require('sinon');
var allInterfaces = require('./interfaces.json');
var cloneDeep = require('lodash.clonedeep');

describe('findExternalInterface()', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  describe('when an external interface is not present', function () {
    beforeEach(function () {
      var interfaces = cloneDeep(allInterfaces);
      delete interfaces.en13;
      sandbox.stub(os, 'networkInterfaces')
        .returns(interfaces);
    });

    it('should return null', function () {
      expect(findExternalInterface()).to.be.null;
    });
  });

  describe('when an external interface is present', function () {
    beforeEach(function () {
      sandbox.stub(os, 'networkInterfaces')
        .returns(allInterfaces);
    });

    it('should return the name of the interface', function () {
      expect(findExternalInterface())
        .to
        .equal('en13');
    });
  });

  describe('when "IPv6" option is truthy', function () {
    beforeEach(function () {
      sandbox.stub(os, 'networkInterfaces')
        .returns(allInterfaces);
    });

    it('should not return an IPv4 interface', function () {
      expect(findExternalInterface({IPv6: true}))
        .to
        .equal('utun0');
    });
  });

  describe('when "name" option is a nonempty string', function () {
    describe('and the interface is external', function () {
      beforeEach(function () {
        var interfaces = Object.assign({}, allInterfaces);
        interfaces.en14 = interfaces.en13;
        sandbox.stub(os, 'networkInterfaces')
          .returns(interfaces);
      });

      it('should return an interface by that name', function () {
        expect(findExternalInterface({name: 'en14'}))
          .to
          .equal('en14');
      });
    });

    describe('and the interface is internal', function () {
      beforeEach(function () {
        var interfaces = cloneDeep(allInterfaces);
        interfaces.en14 = interfaces.en13;
        interfaces.en14[0].internal = true;
        sandbox.stub(os, 'networkInterfaces')
          .returns(interfaces);
      });

      it('should return null', function () {
        expect(findExternalInterface({name: 'en14'})).to.be.null;
      });
    });
  });

  describe('when "name" option is an empty string', function () {
    beforeEach(function () {
      sandbox.stub(os, 'networkInterfaces')
        .returns(allInterfaces);
    });

    it('should return the first external IPv4 interface', function () {
      expect(findExternalInterface({name: ''}))
        .to
        .equal('en13');
    });
  });

  afterEach(function () {
    sandbox.restore();
  });
});
