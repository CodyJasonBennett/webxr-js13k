import { Vector3 } from 'three';
import notes from 'data/notes';

const tempVector = new Vector3();

/**
 * Gets a point on a 3D spline at `t` via de Casteljau.
 */
export const getSplineAt = (points, t) => {
  if (t === 1) return points[points.length - 1];
  if (t === 0 || points.length === 1) return points[0];

  const calculatedPoints = [];

  for (let i = 1; i < points.length; i++) {
    const point1 = points[i - 1];
    const point2 = points[i];

    const offset = tempVector.subVectors(point2, point1).multiplyScalar(t);
    const target = point1.add(offset);

    calculatedPoints.push(target);
  }

  return getSplineAt(calculatedPoints, t);
};

/**
 * Converts arrays of points to a sequence of lines.
 */
export const toLines = points =>
  Object.values(
    points.reduce((output, point) => {
      const [x, y] = point;
      const key = `x${x}-y${y}`;

      if (output[key]) {
        output[key].push(point);
      } else {
        output[key] = [point];
      }

      return output;
    }, {})
  ).map(points => {
    const [x, y, z] = points[0];
    const colors = points.map(point => point.pop());

    return [x, y, z, ...colors];
  });

/**
 * Encodes track data.
 */
export const encodeTrack = track =>
  encode(
    track.map(([note, offset, beats]) => [
      Object.keys(notes).indexOf(note),
      offset,
      beats,
    ])
  );

/**
 * Encodes generic data.
 */
export const encode = object =>
  object
    .map(children =>
      btoa(String.fromCharCode.apply(!1, new Uint8Array(children))).replace(/=*$/, '')
    )
    .join(' ');

/**
 * Decodes generic data.
 */
export const decode = base64 =>
  base64.split(' ').map(children => Array.from(atob(children)).map(c => c.charCodeAt()));
