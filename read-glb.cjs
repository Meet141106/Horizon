const fs = require('fs');

const buffer = fs.readFileSync('public/animated_drone_with_camera_free.glb');
// The glTF JSON chunk is the second chunk (after the 12-byte header).
// Header: magic (4), version (4), length (4)
// Chunk 0: chunkLength (4), chunkType (4), chunkData (chunkLength)
const chunk0Len = buffer.readUInt32LE(12);
const chunk0Type = buffer.toString('utf8', 16, 20);

if (chunk0Type === 'JSON') {
  const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Len);
  const gltf = JSON.parse(jsonStr);
  const nodes = gltf.nodes || [];
  const nodeNames = nodes.map(n => n.name).filter(Boolean);
  console.log(nodeNames);
} else {
  console.log('Not a standard GLB');
}
