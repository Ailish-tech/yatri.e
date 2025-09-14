import { CreatingItinerary } from "../../@types/CreatingItinerary";

export const userTrips: CreatingItinerary[] = [
  {
    title: "Vive la France (Demo)",
    dateBegin: new Date("2025-12-01"),
    dateEnd: new Date("2025-12-15"),
    days: 16,
    continent: "Europe",
    countries: [
      "France", "Switzerland", "United Kingdon"
    ],
    originCountry: "BR",
    visa: "Negative",
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
            title: "Café da manhã em uma padaria local (Le Grenier à Pain)",
            description: "Experimente croissants e café típico francês.",
            coordinates: "48.8566; 2.3522"
          },
          {
            time: "09:30",
            title: "Visita à Torre Eiffel",
            description: "Subida ao topo para uma vista panorâmica da cidade. Tempo estimado de deslocamento: 20 minutos.",
            coordinates: "48.8584; 2.2945"
          },
          {
            time: "12:00",
            title: "Almoço no bairro Le Marais (Chez Janou)",
            description: "Restaurantes tradicionais com culinária francesa.",
            coordinates: "48.8575; 2.3622"
          },
          {
            time: "14:00",
            title: "Passeio pelo Museu do Louvre",
            description: "Visita guiada às principais obras, incluindo a Mona Lisa. Tempo estimado de deslocamento: 15 minutos.",
            coordinates: "48.8606; 2.3376"
          },
          {
            time: "17:00",
            title: "Caminhada pelo Jardim das Tulherias",
            description: "Relaxamento e fotos em um dos jardins mais icônicos de Paris.",
            coordinates: "48.8635; 2.3275"
          },
          {
            time: "19:00",
            title: "Jantar em um bistrô típico (Le Bistrot Paul Bert)",
            description: "Sugestão: experimentar escargot e vinho local.",
            coordinates: "48.8519; 2.3775"
          }
        ],
        suggestedActivities: [
          "Provar macarons na Ladurée",
          "Visitar livrarias históricas próximas ao Sena",
          "Comprar souvenirs na Rue de Rivoli"
        ],
        pixabayTags: "Landscape, Paris, City View",
        images: [ "https://cdn.pixabay.com/photo/2021/06/22/16/39/arch-6356637_1280.jpg" ]
      },
      {
        day: 2,
        date: "2025-12-02",
        location: "Versailles, France",
        timeline: [
          {
            time: "08:00",
            title: "Café da manhã no hotel",
            description: "Buffet continental com opções variadas.",
            coordinates: "48.8014; 2.1301"
          },
          {
            time: "09:00",
            title: "Deslocamento para Versailles",
            description: "Trem regional, tempo estimado: 40 minutos.",
            coordinates: "48.8014; 2.1301"
          },
          {
            time: "10:00",
            title: "Visita ao Palácio de Versailles",
            description: "Tour pelos aposentos reais e jardins.",
            coordinates: "48.8049; 2.1204"
          },
          {
            time: "13:00",
            title: "Almoço em restaurante próximo ao palácio (La Petite Venise)",
            description: "Culinária francesa com pratos típicos da região.",
            coordinates: "48.8050; 2.1210"
          },
          {
            time: "15:00",
            title: "Passeio pelos jardins de Versailles",
            description: "Inclui show das fontes (se disponível).",
            coordinates: "48.8049; 2.1204"
          },
          {
            time: "17:00",
            title: "Retorno a Paris",
            description: "Trem regional, tempo estimado: 40 minutos.",
            coordinates: "48.8566; 2.3522"
          }
        ],
        suggestedActivities: [
          "Comprar doces típicos em Versailles",
          "Visitar lojas de antiguidades próximas ao palácio"
        ],
        pixabayTags: "Landscape, Versailles, Palace",
        images: [ "https://cdn.pixabay.com/photo/2024/09/19/07/46/versailles-9057981_1280.jpg" ]
      },
      {
        day: 3,
        date: "2025-12-03",
        location: "Lyon, France",
        timeline: [
          {
            time: "08:00",
            title: "Café da manhã no hotel",
            description: "Buffet com opções locais e internacionais.",
            coordinates: "45.7640; 4.8357"
          },
          {
            time: "09:30",
            title: "Passeio pelo centro histórico de Lyon",
            description: "Exploração das traboules (passagens secretas) e visita à Basílica de Notre-Dame de Fourvière.",
            coordinates: "45.7580; 4.8270"
          },
          {
            time: "12:30",
            title: "Almoço em um bouchon lyonnais (Le Bouchon des Filles)",
            description: "Restaurante típico com pratos tradicionais como quenelles e gratin dauphinois.",
            coordinates: "45.7673; 4.8343"
          },
          {
            time: "15:00",
            title: "Visita ao Museu das Confluências",
            description: "Museu de ciência e antropologia com arquitetura moderna impressionante.",
            coordinates: "45.7325; 4.8198"
          },
          {
            time: "18:00",
            title: "Jantar às margens do Rio Ródano (Le Sud)",
            description: "Restaurante com vista para o rio e pratos regionais.",
            coordinates: "45.7578; 4.8321"
          }
        ],
        suggestedActivities: [
          "Passeio de barco pelo Rio Ródano",
          "Visitar o mercado Les Halles de Lyon-Paul Bocuse",
          "Explorar as lojas de seda de Lyon"
        ],
        pixabayTags: "Landscape, Lyon, City View",
        images: [ "https://cdn.pixabay.com/photo/2023/05/15/22/09/city-7996136_1280.jpg" ]
      },
      {
        day: 4,
        date: "2025-12-04",
        location: "Geneva, Switzerland",
        timeline: [
          {
            time: "08:00",
            title: "Café da manhã no hotel",
            description: "Buffet com queijos suíços e pães frescos.",
            coordinates: "46.2044; 6.1432"
          },
          {
            time: "09:30",
            title: "Visita ao Jet d'Eau",
            description: "O famoso chafariz no Lago de Genebra.",
            coordinates: "46.2074; 6.1551"
          },
          {
            time: "11:00",
            title: "Passeio pela Cidade Velha",
            description: "Exploração das ruas de paralelepípedos e visita à Catedral de São Pedro.",
            coordinates: "46.2018; 6.1481"
          },
          {
            time: "13:00",
            title: "Almoço em restaurante à beira do lago (Auberge du Lion d'Or)",
            description: "Pratos suíços tradicionais com vista para o lago.",
            coordinates: "46.2244; 6.1628"
          },
          {
            time: "15:00",
            title: "Visita ao Museu Internacional da Cruz Vermelha",
            description: "Exposição sobre a história humanitária e o trabalho da Cruz Vermelha.",
            coordinates: "46.2266; 6.1406"
          },
          {
            time: "18:00",
            title: "Jantar em restaurante gourmet (Le Chat-Botté)",
            description: "Experiência gastronômica com pratos suíços e internacionais.",
            coordinates: "46.2073; 6.1479"
          }
        ],
        suggestedActivities: [
          "Passeio de barco pelo Lago de Genebra",
          "Visitar o Jardim Inglês",
          "Explorar as lojas de relógios suíços"
        ],
        pixabayTags: "Landscape, Geneva, Switzerland, City",
        images: [ "https://cdn.pixabay.com/photo/2023/09/17/21/08/geneva-8259296_1280.jpg" ]
      },
      {
        day: 5,
        date: "2025-12-05",
        location: "Interlaken, Switzerland",
        timeline: [
          {
            time: "07:30",
            title: "Café da manhã no hotel",
            description: "Buffet com vista para os Alpes.",
            coordinates: "46.6863; 7.8632"
          },
          {
            time: "08:30",
            title: "Passeio de trem para Jungfraujoch",
            description: "Conhecida como o Topo da Europa, com vistas deslumbrantes dos Alpes.",
            coordinates: "46.5476; 7.9856"
          },
          {
            time: "12:00",
            title: "Almoço no restaurante panorâmico",
            description: "Refeição com vista para as montanhas cobertas de neve.",
            coordinates: "46.5476; 7.9856"
          },
          {
            time: "14:00",
            title: "Exploração do Ice Palace",
            description: "Galeria de esculturas de gelo dentro da geleira.",
            coordinates: "46.5476; 7.9856"
          },
          {
            time: "16:00",
            title: "Retorno a Interlaken",
            description: "Trem panorâmico com vistas incríveis.",
            coordinates: "46.6863; 7.8632"
          },
          {
            time: "19:00",
            title: "Jantar em restaurante alpino (Restaurant Taverne)",
            description: "Pratos típicos como fondue de queijo e raclette.",
            coordinates: "46.6863; 7.8632"
          }
        ],
        suggestedActivities: [
          "Passeio de barco pelos lagos Thun e Brienz",
          "Visitar o Harder Kulm para vistas panorâmicas",
          "Explorar as trilhas ao redor de Interlaken"
        ],
        pixabayTags: "Landscape, Interlaken, Switzerland",
        images: [ "https://cdn.pixabay.com/photo/2019/01/10/21/03/landscape-3926066_1280.jpg" ]
      },
      {
        day: 6,
        date: "2025-12-06",
        location: "London, United Kingdom",
        timeline: [
          {
            time: "08:00",
            title: "Café da manhã em um café local",
            description: "Experimente um tradicional English Breakfast.",
            coordinates: "51.5074; -0.1278"
          },
          {
            time: "09:30",
            title: "Visita à Torre de Londres",
            description: "Explore a história da monarquia britânica e veja as Joias da Coroa.",
            coordinates: "51.5081; -0.0759"
          },
          {
            time: "12:00",
            title: "Passeio pela Tower Bridge",
            description: "Caminhada pela icônica ponte de Londres com vistas incríveis do Tâmisa.",
            coordinates: "51.5055; -0.0754"
          },
          {
            time: "13:00",
            title: "Almoço em pub tradicional (The Churchill Arms)",
            description: "Prove pratos típicos como fish and chips ou shepherd's pie.",
            coordinates: "51.5064; -0.1910"
          },
          {
            time: "15:00",
            title: "Visita ao Museu Britânico",
            description: "Descubra artefatos históricos, incluindo a Pedra de Roseta.",
            coordinates: "51.5194; -0.1270"
          },
          {
            time: "18:00",
            title: "Passeio pelo Covent Garden",
            description: "Explore lojas, artistas de rua e restaurantes.",
            coordinates: "51.5115; -0.1234"
          },
          {
            time: "20:00",
            title: "Jantar em restaurante sofisticado (Sketch)",
            description: "Desfrute de uma experiência gastronômica moderna em Londres.",
            coordinates: "51.5136; -0.1410"
          }
        ],
        suggestedActivities: [
          "Passeio noturno pela London Eye",
          "Visitar o Big Ben e o Parlamento",
          "Explorar o Soho para vida noturna"
        ],
        pixabayTags: "Landscape, London, Queen, City, Palace",
        images: [ "https://cdn.pixabay.com/photo/2016/08/05/15/02/london-1572444_640.jpg" ]
      }
    ]
  }
]