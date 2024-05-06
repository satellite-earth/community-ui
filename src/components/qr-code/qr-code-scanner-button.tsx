import { IconButton, useDisclosure } from '@chakra-ui/react';
import { type QrScannerModalProps } from './qr-scanner-modal';
import { Suspense, lazy } from 'react';
import QrCode02 from '../icons/components/qr-code-02';

const QrScannerModal = lazy(() => import('./qr-scanner-modal'));

export default function QRCodeScannerButton({ onData }: { onData: QrScannerModalProps['onData'] }) {
	const modal = useDisclosure();

	return (
		<>
			<IconButton onClick={modal.onOpen} icon={<QrCode02 boxSize={6} />} aria-label="Qr Scanner" />
			{modal.isOpen && (
				<Suspense fallback={null}>
					<QrScannerModal isOpen={modal.isOpen} onClose={modal.onClose} onData={onData} />
				</Suspense>
			)}
		</>
	);
}
