import { useEffect, useRef } from 'react';
import { Box, BoxProps, Text } from '@chakra-ui/react';

import { controlApi } from '../../services/personal-node';
import useSubject from '../../hooks/use-subject';

export default function StatusLog({ ...props }: Omit<BoxProps, 'children'>) {
	const logs = useSubject(controlApi?.logs) ?? [];
	const scrollBox = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = scrollBox.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();

		if (el.scrollTop > el.scrollHeight - rect.height - rect.height / 6) el.scrollTo({ top: el.scrollHeight });
	}, [logs]);

	useEffect(() => {
		scrollBox.current?.scrollTo({ top: scrollBox.current.scrollHeight });
	}, []);

	return (
		<Box overflow="auto" pb="5em" ref={scrollBox} {...props}>
			{logs.map((log, i) => (
				<Text isTruncated flexShrink={0}>
					{log}
				</Text>
			))}
		</Box>
	);
}
