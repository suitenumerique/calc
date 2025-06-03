import { css } from 'styled-components';

import { Box, Text, TextErrors } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { DocHeader, DocVersionHeader } from '@/docs/doc-header/';
import {
  Doc,
} from '@/docs/doc-management';
import { TableContent } from '@/docs/doc-table-content/';
import { Versions, useDocVersion } from '@/docs/doc-versioning/';
import { useResponsiveStore } from '@/stores';

interface DocEditorProps {
  doc: Doc;
  versionId?: Versions['version_id'];
}

import dynamic from 'next/dynamic';
const IronCalcEditor = dynamic(() => import('./IronCalcEditor'), { 
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const DocEditor = ({ doc, versionId }: DocEditorProps) => {
  const { isDesktop } = useResponsiveStore();
  const isVersion = !!versionId && typeof versionId === 'string';

  const { colorsTokens } = useCunninghamTheme();

  setTimeout(() => {
    // Remove the IronCalc link from the editor
    document
      .querySelectorAll('a[href="https://www.ironcalc.com"]')
      .forEach((s) => s.remove());
  }, 500);

  return (
    <>
      <Box
        $width="100%"
        $height="100%"
        className="--docs--doc-editor"
      >
        <Box
          $padding={{ horizontal: isDesktop ? '54px' : 'base' }}
          className="--docs--doc-editor-header"
        >
          {isVersion ? (
            <DocVersionHeader title={doc.title} />
          ) : (
            <DocHeader doc={doc} />
          )}
        </Box>

        <Box
          $background={colorsTokens['primary-bg']}
          $direction="row"
          $width="100%"
          $css="overflow-x: clip; flex: 1;"
          $position="relative"
          className="--docs--doc-editor-content"
        >
          <Box $css="flex:1;" $position="relative" $width="100%">
              <IronCalcEditor doc={doc} />
            {/* )} */}
          </Box>
        </Box>
      </Box>
    </>
  );
};
