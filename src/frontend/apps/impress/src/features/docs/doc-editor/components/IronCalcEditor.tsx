'use client';

import { IronCalc, Model, init } from '@ironcalc/workbook';
import { useEffect, useState } from 'react';

import { Doc } from '@/features/docs/doc-management';
import { updateDoc } from '@/features/docs/doc-management/api/useUpdateDoc';
import { useDoc } from '@/features/docs/doc-management/api/useDoc';

const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  const binString = Array.from(uint8Array, (byte) =>
    String.fromCodePoint(byte),
  ).join('');
  return btoa(binString);
}


interface IronCalcEditorProps {
  doc: Doc;
  //provider: HocuspocusProvider;
  //storeId: string;
}

export default function IronCalcEditor({
  doc: initialDoc,
}: IronCalcEditorProps) {
  const [doc, setDoc] = useState<Doc>(initialDoc);
  const [model, setModel] = useState<Model | null>(null);

  // Periodically fetch the latest doc
  const { data: fetchedDoc } = useDoc(
    {
      id: doc.id,
      revision: doc.revision,
    },
    { refetchInterval: 1000 },
  );

  // Update local doc state when fetchedDoc changes
  useEffect(() => {
    if (fetchedDoc && fetchedDoc.content !== doc.content) {
      setDoc(fetchedDoc);
    }
  }, [fetchedDoc, doc.content]);

  useEffect(() => {
    init().then(
      () => {
        // setWorkbookState(new WorkbookState());
        console.log('IronCalc initialized');
        console.log('Doc:', doc);
        // // TODO: Load existing content from server
        if (doc.content) {
          try {
            const bytes = new Uint8Array(
              atob(doc.content)
                .split('')
                .map((c) => c.charCodeAt(0)),
            );
            console.log('Loading existing content:', bytes);
            return setModel(Model.from_bytes(bytes));
          } catch (e) {
            console.error('Failed to load existing content:', e);
          }
        }
        const title = doc.title || 'Untitled Workbook';

        // If no content or failed to load, create new model
        setModel(new Model(title, 'en', 'UTC'));

      },
      () => {},
    );
  }, [doc, doc.content]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!model) {
        return;
      }

      // const myCell = model.getSelectedCell();
      // console.log(`Selected cell ${myCell}`);

      // TODO: Update the selected cell on the API with (clientId, ...[cell])

      // TODO: Get the list of users on the API
      // const users = [
      //   {
      //     "uid": "2b6e17f0-08be-4584-8c54-0be355acda00",
      //     "sheet": 0,
      //     "column": 1,
      //     "row": 1,
      //   },
      //   {
      //     "uid": "7e36148b-380f-4180-bb66-58d573a8473d",
      //     "sheet": 0,
      //     "column": 4,
      //     "row": 6,
      //   },
      // ]

      // TODO: Display the users on sheet
      // for (user in user) {
        // model.addPreview(user) // Not implemented yet
      // }

      // TODO: Ask the API for updates
      // const latestVersion = api.getLatestVersion()
      // if (latestVersion.id !== currentVersion) {

      // }

      const flushSendQueue = model.flushSendQueue();
      // console.log('Flush send queue:', flushSendQueue);
      if (!(flushSendQueue.length === 1 && flushSendQueue[0] === 0)) {
        const base64Content = uint8ArrayToBase64(flushSendQueue);
        updateDoc({
          id: doc.id,
          content: base64Content,
          revision: doc.revision,
        })
          .then((updatedDoc) => {
            doc.revision = updatedDoc.revision;
          })
          .catch((error) => {
            console.error('Failed to update doc:', error);
          });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [doc, model]);

  return (model ?<div className="ironcalc-workbook" style={{ height: '100%' }}>
    <IronCalc model={model} />
  </div>:
    <div>Loading...</div>
  );
}
