// Fallback type definition to allow R3F elements when strict types fail
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      ambientLight: any;
      pointLight: any;
      mesh: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      torusGeometry: any;
      primitive: any;
      // Allow any other three.js elements
      [elemName: string]: any;
    }
  }
}
