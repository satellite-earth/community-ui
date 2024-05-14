import Panel from '../../components/dashboard/panel';
import PanelItemToggle from '../../components/dashboard/panel-item-toggle';
import useSubject from '../../hooks/use-subject';
import { controlApi } from '../../services/private-node';

export default function ReceiverPanel() {
	const status = useSubject(controlApi?.receiverStatus);

	const active = status?.active;

	return (
		<Panel label="RECEIVER">
			<PanelItemToggle
				label="LISTENER ACTIVE"
				value={active ?? false}
				onChange={() => {
					if (active) controlApi?.send(['CONTROL', 'RECEIVER', 'STOP']);
					else controlApi?.send(['CONTROL', 'RECEIVER', 'START']);
				}}
			/>
		</Panel>
	);
}
