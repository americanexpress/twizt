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

import { expect } from 'chai';
import { Graph, Vertex } from '../../main';

interface Dummy {
    value: number;
};

describe('VertexTest', () => {
    const graph: Graph<Dummy> = new Graph();

    before(() => {
        graph.addVertex(new Vertex({ 'value': 0 }));
        graph.addVertex(new Vertex({ 'value': 1 }));
        graph.addVertex(new Vertex({ 'value': 2 }));
        graph.addVertex(new Vertex({ 'value': 3 }));
        graph.addVertex(new Vertex({ 'value': 4 }));
        graph.addVertex(new Vertex({ 'value': 5 }));
        graph.addVertex(new Vertex({ 'value': 6 }));
        graph.addVertex(new Vertex({ 'value': 7 }));
    });

    describe('unit tests', () => {
        it('should allow adding connections', async () => {
            graph.connect(0, 1);
            graph.connect(0, 2);
            graph.connect(0, 7);
            graph.connect(2, 6);
            graph.connect(1, 3);
            graph.connect(1, 4);
            graph.connect(1, 5);
            graph.connect(3, 7);
        });

        it('should concatenate second graph', async () => {
            const graph2: Graph<Dummy> = new Graph();
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
            graph.concatGraph(graph2);
            graph.connect(4, 11);
            expect(graph.vertices[15].data.value).to.equal(7);
            expect(graph.adj[0].length).to.equal(3);
            expect(graph.adj[10].length).to.equal(1);

        });

        it('should deserialize graph correctly', async () => {
            const serializedGraph = JSON.parse(JSON.stringify(graph));
            const deserializedGraph = new Graph().copyFrom(serializedGraph);
            expect(deserializedGraph.vertices.length).to.equal(16);
        });

        it('should calculate DFS correctly', async () => {
            try {
                const res = await graph.depthFirstSearch();
                expect(JSON.stringify(res)).to.equal('[0, 1, 3, 7, 4, 11, 14, 5, 2, 6]');
            }
            catch (err) {
                console.error(err);
            }
        });
    });
});
