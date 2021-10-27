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
import {Graph, MamProvider, NextRootAndMessages, Vertex} from '../../main';
import { expect } from 'chai';

// choose a different provider if node not local
// const PROVIDER = 'http://localhost:14265';
const PROVIDER = 'https://nodes.devnet.iota.org:443';

let root: string;
let savedRoot: string;
let restrictedRoot: string;

interface Dummy {
    value: number;
};

let publishingMam: MamProvider<Graph<Dummy>>;
let readerMam: MamProvider<any>;
let seed: string;

const SIDEKEY = '99RIYCE9PKZHGHQCLKBWUDQVWBNYUJTD9EWQECFMURML9RQ9KINKL9VXBQRVVOFHMZRA9HYPCQAOW9CTH';
const PUBLISHER_SEED = 'JVQJOVVOIQLVVEVXCEHBPEPCZFRIKMJJZMNDZJMELQYAKTOLNEKHFOFAGXAQWANAXFVDEVTDVUUDTJLHN';
const NEXT_ROOT = 'VOCZEYAJGIH9ZTKTTPWWCCOYFALSKNAVDVFFXBMJVJJUSWRNCRNFY9KSCJVXVWIHKRMTTZS9YDWCONHAZ';

const graph: Graph<Dummy> = new Graph();
const graph2: Graph<Dummy> = new Graph();

describe('Iota', () => {
    before(function () {
        readerMam = new MamProvider(PROVIDER);
        publishingMam = new MamProvider(PROVIDER);
        graph.addVertex(new Vertex({ 'value': 0 }));
        graph.addVertex(new Vertex({ 'value': 1 }));
        graph.addVertex(new Vertex({ 'value': 2 }));
        graph.addVertex(new Vertex({ 'value': 3 }));
        graph.addVertex(new Vertex({ 'value': 4 }));
        graph.addVertex(new Vertex({ 'value': 5 }));
        graph.addVertex(new Vertex({ 'value': 6 }));
        graph.addVertex(new Vertex({ 'value': 7 }));
        graph.connect(0, 1);
        graph.connect(0, 2);
        graph.connect(0, 7);
        graph.connect(2, 6);
        graph.connect(1, 3);
        graph.connect(1, 4);
        graph.connect(1, 5);
        graph.connect(3, 7);
        graph2.addVertex(new Vertex({ 'value': 0 }));
        graph2.addVertex(new Vertex({ 'value': 1 }));
        graph2.addVertex(new Vertex({ 'value': 2 }));
        graph2.addVertex(new Vertex({ 'value': 3 }));
        graph2.addVertex(new Vertex({ 'value': 4 }));
        graph2.addVertex(new Vertex({ 'value': 5 }));
        graph2.addVertex(new Vertex({ 'value': 6 }));
        graph2.addVertex(new Vertex({ 'value': 7 }));
        graph2.connect(0, 1);
        graph2.connect(0, 2);
        graph2.connect(0, 7);
        graph2.connect(2, 6);
        graph2.connect(1, 3);
        graph2.connect(1, 4);
        graph2.connect(1, 5);
        graph2.connect(3, 7);


    });

    describe('Iota', () => {
        it('should generate 5 seeds', async () => {
            const seeds = await publishingMam.generateSeeds(5);
            expect(seeds.length).to.equal(5);
            seed = seeds[0];
        });
        it('should accept all default constructor parameters', () => {
            publishingMam = new MamProvider(PROVIDER, seed, 2, 4, 9, NEXT_ROOT);
        });
        it('should return non-null seed', () => {
            expect(publishingMam.getSeed()).to.equal(seed);
        });
        it('should be able to publish publicly', async () => {
            try {
                const ret = await publishingMam.publish(graph);
                console.log('first root', ret);
                expect(ret).not.to.be.null;
                root = ret;
            } 
            catch (error) {
                console.error(error);
            }
        });
        it('should be able to publish more unencrypted data', async () => {
            const ret = await publishingMam.publish(graph2);
            expect(ret).not.to.be.null;
         });
    });
    describe('fetch public data from tangle based on root and check integrity', () => {
        it('should be able to fetch from the tangle', async () => {
            console.log('root is:', root);
            const resp = await readerMam.fetch(root, null);
            expect(resp).not.to.be.null;
            savedRoot = resp.nextRoot;
            console.log('tangle nextRoot:', resp.nextRoot);
            const ret_graph = new Graph().copyFrom(resp.messages[0]);
            const ret_graph2 = new Graph().copyFrom(resp.messages[1]);
            ret_graph.concatGraph(ret_graph2);
            ret_graph.connect(4, 11);
            const res = await ret_graph.depthFirstSearch();
            expect(res.length).to.equal(10);
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

