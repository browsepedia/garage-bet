import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { Button, Menu } from 'react-native-paper';

export function NumberSelectExpo({
  value,
  onChange,
  label = 'Select',
  textAlign = 'right',
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  textAlign?: 'right' | 'left';
}) {
  const [visible, setVisible] = useState(false);

  const options = useMemo(() => Array.from({ length: 11 }, (_, i) => i), []);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          contentStyle={{ flexDirection: 'row-reverse' }}
          icon={() => (
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#a1a1aa"
            />
          )}
        >
          {value ?? '0'}
        </Button>
      }
      anchorPosition="bottom"
      contentStyle={{
        backgroundColor: '#13161a',
        borderWidth: 1,
        borderColor: '#3f3f46',
        minWidth: 120,
      }}
    >
      {options.map((opt) => (
        <Menu.Item
          key={opt}
          onPress={() => {
            onChange(opt);
            setVisible(false);
          }}
          title={String(opt)}
        />
      ))}
    </Menu>
  );
}
