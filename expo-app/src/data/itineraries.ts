import { CreatingItinerary } from "../../@types/CreatingItinerary";

export const userTrips: CreatingItinerary[] = [
  {
    title: "Vive la France",
    dateBegin: new Date("2025-12-01"),
    dateEnd: new Date("2025-12-15"),
    days: 16,
    continent: "Europe",
    countries: [
      "France", "Switzerland", "United Kingdon"
    ],
    originCountry: "BR",
    visa: false,
    budget: 15000,
    peopleQuantity: 4,
    acconpanying: "Friends",
    tripStyle: [
      "Urban", "Countryside"
    ],
    locomotionMethod: [
      "Car", "Train", "Boat"
    ],
    specialWish: "I would like to cross the Eurotunnel by Boat",
    visitPreferences: [
      "Museums", "Monuments", "Parks", "Culture", "Food"
    ],
    itinerary: [
      {
        day: 1,
        date: "2025-12-01",
        location: "Paris, France",
        timeline: [
          {
            time: "08:00",
            activity: "Café da manhã em uma padaria local",
            details: "Experimente croissants e café típico francês."
          },
          {
            time: "09:30",
            activity: "Visita à Torre Eiffel",
            details: "Subida ao topo para uma vista panorâmica da cidade. Tempo estimado de deslocamento: 20 minutos."
          },
          {
            time: "12:00",
            activity: "Almoço no bairro Le Marais",
            details: "Restaurantes tradicionais com culinária francesa."
          },
          {
            time: "14:00",
            activity: "Passeio pelo Museu do Louvre",
            details: "Visita guiada às principais obras, incluindo a Mona Lisa. Tempo estimado de deslocamento: 15 minutos."
          },
          {
            time: "17:00",
            activity: "Caminhada pelo Jardim das Tulherias",
            details: "Relaxamento e fotos em um dos jardins mais icônicos de Paris."
          },
          {
            time: "19:00",
            activity: "Jantar em um bistrô típico",
            details: "Sugestão: experimentar escargot e vinho local."
          }
        ],
        suggestedActivities: [
          "Provar macarons na Ladurée",
          "Visitar livrarias históricas próximas ao Sena",
          "Comprar souvenirs na Rue de Rivoli"
        ]
      },
      {
        day: 2,
        date: "2025-12-02",
        location: "Versailles, France",
        timeline: [
          {
            time: "08:00",
            activity: "Café da manhã no hotel",
            details: "Buffet continental com opções variadas."
          },
          {
            time: "09:00",
            activity: "Deslocamento para Versailles",
            details: "Trem regional, tempo estimado: 40 minutos."
          },
          {
            time: "10:00",
            activity: "Visita ao Palácio de Versailles",
            details: "Tour pelos aposentos reais e jardins."
          },
          {
            time: "13:00",
            activity: "Almoço em restaurante próximo ao palácio",
            details: "Culinária francesa com pratos típicos da região."
          },
          {
            time: "15:00",
            activity: "Passeio pelos jardins de Versailles",
            details: "Inclui show das fontes (se disponível)."
          },
          {
            time: "17:00",
            activity: "Retorno a Paris",
            details: "Trem regional, tempo estimado: 40 minutos."
          }
        ],
        suggestedActivities: [
          "Comprar doces típicos em Versailles",
          "Visitar lojas de antiguidades próximas ao palácio"
        ]
      }
    ]
  }
]