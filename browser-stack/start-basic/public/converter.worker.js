/**
 * Web Worker for OpenCascade.js v2 STL to STEP conversion
 * Uses fetch + eval to handle ES module exports
 */

let ocInstance = null

async function initOpenCascade() {
  self.postMessage({ type: 'progress', message: 'Fetching OpenCascade.js...' })

  const response = await fetch('/opencascade/opencascade.full.js')
  let scriptText = await response.text()

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  self.postMessage({ type: 'progress', message: 'Parsing OpenCascade.js...' })

  // Evaluate the script - it defines Module as an IIFE that returns a factory function
  eval(scriptText)

  self.postMessage({ type: 'progress', message: 'Initializing WASM (~50MB)...' })

  // Module is a factory function, call it with options
  return await Module({
    locateFile: (file) => `/opencascade/${file}`
  })
}

self.onmessage = async function(e) {
  const { type, data } = e.data

  if (type === 'convert') {
    try {
      if (!ocInstance) {
        ocInstance = await initOpenCascade()
      }
      const oc = ocInstance

      self.postMessage({ type: 'progress', message: 'Writing STL to filesystem...' })
      const stlArray = new Uint8Array(data.stlData)
      oc.FS.writeFile('/input.stl', stlArray)

      self.postMessage({ type: 'progress', message: 'Reading STL file...' })

      // Use StlAPI_Reader to read STL directly into a shape
      const reader = new oc.StlAPI_Reader()
      let shape = new oc.TopoDS_Shape()

      // Log available methods on reader for debugging
      const readerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(reader))
        .filter(m => m.includes('Read'))
      console.log('StlAPI_Reader methods:', readerMethods)

      // Try different Read overloads
      let success = false
      try {
        if (reader.Read_1) {
          console.log('Trying Read_1...')
          success = reader.Read_1(shape, '/input.stl')
        } else if (reader.Read_2) {
          console.log('Trying Read_2...')
          success = reader.Read_2(shape, '/input.stl')
        } else if (reader.Read) {
          console.log('Trying Read...')
          success = reader.Read(shape, '/input.stl')
        } else {
          throw new Error('No Read method found. Available: ' + readerMethods.join(', '))
        }
      } catch (readErr) {
        console.error('StlAPI_Reader.Read error:', readErr)
        throw new Error('StlAPI_Reader.Read failed: ' + readErr.message)
      }
      if (!success) {
        throw new Error('Failed to read STL file')
      }

      self.postMessage({ type: 'progress', message: 'Processing shape...' })

      self.postMessage({ type: 'progress', message: 'Sewing faces...' })
      try {
        const sewing = new oc.BRepBuilderAPI_Sewing(0.1, true, true, true, false)
        sewing.Add(shape)
        sewing.Perform(new oc.Message_ProgressRange_1())
        shape = sewing.SewedShape()
      } catch (e) {
        // Continue with compound
      }

      self.postMessage({ type: 'progress', message: 'Creating solid...' })
      let solidShape = shape

      try {
        const shellExplorer = new oc.TopExp_Explorer_2(
          shape,
          oc.TopAbs_ShapeEnum.TopAbs_SHELL,
          oc.TopAbs_ShapeEnum.TopAbs_SHAPE
        )

        if (shellExplorer.More()) {
          const shell = oc.TopoDS.Shell_1(shellExplorer.Current())
          const solidMaker = new oc.BRepBuilderAPI_MakeSolid_2(shell)

          if (solidMaker.IsDone()) {
            solidShape = solidMaker.Solid()
            self.postMessage({ type: 'progress', message: 'Solid created' })
          }
        }
      } catch (e) {
        // Continue with current shape
      }

      self.postMessage({ type: 'progress', message: 'Writing STEP file...' })
      const writer = new oc.STEPControl_Writer_1()

      writer.Transfer(
        solidShape,
        oc.STEPControl_StepModelType.STEPControl_AsIs,
        true,
        new oc.Message_ProgressRange_1()
      )

      const writeStatus = writer.Write('/output.step')
      if (writeStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
        throw new Error('Failed to write STEP file')
      }

      self.postMessage({ type: 'progress', message: 'Reading output...' })
      const stepData = oc.FS.readFile('/output.step')

      oc.FS.unlink('/input.stl')
      oc.FS.unlink('/output.step')

      self.postMessage({ type: 'complete', data: stepData })
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}
