'use client';

import { IronCalc, Model, init } from '@ironcalc/workbook';
import { useEffect, useState } from 'react';

import { Doc } from '@/features/docs/doc-management';

// // import { base64ToBytes, bytesToBase64 } from "./ironcalc/AppComponents/util";
// const {init, Model, IronCalc, IronCalcIcon, IronCalcLogo} = dynamic(
//     () => import("@ironcalc/workbook"),
//     { ssr: false }
// );

interface IronCalcEditorProps {
  doc: Doc;
  //provider: HocuspocusProvider;
  //storeId: string;
}

export default function IronCalcEditor({
  doc /*storeId, provider*/,
}: IronCalcEditorProps) {
  const [model, setModel] = useState<Model | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents
  const [workbookData, setWorkbookData] = useState<Uint8Array>(
    new Uint8Array([0])
  )


  // const isVersion = doc.id !== storeId;
  // const readOnly = !doc.abilities.partial_update || isVersion;

  // Listen for model changes
  // useEffect(() => {
  // if (!model || readOnly) return;

  //     const interval = setInterval(() => {
  //         const queue = model.flushSendQueue();
  //         if (queue.length !== 1) {
  //             // Convert model to base64 string
  //             const modelContent = bytesToBase64(model.toBytes());

  //             // TODO: Save to server
  //             console.log("Doc modified. new base64: ", modelContent);
  //         }
  //     }, 1000);

  //     return () => clearInterval(interval);
  // }, [model, doc.id, readOnly]);

  useEffect(() => {
    init().then(
      () => {
        //setWorkbookState(new WorkbookState());

        // // TODO: Load existing content from server
        if (doc.content) {
          try {
            const bytes = base64ToBytes(doc.content);
            return setModel(Model.from_bytes(bytes));
          } catch (e) {
            console.error('Failed to load existing content:', e);
          }
        }

        // If no content or failed to load, create new model
        setModel(new Model('Workbook1', 'en', 'UTC'));

      },
      () => {},
    );
  }, [doc.content]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!model) {
        return;
      }
      const flushSendQueue = model.flushSendQueue();
      if (flushSendQueue.length === 1 && flushSendQueue[0] === 0) {
        return;
      }
      const binString = Array.from(flushSendQueue, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      console.log(`New data : ${btoa(binString)}`)
    }, 1000);

    return () => clearInterval(interval);
  }, [model]);

  return (model ?<div className="ironcalc-workbook" style={{ height: '100%' }}>
    <IronCalc model={model} />
  </div>:
    <div>Loading...</div>
  );
}
