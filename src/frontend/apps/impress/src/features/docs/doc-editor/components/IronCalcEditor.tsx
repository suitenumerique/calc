'use client';

import { IronCalc, Model, init} from '@ironcalc/workbook';
import { useEffect, useState } from 'react';

import { Doc } from '@/features/docs/doc-management';
import { updateDoc } from '@/features/docs/doc-management/api/useUpdateDoc';
import { updateActiveUser } from '@/features/docs/doc-management/api/useUpdateActiveUser';
import { listActiveUsers } from '@/features/docs/doc-management/api/useListActiveUsers';
import { useAuthQuery } from '@/features/auth/api';

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
  doc /*storeId, provider*/,
}: IronCalcEditorProps) {
  const [model, setModel] = useState<Model | null>(null);
  const [selectedCell, setSelectedCell] = useState<Int32Array[3]>(new Int32Array([0, 1, 1]));
  const [activeUser, setActiveUsers] = useState<Record<string, {id: string, user_email: string, sheet_index: number, row_index: number, column_index: number}>>({});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents


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
          updateActiveUser({id: doc.id, user_email: currentUser?.email, sheet_index: currentCell[0], row_index: currentCell[1], column_index: currentCell[2]}).catch((error) => {
            console.error('Failed to update active user:', error);
          });
          break;
        }
      }
      
      listActiveUsers({id: doc.id}).then((users) => {
        setActiveUsers(users);
        console.log('Active users:', users);
      })

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
        const base64Content = uint8ArrayToBase64(model.toBytes());
        console.log(`New data : ${base64Content}`);
        doc.content = base64Content;
        console.log('Doc:', doc);
        if (doc.title && (doc.title !== model.getName())) {
          model.setName(doc.title);
        }
        // Call the save method with doc.id and the new content as base64
        updateDoc({
          id: doc.id,
          content: base64Content,
        }).catch((error) => {
          console.error('Failed to update doc:', error);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [doc, model, selectedCell, userInitialized, currentUser]);

  useEffect(() => {
      model?.setUsers(
        Object.values(activeUser).map((user) => ({
          id: user.user_email,
          sheet: user.sheet_index,
          row: user.row_index,
          column: user.column_index,
        })).filter(
          (user) => user.id !== currentUser.email
      ))
    }, [activeUser])


  return (model ?<div className="ironcalc-workbook" style={{ height: '100%' }}>
    <IronCalc model={model} />
  </div>:
    <div>Loading...</div>
  );


}

