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

import { Status, Vertex } from './Vertex';

/**
 * Class encapsulating graph functionality
 *
 * @export
 * @class Graph
 * @template I
 * @template T
 */
export class Graph<T> {
  adj: Array<number[]>;
  vertices: Array<Vertex<T>>;

  /**
   * Creates an instance of Graph.
   * @memberof Graph
   */
  constructor() {
    this.adj = [];
    this.vertices = [];
  }

  copyFrom(obj:any): Graph<T> {
    this.adj = obj['adj'];
    this.vertices = obj['vertices'];
    return this;
}

  /**
   * Add a vertex to the Graph. It is not connected at this point
   *
   * @param {Vertex<T>} vertex
   * @memberof Graph
   */
  addVertex(vertex: Vertex<T>) {
    this.adj.push([]);
    this.vertices.push(vertex);
  }

  /**
   * "append" a graph into another
   *
   * @param {Graph<T>} graph
   * @memberof Graph
   */
  concatGraph(graph: Graph<T>) {
    const curLength = this.vertices.length - 1;
    this.vertices = this.vertices.concat(graph.vertices);

    graph.adj.forEach(v => {
      for(let i = 0; i < v.length; i++) {
        v[i] += curLength;
      }
    });

    this.adj = this.adj.concat(graph.adj);
  }

  /**
   * Connects 2 vertices
   *
   * @param {I} fromIndex
   * @param {I} toIndex
   * @memberof Graph
   */
  connect(fromIndex: number, toIndex: number) {
    this.adj[fromIndex].push(toIndex);
  }

  /**
   * Perform depth-first search on graph. Returns array of indexes
   *
   * @return {*}  {Promise<Array<I>>}
   * @memberof Graph
   */
  async depthFirstSearch(): Promise<number[]> {
    const visitedVertices = [];
    let verticesToProcess = [0];

    while (verticesToProcess.length > 0) {
      let index = verticesToProcess.shift();

      if (!(visitedVertices.indexOf(index) > -1)) {
        visitedVertices.push(index);
        if(!this.adj[index]) {
          continue;
        }
        verticesToProcess = this.adj[index].concat(verticesToProcess);
      }
    }

    return visitedVertices;
  }

  async resetVertices() {
    this.vertices.forEach((vertex) => {
      vertex.status = Status.NEW;
    }); 
  }

  // async dfsVisit(vertex: Vertex<I, T>, time: number) {
  //   time++;
  //   vertex.status = Status.VISITED;
  //   this.adj.get(vertex.index).forEach(v => {
  //     // if(v.status === Status.NEW)
  //   });
  // }

  // async DFS() {
  //   let time = 0;
  //   await this.resetVertices();
  // }
}

