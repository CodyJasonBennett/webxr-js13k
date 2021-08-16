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

export const toBase64 = lines =>
  lines
    .map(points =>
      btoa(String.fromCharCode.apply(!1, new Uint8Array(points))).replace(/=*$/, '')
    )
    .join(' ');

export const toPoints = base64 =>
  base64.split(' ').map(line => Array.from(atob(line)).map(v => v.charCodeAt()));
