import "../../src/config/envConfig.mjs"
import app from "../../src/app.mjs";
import { getRegister, postRegister, getLogin, getLogout } from "../../src/controllers/authController.mjs";

import { expect, assert, should } from 'chai';
import request from "supertest";
import nock from 'nock';
import square from 'square';
import sinon from "sinon";

request(app);

describe('getRegister controller', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should redirect to home page if user is logged in', async () => {
        const mockUser = { _id: 123 };
        const mockReq = { user: mockUser };
        const mockRes = {
            redirect: sinon.spy(),
            render: sinon.spy(),
            flash: sinon.spy(),
        };

        await getRegister(mockReq, mockRes);

        expect(mockRes.redirect.calledOnceWith('/')).to.be.true;
        expect(mockRes.flash.calledOnceWith('You are already logged in')).to.be.true;
        expect(mockRes.render.notCalled).to.be.true;
    });

    it('should render register page if user is not logged in', async () => {
        const mockReq = { user: null };
        const mockRes = {
            redirect: sinon.spy(),
            render: sinon.spy(),
            flash: sinon.spy(),
        };

        await getRegister(mockReq, mockRes);

        expect(mockRes.redirect.notCalled).to.be.true;
        expect(mockRes.render.calledOnceWith('users/register')).to.be.true;
        expect(mockRes.flash.notCalled).to.be.true;
    });
});