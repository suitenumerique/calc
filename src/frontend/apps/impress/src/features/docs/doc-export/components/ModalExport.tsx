import {
  Button,
  Loader,
  Modal,
  ModalSize,
  Select,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { Box, Text } from '@/components';
import { useEditorStore } from '@/docs/doc-editor';
import { Doc, useTrans } from '@/docs/doc-management';

// import { downloadFile } from '../utils';

import { downloadDoc } from '@/features/docs/doc-management/api/useDownloadDoc';

enum DocDownloadFormat {
  XLSX = 'xlsx',
  ICAL = 'ical',
}

interface ModalExportProps {
  onClose: () => void;
  doc: Doc;
}

export const ModalExport = ({ onClose, doc }: ModalExportProps) => {
  const { t } = useTranslation();
  const { toast } = useToastProvider();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<DocDownloadFormat>(
    DocDownloadFormat.XLSX,
  );

  async function onSubmit() {
    setIsExporting(true);
    const download = await downloadDoc({ id: doc.id });
    toast(
      t('Your {{format}} was downloaded succesfully', {
        format,
      }),
      VariantType.SUCCESS,
    );

    setIsExporting(false);

    const blob = await download.blob(); // responseType: "blob" in axios
    const url = URL.createObjectURL(blob); // convert to an object URL

    // Create a hidden <a> to trigger the “Save as…” dialog
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up the object URL to free memory
    URL.revokeObjectURL(url);

    onClose();
  }

  return (
    <Modal
      data-testid="modal-export"
      isOpen
      closeOnClickOutside
      onClose={() => onClose()}
      rightActions={
        <>
          <Button
            aria-label={t('Close the modal')}
            color="secondary"
            fullWidth
            onClick={() => onClose()}
            disabled={isExporting}
          >
            {t('Cancel')}
          </Button>
          <Button
            aria-label={t('Download')}
            color="primary"
            fullWidth
            onClick={() => void onSubmit()}
            disabled={isExporting}
          >
            {t('Download')}
          </Button>
        </>
      }
      size={ModalSize.MEDIUM}
      title={
        <Text $size="h6" $variation="1000" $align="flex-start">
          {t('Download')}
        </Text>
      }
    >
      <Box
        $margin={{ bottom: 'xl' }}
        aria-label={t('Content modal to export the document')}
        $gap="1rem"
        className="--docs--modal-export-content"
      >
        <Text $variation="600" $size="sm">
          {t('Download your document in a .xlsx format.')}
        </Text>

        <Select
          clearable={false}
          fullWidth
          label={t('Format')}
          options={[{ label: t('Xlsx'), value: DocDownloadFormat.XLSX }]}
          value={format}
          onChange={(options) =>
            setFormat(options.target.value as DocDownloadFormat)
          }
        />

        {isExporting && (
          <Box
            $align="center"
            $margin={{ top: 'big' }}
            $css={css`
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -100%);
            `}
          >
            <Loader />
          </Box>
        )}
      </Box>
    </Modal>
  );
};
