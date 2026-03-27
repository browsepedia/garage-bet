import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Menu, Text } from 'react-native-paper';

export type LabeledSelectMenuProps<
  TEntityId extends string | number = string,
  TEntity extends { id: TEntityId } = { id: TEntityId },
> = {
  label: string;
  options: TEntity[];
  value: TEntityId | null;
  onSelect: (id: TEntityId) => void;
  getOptionLabel: (item: TEntity) => string;
  placeholder?: string;
  emptyMessage?: string;
  /** When true, the control cannot be opened (e.g. parent form state). */
  disabled?: boolean;
  flex?: number;
};

export function LabeledSelectMenu<
  TEntityId extends string | number = string,
  TEntity extends { id: TEntityId } = { id: TEntityId },
>({
  label,
  options,
  value,
  onSelect,
  getOptionLabel,
  placeholder,
  emptyMessage,
  disabled = false,
  flex,
}: LabeledSelectMenuProps<TEntityId, TEntity>) {
  const [open, setOpen] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const selected = options.find((o) => o.id === value);

  const triggerDisabled = disabled || options.length === 0;

  const menuContentStyle = {
    backgroundColor: '#13161a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    ...(anchorWidth != null
      ? { width: anchorWidth, minWidth: anchorWidth }
      : null),
  };

  return (
    <View style={{ marginBottom: 12, flex }}>
      {label && (
        <Text variant="labelLarge" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <Menu
        visible={open}
        anchorPosition="bottom"
        onDismiss={() => setOpen(false)}
        anchor={
          <Pressable
            disabled={triggerDisabled}
            onPress={() => !triggerDisabled && setOpen(true)}
            onLayout={(e) => setAnchorWidth(e.nativeEvent.layout.width)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#3f3f46',
              borderRadius: 4,
              backgroundColor: triggerDisabled ? '#1a1d22' : '#13161a',
            }}
          >
            <Text>
              {selected
                ? getOptionLabel(selected)
                : (emptyMessage ?? placeholder)}
            </Text>
          </Pressable>
        }
        contentStyle={menuContentStyle}
      >
        {options.map((item) => (
          <Menu.Item
            key={item.id}
            style={
              anchorWidth != null
                ? { width: anchorWidth, minWidth: anchorWidth }
                : undefined
            }
            onPress={() => {
              onSelect(item.id);
              setOpen(false);
            }}
            title={getOptionLabel(item)}
          />
        ))}
      </Menu>
    </View>
  );
}
