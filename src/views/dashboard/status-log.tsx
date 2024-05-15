import { controlApi } from '../../services/private-node';
import { Box, FlexProps } from '@chakra-ui/react';

import useSubject from '../../hooks/use-subject';
import Panel from '../../components/dashboard/panel';
import { useEffect, useRef } from 'react';

export default function StatusLog({ ...props }: Omit<FlexProps, 'children'>) {
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
		<Panel label="STATUS LOGS" fontFamily="monospace" overflow="hidden" {...props}>
			<Box overflow="auto" pb="5em" ref={scrollBox}>
				{logs.map((log, i) => (
					<div
						key={log + i}
						style={{
							flexShrink: 0,
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							textOverflow: 'ellipsis',
						}}
					>
						{log}
					</div>
				))}
			</Box>
		</Panel>
	);
}
