import { initStepParser, parseStep, isInitialized } from 'step-parser';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
  console.log('Testing step-parser...');
  console.log('isInitialized:', isInitialized());
  
  try {
    // Initialize without options - let it use the default URL resolution
    await initStepParser();
    console.log('WASM initialized successfully!');
    console.log('isInitialized:', isInitialized());
    
    // Test with a STEP file that has actual geometry (a simple box)
    const stepWithGeometry = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Open CASCADE Model'),'2;1');
FILE_NAME('cube.step','2024-01-01T00:00:00',('Author'),('Organization'),'Open CASCADE STEP processor 7.5','FreeCAD','Unknown');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
ENDSEC;
DATA;
#1 = APPLICATION_CONTEXT('core data for automotive mechanical design processes');
#2 = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#1);
#3 = PRODUCT_CONTEXT('',#1,'mechanical');
#4 = PRODUCT('Cube','Cube','',(#3));
#5 = PRODUCT_DEFINITION_FORMATION('','',#4);
#6 = PRODUCT_DEFINITION_CONTEXT('part definition',#1,'design');
#7 = PRODUCT_DEFINITION('design','',#5,#6);
#8 = PRODUCT_DEFINITION_SHAPE('','',#7);
#9 = CARTESIAN_POINT('',(0.,0.,0.));
#10 = DIRECTION('',(0.,0.,1.));
#11 = DIRECTION('',(1.,0.,0.));
#12 = AXIS2_PLACEMENT_3D('',#9,#10,#11);
#13 = SHAPE_DEFINITION_REPRESENTATION(#8,#14);
#14 = SHAPE_REPRESENTATION('',(#12),#15);
#15 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#19)) GLOBAL_UNIT_ASSIGNED_CONTEXT((#16,#17,#18)) REPRESENTATION_CONTEXT('Context #1','3D Context with UNIT and UNCERTAINTY') );
#16 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#17 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#18 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#19 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#16,'distance_accuracy_value','confusion accuracy');
ENDSEC;
END-ISO-10303-21;`;
    
    const bytes = new TextEncoder().encode(stepWithGeometry);
    console.log('Parsing STEP with basic structure...');
    const result = parseStep(bytes);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }
}

test();
