import { PropsWithChildren } from 'react';
import { SigningProvider } from './signing-provider';
import PublishProvider from './publish-provider';

export function GlobalProviders({ children }: PropsWithChildren) {
	return (
		<SigningProvider>
			<PublishProvider>{children}</PublishProvider>
		</SigningProvider>
	);
}
