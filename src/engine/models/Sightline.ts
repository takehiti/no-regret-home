import { Point3D } from './Point3D';

/**
 * 視線ライン（観測者から目標への視線）
 */
export interface Sightline {
  /** 視線の起点 */
  from: Point3D;

  /** 視線の終点 */
  to: Point3D;

  /** 遮られたか */
  obstructed: boolean;

  /** 遮蔽点（遮られた場合） */
  obstructionPoint?: Point3D;

  /** 遮蔽物名 */
  obstructedBy?: string;

  /** 遮蔽点までの距離（メートル） */
  distanceToObstruction?: number;
}

/**
 * Sightlineを生成するヘルパー関数
 */
export function createSightline(
  from: Point3D,
  to: Point3D,
  obstructed: boolean = false,
  obstructionPoint?: Point3D,
  obstructedBy?: string
): Sightline {
  let distanceToObstruction: number | undefined;

  if (obstructed && obstructionPoint) {
    const dx = obstructionPoint.x - from.x;
    const dy = obstructionPoint.y - from.y;
    const dz = obstructionPoint.z - from.z;
    distanceToObstruction = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  return {
    from,
    to,
    obstructed,
    obstructionPoint,
    obstructedBy,
    distanceToObstruction,
  };
}
