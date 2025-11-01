import { CreatingItinerary } from "../../@types/CreatingItinerary";

// Função para remover emojis de uma string
export const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

// Função para formatar data no formato "MMM DD YYYY"
export const formatDateToString = (date: Date | string | undefined): string => {
  if (!date) {
    return 'Data não definida';
  }
  
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    return 'Data inválida';
  }
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

// Função para filtrar dados removendo emojis e formatando datas
export const filterItineraryData = (data: CreatingItinerary): any => {
  return {
    ...data,
    title: removeEmojis(data.title),
    countries: data.countries?.map(country => removeEmojis(country)),
    originCountry: removeEmojis(data.originCountry),
    specialWish: removeEmojis(data.specialWish),
    tripStyle: data.tripStyle?.map(style => style ? removeEmojis(style) : style),
    locomotionMethod: data.locomotionMethod?.map(method => method ? removeEmojis(method) : method),
    dateBegin: data.dateBegin ? formatDateToString(data.dateBegin) : 'Data não definida',
    dateEnd: data.dateEnd ? formatDateToString(data.dateEnd) : 'Data não definida'
  };
};

// Função para filtrar preferências do usuário
export const filterUserPreferences = (preferences: string[]): string[] => {
  return preferences?.map(preference => removeEmojis(preference)) || [];
};