import notes from '../data/notes';

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

export const encodeTrack = track =>
  encode(
    track.map(([note, offset, beats]) => [
      Object.keys(notes).indexOf(note),
      offset,
      beats,
    ])
  );

export const encode = object =>
  object
    .map(children =>
      btoa(String.fromCharCode.apply(!1, new Uint8Array(children))).replace(/=*$/, '')
    )
    .join(' ');

export const decode = base64 =>
  base64.split(' ').map(children => Array.from(atob(children)).map(c => c.charCodeAt()));
