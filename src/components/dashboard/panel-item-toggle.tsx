import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export default function PanelItemToggle({
	label,
	value,
	onChange,
}: {
	label?: string;
	value: boolean;
	onChange: () => void;
}) {
	return (
		<FormControl display="flex" alignItems="center" justifyContent="space-between">
			<FormLabel mb="0">{label}</FormLabel>
			<Switch isChecked={value} onChange={onChange} />
		</FormControl>
	);
}
