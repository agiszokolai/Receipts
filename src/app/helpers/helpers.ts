import moment from 'moment';

export function formatDateWithMoment(
  date: string | null | undefined,
  options: { formats?: string[]; useFormat?: string; defaultValue?: string } = {},
): string {
  const {
    formats = ['YYYY-MM-DDTHH:mm:ss[Z]', 'YYYY-MM-DD'],
    useFormat = 'YYYY. MM. DD. HH:mm:ss',
    defaultValue = '',
  } = options;

  if (!date) {
    return defaultValue;
  }

  const dateMoment = moment(date, formats);

  if (dateMoment.isValid()) {
    return dateMoment.format(useFormat);
  }

  return defaultValue;
}
export function getFilterLabel(type: string): string {
  switch (type) {
    case 'categories':
      return 'Kategória';
    case 'difficulties':
      return 'Nehézség';
    case 'rating':
      return 'Értékelés';
    case 'prepTime':
      return 'Elkészítés';
    default:
      return type;
  }
}

export function getPrepTimeCategory(cookingTime: string) {
  switch (cookingTime) {
    case '0':
      return ['Mind', 'Gyors', 'Közepes', 'Hosszadalmas'];
    case '1':
      return ['Gyors'];
    case '2':
      return ['Közepes'];
    case '3':
      return ['Hosszadalmas'];
    default:
      return [];
  }
}
