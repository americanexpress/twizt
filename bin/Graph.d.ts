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
import { Vertex } from './Vertex';
/**
 * Class encapsulating graph functionality
 *
 * @export
 * @class Graph
 * @template I
 * @template T
 */
export declare class Graph<I, T> {
    root: Vertex<I, T>;
    adj: Map<I, Array<I>>;
    vertices: Array<Vertex<I, T>>;
    /**
     * Creates an instance of Graph.
     * @param {I} rootIndex
     * @param {T} rootValue
     * @memberof Graph
     */
    constructor(rootIndex?: I, rootValue?: T);
    copyFrom(obj: any): Graph<I, T>;
    /**
     * Add a vertex to the Graph. It is not connected at this point
     *
     * @param {Vertex<I, T>} vertex
     * @memberof Graph
     */
    addVertex(vertex: Vertex<I, T>): void;
    /**
     * "append" a graph into another
     *
     * @param {Graph<I, T>} graph
     * @param {I} toIndex
     * @memberof Graph
     */
    concatGraph(graph: Graph<I, T>, toIndex: I): void;
    /**
     * Connects 2 vertices
     *
     * @param {I} fromIndex
     * @param {I} toIndex
     * @memberof Graph
     */
    connect(fromIndex: I, toIndex: I): void;
    /**
     * Perform depth-first search on graph. Returns array of indexes
     *
     * @return {*}  {Promise<Array<I>>}
     * @memberof Graph
     */
    depthFirstSearch(): Promise<Array<I>>;
}
