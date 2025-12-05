export interface Place {
  id: string,
  name: string,
  vicinity: string,
  rating: number,
  photos?: { photo_reference?: string, photo_url?: string }[],
  geometry: {
    location: {
      lat: number,
      lng: number
    };
  },
  open_now: boolean
}