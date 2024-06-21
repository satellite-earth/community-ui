import { PropsWithChildren } from 'react';

import { SigningProvider } from './signing-provider';
import PublishProvider from './publish-provider';
import DecryptionProvider from './decryption-provider';

export function GlobalProviders({ children }: PropsWithChildren) {
	return (
		<SigningProvider>
			<DecryptionProvider>
				<PublishProvider>{children}</PublishProvider>
			</DecryptionProvider>
		</SigningProvider>
	);
}
