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

// choose a different provider if node not local
const PROVIDER = 'http://localhost:14265';

let root: string;
let savedRoot: string;
let restrictedRoot: string;

interface Marbles {
    redMarbles: number;
    blueMarbles: number;
};

let publishingMam: MamProvider<Marbles>;
let readerMam: MamProvider<any>;
let seed: string;

const SIDEKEY = '99RIYCE9PKZHGHQCLKBWUDQVWBNYUJTD9EWQECFMURML9RQ9KINKL9VXBQRVVOFHMZRA9HYPCQAOW9CTH';
const PUBLISHER_SEED = 'JVQJOVVOIQLVVEVXCEHBPEPCZFRIKMJJZMNDZJMELQYAKTOLNEKHFOFAGXAQWANAXFVDEVTDVUUDTJLHN';
const NEXT_ROOT = 'VOCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAZ';

const DATA_TO_PUBLISH = [
    {'redMarbles': 15, 'blueMarbles':50},
    {'redMarbles': 19, 'blueMarbles': 1},
    {'redMarbles': 17, 'blueMarbles':3},
    {'redMarbles': 11, 'blueMarbles': 9},
    {'redMarbles': 8, 'blueMarbles': 12}
];

describe('Iota', () => {
    before(function () {
        readerMam = new MamProvider(PROVIDER);
        publishingMam = new MamProvider(PROVIDER);
    });

    describe('Iota', () => {
        it('should generate 5 seeds', async () => {
            const seeds = await publishingMam.generateSeeds(5);
            expect(seeds.length).to.equal(5);
            seed = seeds[0];
        });
        it('should accept all default constructor parameters', () => {
            publishingMam = new MamProvider(PROVIDER, seed, 2, 4, 14, NEXT_ROOT);
        });
        it('should return non-null seed', () => {
            expect(publishingMam.getSeed()).to.equal(seed);
        });
        it('should be able to publish publicly', async () => {
            const ret = await publishingMam.publish(DATA_TO_PUBLISH[0]);
            console.log('first root', ret);
            expect(ret).not.to.be.null;
            root = ret;
        });
        it('should be able to publish more unencrypted data', async () => {
            const ret = await publishingMam.publish(DATA_TO_PUBLISH[1]);
            expect(ret).not.to.be.null;
         });
        it('should be able to publish more unencrypted data', async () => {
            const ret = await publishingMam.publish(DATA_TO_PUBLISH[2]);
            expect(ret).not.to.be.null;
        });
        it('should be able to publish more unencrypted data', async () => {
            const ret = await publishingMam.publish(DATA_TO_PUBLISH[3]);
            expect(ret).not.to.be.null;
        });
    });
    describe('fetch public data from tangle based on root', () => {
        it('should be able to fetch from the tangle', async () => {
            console.log('root is:', root);
            const resp = await readerMam.fetch(root, null);
            expect(resp).not.to.be.null;
            savedRoot = resp.nextRoot;
            console.log('tangle nextRoot:', resp.nextRoot);
        });
        it('should be able to fetch older data from the tangle', async () => {
            const resp = await readerMam.fetch(NEXT_ROOT);
            expect(resp).not.to.be.null;
            console.log('tangle nextRoot:', resp.nextRoot);
        });
    });
    describe('fetch public data from cache based on root', () => {
        it('should be able to fetch from cache. much faster this time', async () => {
            console.log('root is:', root);
            const resp = await readerMam.fetch(root);
            expect(resp.nextRoot).to.equal(savedRoot);
            console.log('cached nextRoot:', resp);
        });
    });
    describe('publish restricted', () => {
        interface Fruit {
            name: string;
        };

        const restrictedPublisher: MamProvider<Fruit> = new MamProvider(PROVIDER);
        let restrictedReader: MamProvider<Fruit> = new MamProvider(PROVIDER);

        it('should be able to publish restricted mode', async () => {
        const ret = await restrictedPublisher.publish({'name' : 'MELLON'}, SIDEKEY);
            restrictedRoot = ret;
            console.log('Root is:', restrictedRoot);
        });
        it('should be able to fetch restricted data from tangle', async () => {
            console.log('root is:', root);
            const resp = await restrictedPublisher.fetch(restrictedRoot, SIDEKEY);
            console.log('nextRoot:', resp.nextRoot, ' messages:', resp.messages);
            expect(resp.messages.length).to.eq(1);
        });

        it('should be able to fetch same restricted data from cache', async () => {
            const resp = await restrictedReader.fetch(restrictedRoot, SIDEKEY);
            console.log('nextRoot:', resp.nextRoot, ' messages:', resp.messages);
            expect(resp.messages.length).to.eq(1);
        });
    });
});

