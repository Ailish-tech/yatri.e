import { Contact } from "expo-contacts"

export type CreatingItinerary = {
  title: string, 
  dateBegin: Date, 
  dateEnd: Date, 
  days: number, 
  continent: string, 
  countries: Array<string>, 
  contacts: Contact[],
  budget: number,
  peopleQuantity: number,
  acconpanying: "Family" | "Friends",
  tripStyleTypes: "Urban" | "Countryside",
  tripStyle: Array<CreatingItinerary["tripStyleTypes"]>
  vehicleLocomotionTypes: "Car" | "Motorcycle" | "Foot" | "Train" | "Boat" | "Bicycle",
  locomotionMethod: Array<CreatingItinerary["vehicleLocomotionTypes"]>,
  specialWish: string
}