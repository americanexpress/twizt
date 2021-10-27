/**
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

 import {MamProvider, NextRootAndMessages} from '../../main';

import { expect } from 'chai';
import sinon from 'sinon';
import IOTA from 'iota.lib.js';
import { AssertionError } from 'assert';
const Mam = require('mam.client.js');

// choose a different provider if node not local
const PROVIDER = 'http://localhost:14265';

let root: string;
let savedRoot: string;
let restrictedRoot: string;

interface Marbles {
    redMarbles: number;
    blueMarbles: number;
};

let mam: MamProvider<Marbles>;

const SIDEKEY = '99RIYCE9PKZHGHQCLKBWUDQVWBNYUJTD9EWQECFMURML9RQ9KINKL9VXBQRVVOFHMZRA9HYPCQAOW9CTH';
const SEED = 'JVQJOVVOIQLVVEVXCEHBPEPCZFRIKMJJZMNDZJMELQYAKTOLNEKHFOFAGXAQWANAXFVDEVTDVUUDTJLHN';
const ROOT = 'VOCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAZ';
const ROOT2 = 'COCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAH';
const ROOT3 = 'COCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAV';
const ROOT4 = 'COCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAV';

const DATA_TO_PUBLISH = [
    {'redMarbles': 15, 'blueMarbles':50},
    {'redMarbles': 19, 'blueMarbles': 1},
    {'redMarbles': 17, 'blueMarbles':3},
    {'redMarbles': 11, 'blueMarbles': 9},
    {'redMarbles': 8, 'blueMarbles': 12}
];

describe('twizt', () => {
    before(() => {
        mam = new MamProvider(PROVIDER);
    });

    afterEach( () => {
        if(Mam.fetch.restore === undefined) {
            return;
        }
        Mam.fetch.restore();
    });

    describe('unit tests', () => {
        it('should accept all constructor parameters', () => {
            mam = new MamProvider(PROVIDER, SEED, 2, 4);
            mam = new MamProvider(PROVIDER, SEED, 2);
            mam = new MamProvider(PROVIDER, SEED);
            mam = new MamProvider(PROVIDER);
        });
        it('should generate 5 seeds', async () => {
            const seeds = await mam.generateSeeds(5);
            expect(seeds.length).to.equal(5);
        });
        it('should accept all default constructor parameters', () => {
            mam = new MamProvider(PROVIDER, SEED, 2, 4, 14, ROOT);
        });
        it('should return non-null seed', () => {
            expect(mam.getSeed()).to.equal(SEED);
        });
        it('should generate 3 side keys', async () => {
            const sideKeys = await mam.generateSideKeys(3);
            expect(sideKeys.length).to.equal(3);
        });
        it('should be able to publish publicly', async () => {           
            sinon.stub(Mam, 'attach').resolves(
                new Promise((resolve, reject) => {resolve('random')}));

            let ret = await mam.publish(DATA_TO_PUBLISH[0]);
            expect(ret).not.to.be.null;

            ret = await mam.publish(DATA_TO_PUBLISH[0], 'dummy-side-key');
            expect(ret).not.to.be.null;            
        });
        it('should be able to fetch from the tangle', async () => {
            sinon.stub(Mam, 'fetch').callsFake((...args: any[]) => {
                const iota = new IOTA({ provider: PROVIDER });
                args[3](iota.utils.toTrytes(JSON.stringify({
                    nextRoot: ROOT,
                    messages: DATA_TO_PUBLISH
                })));
                return {
                    nextRoot: ROOT
                };
            });

            let resp = await mam.fetch(ROOT, null);
            expect(resp).not.to.be.null;

            // secure this time
            resp = await mam.fetch(ROOT2, SIDEKEY);
            expect(resp).not.to.be.null;


            // from the cache this time
            resp = await mam.fetch(ROOT);
            expect(resp).not.to.be.null;
        });
        it('should throw error from the tangle', async () => {
            const message = 'something went wrong';

            sinon.stub(Mam, 'fetch').returns({
                message: message
            });

            try {
                await mam.fetch(ROOT3, null);
                throw Error('should not get here');
            }
            catch(err) {
            }
        });
        it('should return null', async () => {
            sinon.stub(Mam, 'fetch').returns(null);
            const result = await mam.fetch(ROOT4, null);
            expect(result.nextRoot).to.be.null;
        });
    });
});

