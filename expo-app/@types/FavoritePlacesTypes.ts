export type FavoritePlace = {
  id: string;
  title: string;
  description: string;
  coordinates: string;
  category: string;
  location: string;
  date: string;
  itineraryTitle: string;
  favoritedAt: string;
  images?: string[];
}

export type FavoritePlacesContextType = {
  favoritePlaces: FavoritePlace[];
  addFavoritePlace: (place: FavoritePlace) => Promise<void>;
  removeFavoritePlace: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
  clearAllFavorites: () => Promise<void>;
}
