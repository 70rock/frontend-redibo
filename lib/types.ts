export interface RenterDetailsType {
  id: string
  firstName: string
  lastName: string
  age: number
  occupation: string
  address: string
  email: string
  phone: string
  profilePicture: string
  rating: number
  reviewCount: number
  memberSince: string
  completedRentals: number
  reviews: Review[]
  rentalHistory: RentalHistory[]
}

export interface Review {
  id: string
  renterId: string
  hostId: string
  reservationId: string
  rating: number
  behaviorRating: number
  carCareRating: number
  punctualityRating: number
  comment?: string
  hostName: string
  hostPicture?: string
  renterName: string
  createdAt: Date
  updatedAt: Date
  host_name: string
  host_picture: string
  date: string
}

export interface NewReview {
  rating: number
  behavior_rating?: number
  car_care_rating?: number
  punctuality_rating?: number
  comment?: string
  host_picture?: string
  renter_name?: string
  reservation_id: string
}

export interface RentalHistory {
  id: string
  car_model: string
  dates: string
  status: string
}

export interface ReportData {
  reason: string
  additionalInfo?: string
}

export interface Report {
  id: string
  renterId: string
  reporterId: string
  reason: string
  additionalInfo?: string
  status: string
  createdAt: Date
  updatedAt: Date
}
