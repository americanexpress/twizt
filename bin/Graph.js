"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const Vertex_1 = require("./Vertex");
/**
 * Class encapsulating graph functionality
 *
 * @export
 * @class Graph
 * @template I
 * @template T
 */
class Graph {
    /**
     * Creates an instance of Graph.
     * @param {I} rootIndex
     * @param {T} rootValue
     * @memberof Graph
     */
    constructor(rootIndex = null, rootValue = null) {
        this.root = new Vertex_1.Vertex(rootIndex, rootValue);
        this.adj = new Map();
        this.adj.set(rootIndex, []);
        this.vertices = [];
    }
    copyFrom(obj) {
        this.root = obj['root'];
        this.adj = obj['adj'];
        this.vertices = obj['vertices'];
        return this;
    }
    /**
     * Add a vertex to the Graph. It is not connected at this point
     *
     * @param {Vertex<I, T>} vertex
     * @memberof Graph
     */
    addVertex(vertex) {
        this.adj.set(vertex.index, []);
        this.vertices.push(vertex);
    }
    /**
     * "append" a graph into another
     *
     * @param {Graph<I, T>} graph
     * @param {I} toIndex
     * @memberof Graph
     */
    concatGraph(graph, toIndex) {
        this.vertices = this.vertices.concat(graph.vertices);
        this.adj = new Map([...this.adj, ...graph.adj]);
        this.connect(toIndex, graph.root.index);
    }
    /**
     * Connects 2 vertices
     *
     * @param {I} fromIndex
     * @param {I} toIndex
     * @memberof Graph
     */
    connect(fromIndex, toIndex) {
        this.adj.get(fromIndex).push(toIndex);
    }
    /**
     * Perform depth-first search on graph. Returns array of indexes
     *
     * @return {*}  {Promise<Array<I>>}
     * @memberof Graph
     */
    async depthFirstSearch() {
        const visitedVertices = [];
        let verticesToProcess = [this.root.index];
        while (verticesToProcess.length > 0) {
            let vertex = verticesToProcess.shift();
            if (!(visitedVertices.indexOf(vertex) > -1)) {
                visitedVertices.push(vertex);
                if (!this.adj.has(vertex)) {
                    continue;
                }
                verticesToProcess = this.adj.get(vertex).concat(verticesToProcess);
            }
        }
        return visitedVertices;
    }
}
exports.Graph = Graph;
//# sourceMappingURL=Graph.js.map