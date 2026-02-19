import { MatchData } from '@garage-bet/models';
import { Button, Card, Circle, H6, Text, XStack, YStack } from 'tamagui';
import { formatInUserTimezone } from '../utils/format-date';

export default function MatchCard({
  match,
  onSetBetClick,
}: {
  match: MatchData;
  onSetBetClick: () => void;
}) {
  return (
    <Card
      position="relative"
      padding="$4"
      size="$4"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {match.betStatus !== 'UNSET' && match.betStatus !== 'PENDING' && (
        <Circle
          size={16}
          backgroundColor={
            match.betStatus === 'WON'
              ? '$green10'
              : match.betStatus === 'LOST'
                ? '$red10'
                : '$yellow10'
          }
          position="absolute"
          top={'$2'}
          right={'$2'}
        />
      )}
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
        <H6 textAlign="right" flex={1}>
          {match.homeScore}
        </H6>
        <Text width={16} textAlign="center">
          -
        </Text>
        <H6 textAlign="left" flex={1}>
          {match.awayScore}
        </H6>
      </XStack>

      <XStack
        justifyContent="space-between"
        gap={16}
        alignItems="center"
      ></XStack>

      <XStack justifyContent="space-between" gap={16} alignItems="flex-end">
        <YStack justifyContent="flex-start" alignItems="flex-start">
          <Text textAlign="center" fontSize="$1" color="$color">
            {formatInUserTimezone(match.kickoffAt, 'dd MMM yyyy HH:mm')}
          </Text>
          <Text textAlign="center" fontSize="$1" color="$color">
            {match.competition}
          </Text>
          <Text textAlign="center" fontSize="$1" color="$color">
            {match.stage}
          </Text>
        </YStack>

        {match.betStatus === 'PENDING' && (
          <Button size="$2" theme="blue" onPress={onSetBetClick}>
            <Text>Place bet</Text>
          </Button>
        )}

        {match.betStatus === 'SET' && (
          <Button size="$2" theme="blue" onPress={onSetBetClick}>
            <Text>Update bet</Text>
          </Button>
        )}

        {match.betStatus === 'UNSET' && (
          <Text textAlign="center" fontSize="$1" color="$color">
            Unset
          </Text>
        )}

        {match.betStatus === 'WON' && (
          <Text textAlign="center" fontSize="$1" color="$color">
            Won
          </Text>
        )}

        {match.betStatus === 'LOST' && (
          <Text textAlign="center" fontSize="$1" color="$color">
            Lost
          </Text>
        )}

        {match.betStatus === 'RESULT' && (
          <Text textAlign="center" fontSize="$1" color="$color">
            Result
          </Text>
        )}
      </XStack>
    </Card>
  );
}
