/*
MIT License

Copyright (c) 2020 simondevyoutube

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const math = {
  sat: (x: number) => {
    return Math.min(Math.max(x, 0.0), 1.0);
  },
};

export class SpatialHash_Fast {
  private _cells: any;
  private _dimensions: any;
  private _bounds: any;
  private _queryIds: number;
  constructor(bounds: any, dimensions: any) {
    const [x, y] = dimensions;
    this._cells = [...Array(x)].map((_) => [...Array(y)].map((_) => null));
    this._dimensions = dimensions;
    this._bounds = bounds;
    this._queryIds = 0;
  }

  _GetCellIndex(position: any) {
    const x = math.sat(
      (position[0] - this._bounds[0][0]) /
        (this._bounds[1][0] - this._bounds[0][0])
    );
    const y = math.sat(
      (position[1] - this._bounds[0][1]) /
        (this._bounds[1][1] - this._bounds[0][1])
    );

    const xIndex = Math.floor(x * (this._dimensions[0] - 1));
    const yIndex = Math.floor(y * (this._dimensions[1] - 1));

    return [xIndex, yIndex];
  }

  NewClient(position: any, dimensions: any) {
    const client = {
      position: position,
      dimensions: dimensions,
      _cells: {
        min: null,
        max: null,
        nodes: null,
      },
      _queryId: -1,
    };

    this._Insert(client);

    return client;
  }

  UpdateClient(client: any) {
    const [x, y] = client.position;
    const [w, h] = client.dimensions;

    const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
    const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

    if (
      client._cells.min[0] == i1[0] &&
      client._cells.min[1] == i1[1] &&
      client._cells.max[0] == i2[0] &&
      client._cells.max[1] == i2[1]
    ) {
      return;
    }

    this.Remove(client);
    this._Insert(client);
  }

  FindNear(position: any, bounds: any) {
    const [x, y] = position;
    const [w, h] = bounds;

    const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
    const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

    const clients = [];
    const queryId = this._queryIds++;

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        let head = this._cells[x][y];

        while (head) {
          const v = head.client;
          head = head.next;

          if (v._queryId != queryId) {
            v._queryId = queryId;
            clients.push(v);
          }
        }
      }
    }
    return clients;
  }

  _Insert(client: any) {
    const [x, y] = client.position;
    const [w, h] = client.dimensions;

    const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
    const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

    const nodes: any[] = [];

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      nodes.push([]);

      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const xi = x - i1[0];

        const head = {
          next: null,
          prev: null,
          client: client,
        };

        nodes[xi].push(head);

        head.next = this._cells[x][y];
        if (this._cells[x][y]) {
          this._cells[x][y].prev = head;
        }

        this._cells[x][y] = head;
      }
    }

    client._cells.min = i1;
    client._cells.max = i2;
    client._cells.nodes = nodes;
  }

  Remove(client: any) {
    const i1 = client._cells.min;
    const i2 = client._cells.max;

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const xi = x - i1[0];
        const yi = y - i1[1];
        const node = client._cells.nodes[xi][yi];

        if (node.next) {
          node.next.prev = node.prev;
        }
        if (node.prev) {
          node.prev.next = node.next;
        }

        if (!node.prev) {
          this._cells[x][y] = node.next;
        }
      }
    }

    client._cells.min = null;
    client._cells.max = null;
    client._cells.nodes = null;
  }
}
