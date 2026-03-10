// Test STEP export with the new opencascade.full build
const fs = require('fs');
const path = require('path');

async function testSTEPExport() {
  console.log('Loading OpenCascade.js (full build with STEP fix)...');

  // Load the new build
  const ocPath = path.join(__dirname, 'public/opencascade/opencascade.full.js');
  const wasmPath = path.join(__dirname, 'public/opencascade/opencascade.full.wasm');

  console.log('JS file exists:', fs.existsSync(ocPath));
  console.log('WASM file exists:', fs.existsSync(wasmPath));

  // Load the module
  const initOpenCascade = require(ocPath);

  console.log('Initializing OpenCascade...');
  const oc = await initOpenCascade({
    locateFile: (file) => {
      if (file.endsWith('.wasm')) {
        return wasmPath;
      }
      return file;
    }
  });

  console.log('OpenCascade loaded successfully!');
  console.log('OpenCascade version info:', oc.OSD_OSD ? 'OSD available' : 'OSD not available');

  // Create a simple box to test with
  console.log('\nCreating a test box...');
  const box = new oc.BRepPrimAPI_MakeBox_2(10, 20, 30);
  const shape = box.Shape();
  console.log('Box created, shape type:', shape.ShapeType().value);

  // Test STEP export
  console.log('\nTesting STEP export...');
  try {
    const writer = new oc.STEPControl_Writer_1();
    console.log('STEPControl_Writer created');

    // Transfer the shape
    console.log('Transferring shape...');
    const progressRange = new oc.Message_ProgressRange_1();
    const status = writer.Transfer(shape, oc.STEPControl_StepModelType.STEPControl_AsIs, true, progressRange);
    console.log('Transfer status:', status.value);

    // Write to virtual filesystem
    console.log('Writing STEP file...');
    const writeStatus = writer.Write('/tmp/test.step');
    console.log('Write status:', writeStatus.value);

    // Read the file from virtual filesystem
    console.log('Reading STEP content from virtual FS...');
    const stepContent = oc.FS.readFile('/tmp/test.step', { encoding: 'utf8' });
    console.log('STEP file length:', stepContent.length, 'bytes');
    console.log('\nFirst 500 characters of STEP file:');
    console.log(stepContent.substring(0, 500));

    // Save to real filesystem for inspection
    fs.writeFileSync('test-output.step', stepContent);
    console.log('\n✅ SUCCESS! STEP file saved to test-output.step');

  } catch (error) {
    console.error('\n❌ ERROR during STEP export:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);

    // Check if it's the getWasmTableEntry error
    if (error.message && error.message.includes('getWasmTableEntry')) {
      console.log('\n⚠️  The getWasmTableEntry error still occurs!');
      console.log('This means we need a full rebuild without LTO from scratch.');
    }
  }

  // Cleanup
  box.delete();
  shape.delete();
}

testSTEPExport().catch(console.error);
