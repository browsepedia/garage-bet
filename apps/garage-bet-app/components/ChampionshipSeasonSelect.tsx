import { useMemo } from 'react';
import { useSeasonsQuery } from '../queries/seasons.query';
import { LabeledSelectMenu } from './LabeledSelectMenu';

type ChampionshipSeasonOption = {
  id: string;
  label: string;
};

export default function ChampionshipSeasonSelect({
  useAllSeasons = false,
  value,
  onChange,
  label,
  placeholder,
  emptyMessage,
}: {
  useAllSeasons?: boolean;
  value: string | 'all';
  onChange: (value: string | 'all') => void;
  label: string;
  placeholder: string;
  emptyMessage: string;
}) {
  const { data: seasons } = useSeasonsQuery();

  const championshipSeasonOptions = useMemo((): ChampionshipSeasonOption[] => {
    const list = [...(seasons ?? [])];

    list.sort((a, b) => {
      const byComp = a.competition.name.localeCompare(
        b.competition.name,
        undefined,
        { sensitivity: 'base' },
      );
      if (byComp !== 0) return byComp;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    const result = list.map((s) => ({
      id: s.id,
      label: `${s.competition.name} - ${s.name}`,
    }));

    if (useAllSeasons) {
      result.push({
        id: 'all',
        label: 'All championships',
      });
    }

    return result;
  }, [seasons, useAllSeasons]);

  return (
    <LabeledSelectMenu
      label={label}
      options={championshipSeasonOptions}
      value={value}
      onSelect={onChange}
      getOptionLabel={(opt) => opt.label}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
    />
  );
}
