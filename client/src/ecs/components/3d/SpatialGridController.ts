import { Vector3 } from "three";
import { Topics } from "../../common";
import { Component } from "../../Component";
import { SpatialHash_Fast } from "../../SpatialHashGrid";

export class SpatialGridController extends Component {
  private _client: any;
  private _grid: SpatialHash_Fast;
  constructor(params: { grid: SpatialHash_Fast }) {
    super();
    this._grid = params.grid;
  }

  onAddComponent(): void {
    const position = [this.entity?.position.x, this.entity?.position.z];
    this._client = this._grid.NewClient(position, [1, 1]);
    this._client.entity = this.entity;
    this.registerHandler(Topics.updatePosition, (value: Vector3) => {
      this._onPosition(value);
    });
  }

  private _onPosition(value: Vector3) {
    this._client.position = [value.x, value.z];
    this._grid.UpdateClient(this._client);
  }

  findNearbyEntities(range: number) {
    const results = this._grid.FindNear(
      [this.entity?.position.x, this.entity?.position.z],
      [range, range]
    );

    return results.filter((client: any) => client.entity !== this.entity);
  }
}
