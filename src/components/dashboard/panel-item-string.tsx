import { PropsWithChildren, useState } from 'react';
import { Code, Flex, Text } from '@chakra-ui/react';

import QrCodeSvg from '../qr-code/qr-code-svg';
import CopyButton from '../copy-button';
import TextButton from './text-button';

export default function PanelItemString({
	children,
	label,
	value,
	qr,
	onConfigClicked,
}: PropsWithChildren<{
	onConfigClicked?: () => void;
	label: string;
	value: string;
	qr?: boolean;
}>) {
	const [showQR, setShowQR] = useState(false);

	return (
		<div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Flex gap="2" w="full" alignItems="center">
					<Text>{label}</Text>
					<Code
						style={{
							width: '100%',
							color: '#FFF',
							background: 'transparent',
							border: 'none',
							outline: 'none',
							fontFamily: 'monospace',
						}}
						userSelect="all"
					>
						{value}
					</Code>
					<CopyButton variant="link" value={value} fontFamily="monospace" />
					{qr && (
						<TextButton variant="link" onClick={() => setShowQR((v) => !v)}>
							[qr]
						</TextButton>
					)}
				</Flex>
				{onConfigClicked ? <div onClick={onConfigClicked}>[config]</div> : null}
			</div>
			{/* @ts-expect-error */}
			{showQR && <QrCodeSvg content={value} style={{ maxWidth: '3in', marginTop: '1em' }} />}
			{children}
		</div>
	);
}
