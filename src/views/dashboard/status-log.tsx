import { controlApi } from '../../services/private-node';
import { FlexProps } from '@chakra-ui/react';

import useSubject from '../../hooks/use-subject';
import Panel from '../../components/dashboard/panel';

export default function StatusLog({ ...props }: Omit<FlexProps, 'children'>) {
	const logs = useSubject(controlApi?.logs) ?? [];

	return (
		<Panel label="STATUS LOGS" fontFamily="monospace" {...props}>
			{logs.map((log, i) => (
				<div
					key={log + i}
					style={{
						height: 21,
						fontSize: 13,
						overflow: 'hidden',
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{log}
				</div>
			))}
		</Panel>
	);
}
