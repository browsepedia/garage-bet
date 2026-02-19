import { MatchData } from '@garage-bet/models';
import { ChevronDown } from '@tamagui/lucide-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  H6,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';

export default function SetMatchBetDialog({
  match,
  onClose,
}: {
  match: MatchData;
  onClose: () => void;
}) {
  const [homeScore, setHomeScore] = useState(match.homeBetScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayBetScore || 0);

  return (
    <Dialog modal open>
      <Dialog.Portal>
        <Dialog.Overlay
          backgroundColor="$background"
          opacity={0.5}
          animateOnly={['transform', 'opacity']}
          transition={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.FocusScope focusOnIdle>
          <Dialog.Content
            width={'100%'}
            transition={[
              'quicker',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: 20, opacity: 0 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
          >
            <Dialog.Title size={'$6'} textAlign="center">
              Set bet
            </Dialog.Title>

            <XStack justifyContent="space-between" gap={16} alignItems="center">
              <H6 textAlign="right" flex={1}>
                {match.homeTeam}
              </H6>
              <Text width={16} textAlign="center">
                -
              </Text>
              <H6 textAlign="left" flex={1}>
                {match.awayTeam}
              </H6>
            </XStack>

            <XStack justifyContent="space-between" gap={16} alignItems="center">
              <View flex={1}>
                <NumberSelectExpo
                  value={homeScore}
                  onChange={setHomeScore}
                  label="Home team score"
                  textAlign="right"
                />
              </View>
              <Text width={16} textAlign="center">
                -
              </Text>
              <View flex={1}>
                <NumberSelectExpo
                  value={awayScore}
                  onChange={setAwayScore}
                  label="Away team score"
                  textAlign="left"
                />
              </View>
            </XStack>

            <XStack justifyContent="flex-end" gap="$4">
              <Dialog.Close displayWhenAdapted asChild>
                <XStack gap="$4">
                  <Button theme="blue" aria-label="Close" size="$3">
                    Cancel
                  </Button>
                  <Button
                    theme="blue"
                    aria-label="Close"
                    size="$3"
                    onPress={onClose}
                  >
                    Set bet
                  </Button>
                </XStack>
              </Dialog.Close>
            </XStack>
          </Dialog.Content>
        </Dialog.FocusScope>
      </Dialog.Portal>
    </Dialog>
  );
}

export function NumberSelectExpo({
  value,
  onChange,
  label = 'Select',
  textAlign = 'right',
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  textAlign: 'right' | 'left';
}) {
  const [open, setOpen] = useState(false);

  const options = useMemo(() => Array.from({ length: 11 }, (_, i) => i), []);

  return (
    <>
      <Button
        backgroundColor="$background"
        size="$3"
        onPress={() => setOpen(true)}
        iconAfter={ChevronDown}
      >
        <Text flex={1} textAlign={textAlign}>
          {' '}
          {value || '0'}
        </Text>
      </Button>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Overlay */}
        <Pressable
          style={{ flex: 1, justifyContent: 'center', padding: 16 }}
          onPress={() => setOpen(false)}
        >
          {/* Stop overlay press from closing when tapping content */}
          <Pressable>
            <Card padding="$4" borderWidth={1} borderColor="$borderColor">
              <H6 marginBottom="$3">{label}</H6>

              <ScrollView height={320}>
                <YStack gap="$2">
                  {options.map((opt) => (
                    <Button
                      theme={opt === value ? 'blue' : 'gray'}
                      key={opt}
                      size="$3"
                      onPress={() => {
                        onChange(opt);
                        setOpen(false);
                      }}
                    >
                      <Text>{opt}</Text>
                    </Button>
                  ))}
                </YStack>
              </ScrollView>

              <Button marginTop="$3" chromeless onPress={() => setOpen(false)}>
                Cancel
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
