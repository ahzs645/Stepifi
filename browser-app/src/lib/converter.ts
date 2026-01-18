/**
 * STL to STEP converter using OpenCascade.js
 *
 * This is a browser-based port of the Python/FreeCAD conversion logic.
 *
 * Python (FreeCAD) → JavaScript (OpenCascade.js) mapping:
 * - Mesh.read() → StlAPI_Reader
 * - Part.makeSolid() → BRepBuilderAPI_MakeSolid
 * - shape.removeSplitter() → ShapeUpgrade_UnifySameDomain
 * - Import.export() → STEPControl_Writer
 */

import {
  initOpenCascade,
  type openCascadeInstance as OpenCascadeInstance,
} from 'opencascade.js';

let ocInstance: OpenCascadeInstance | null = null;

async function getOpenCascade(): Promise<OpenCascadeInstance> {
  if (ocInstance) return ocInstance;

  ocInstance = await initOpenCascade();
  return ocInstance;
}

export async function convertStlToStep(
  stlData: ArrayBuffer,
  onProgress?: (message: string) => void
): Promise<Uint8Array> {
  const log = (msg: string) => {
    console.log(`[Converter] ${msg}`);
    onProgress?.(msg);
  };

  log('Initializing OpenCascade...');
  const oc = await getOpenCascade();

  log('Writing STL to virtual filesystem...');
  const stlArray = new Uint8Array(stlData);
  oc.FS.writeFile('/input.stl', stlArray);

  log('Reading STL file...');
  const reader = new oc.StlAPI_Reader();
  const shape = new oc.TopoDS_Shape();

  const success = reader.Read(shape, '/input.stl');
  if (!success) {
    throw new Error('Failed to read STL file');
  }

  log('Processing mesh geometry...');

  // The STL reader creates a compound of faces (one per triangle)
  // We need to sew them together and create a solid

  log('Sewing faces together...');
  const sewing = new oc.BRepBuilderAPI_Sewing(0.01, true, true, true, false);
  sewing.Add(shape);
  sewing.Perform(new oc.Message_ProgressRange_1());

  const sewedShape = sewing.SewedShape();

  log('Creating solid from shell...');
  let solidShape: InstanceType<OpenCascadeInstance['TopoDS_Shape']>;

  try {
    // Try to create a solid from the sewed shape
    const shellExplorer = new oc.TopExp_Explorer_2(
      sewedShape,
      oc.TopAbs_ShapeEnum.TopAbs_SHELL,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    );

    if (shellExplorer.More()) {
      const shell = oc.TopoDS.Shell_1(shellExplorer.Current());
      const solidMaker = new oc.BRepBuilderAPI_MakeSolid_2(shell);

      if (solidMaker.IsDone()) {
        solidShape = solidMaker.Solid();
        log('Successfully created solid');
      } else {
        log('Could not create solid, using shell');
        solidShape = sewedShape;
      }
    } else {
      log('No shell found, using sewed shape directly');
      solidShape = sewedShape;
    }
  } catch (e) {
    log('Solid creation failed, using sewed shape');
    solidShape = sewedShape;
  }

  log('Optimizing faces (merging coplanar)...');
  try {
    const unify = new oc.ShapeUpgrade_UnifySameDomain_2(solidShape, true, true, false);
    unify.Build();
    solidShape = unify.Shape();
    log('Face optimization complete');
  } catch (e) {
    log('Face optimization skipped (not critical)');
  }

  log('Writing STEP file...');
  const writer = new oc.STEPControl_Writer_1();

  // Transfer the shape to the writer
  const transferStatus = writer.Transfer(
    solidShape,
    oc.STEPControl_StepModelType.STEPControl_AsIs,
    true,
    new oc.Message_ProgressRange_1()
  );

  if (transferStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    throw new Error('Failed to transfer shape to STEP writer');
  }

  // Write to virtual filesystem
  const writeStatus = writer.Write('/output.step');
  if (writeStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    throw new Error('Failed to write STEP file');
  }

  log('Reading output file...');
  const stepData = oc.FS.readFile('/output.step');

  // Cleanup virtual filesystem
  oc.FS.unlink('/input.stl');
  oc.FS.unlink('/output.step');

  log('Conversion complete!');
  return stepData;
}

/**
 * Get information about an STL file without converting
 */
export async function analyzeStl(stlData: ArrayBuffer): Promise<{
  triangles: number;
  vertices: number;
  boundingBox: { min: [number, number, number]; max: [number, number, number] };
}> {
  const oc = await getOpenCascade();

  const stlArray = new Uint8Array(stlData);
  oc.FS.writeFile('/analyze.stl', stlArray);

  const reader = new oc.StlAPI_Reader();
  const shape = new oc.TopoDS_Shape();
  reader.Read(shape, '/analyze.stl');

  // Get bounding box
  const bbox = new oc.Bnd_Box_1();
  const brepBndLib = new oc.BRepBndLib();
  brepBndLib.Add(shape, bbox, false);

  const xMin = { current: 0 };
  const yMin = { current: 0 };
  const zMin = { current: 0 };
  const xMax = { current: 0 };
  const yMax = { current: 0 };
  const zMax = { current: 0 };

  bbox.Get(xMin, yMin, zMin, xMax, yMax, zMax);

  // Count faces (triangles)
  let triangleCount = 0;
  const faceExplorer = new oc.TopExp_Explorer_2(
    shape,
    oc.TopAbs_ShapeEnum.TopAbs_FACE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  );

  while (faceExplorer.More()) {
    triangleCount++;
    faceExplorer.Next();
  }

  oc.FS.unlink('/analyze.stl');

  return {
    triangles: triangleCount,
    vertices: triangleCount * 3, // Approximation
    boundingBox: {
      min: [xMin.current, yMin.current, zMin.current],
      max: [xMax.current, yMax.current, zMax.current],
    },
  };
}
