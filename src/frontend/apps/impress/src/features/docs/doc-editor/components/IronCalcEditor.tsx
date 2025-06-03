'use client';

import { IronCalc, Model, init } from '@ironcalc/workbook';
import { useEffect, useState } from 'react';

import { useAuthQuery } from '@/features/auth/api';
import { Doc } from '@/features/docs/doc-management';
import { useDoc } from '@/features/docs/doc-management/api/useDoc';
import { listActiveUsers } from '@/features/docs/doc-management/api/useListActiveUsers';
import { updateActiveUser } from '@/features/docs/doc-management/api/useUpdateActiveUser';
import { updateDoc } from '@/features/docs/doc-management/api/useUpdateDoc';

const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  const binString = Array.from(uint8Array, (byte) =>
    String.fromCodePoint(byte),
  ).join('');
  return btoa(binString);
};

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
  const [selectedCell, setSelectedCell] = useState<Int32Array[3]>(
    new Int32Array([0, 1, 1]),
  );
  const [activeUser, setActiveUsers] = useState<
    Record<
      string,
      {
        id: string;
        user_email: string;
        sheet_index: number;
        row_index: number;
        column_index: number;
      }
    >
  >({});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents

  // Periodically fetch the latest doc
  const { data: fetchedDoc } = useDoc(
    {
      id: doc.id,
      revision: doc.revision,
    },
    { refetchInterval: 1000 },
  );

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
  const { data: currentUser, isSuccess: userInitialized } = useAuthQuery();
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
      if (!userInitialized) {
        return;
      }

      const currentCell = model.getSelectedCell();
      for (const cellIndex in currentCell) {
        console.log(currentCell[cellIndex], selectedCell[cellIndex]);
        if (currentCell[cellIndex] !== selectedCell[cellIndex]) {
          console.log(`Cell changed from ${selectedCell} to ${currentCell}`);
          setSelectedCell(currentCell);
          updateActiveUser({
            id: doc.id,
            user_email: currentUser?.email,
            sheet_index: currentCell[0],
            row_index: currentCell[1],
            column_index: currentCell[2],
          }).catch((error) => {
            console.error('Failed to update active user:', error);
          });
          break;
        }
      }

      void listActiveUsers({ id: doc.id }).then((users) => {
        console.log(users['impress@impress.world']);
        const updateModelObject = Object.values(users)
          .filter((user) => user.user_email !== currentUser?.email)
          .map((user) => ({
            id: user.user_email,
            sheet: user.sheet_index,
            row: user.row_index,
            column: user.column_index,
          }));

        console.log(updateModelObject);
        model.setUsers(updateModelObject || []);
      });

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
  }, [currentUser?.email, doc, model, selectedCell, userInitialized]);

  return model ? (
    <div className="ironcalc-workbook" style={{ height: '100%' }}>
      <IronCalc model={model} />
    </div>
  ) : (
    <div>Loading...</div>
  );
}
