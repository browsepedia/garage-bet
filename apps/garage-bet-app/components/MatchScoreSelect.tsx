import { useMemo } from 'react';
import { View } from 'react-native';
import { LabeledSelectMenu } from './LabeledSelectMenu';

export interface MatchScoreSelectProps {
  value: number;
  onSelect: (value: number) => void;
  label?: string;
}

export default function MatchScoreSelect({
  label,
  value,
  onSelect,
}: Readonly<MatchScoreSelectProps>) {
  const options = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      label: i.toString(),
    }));
  }, []);

  return (
    <View style={{ maxWidth: 100, minWidth: 50 }}>
      <LabeledSelectMenu
        label={label ?? ''}
        options={options}
        value={value}
        onSelect={onSelect}
        getOptionLabel={(option) => option.id.toString()}
        placeholder=""
      />
    </View>
  );
}
