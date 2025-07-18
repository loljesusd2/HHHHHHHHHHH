
import { PrismaClient } from '@prisma/client'

export type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  emailVerified?: boolean
  avatar?: string
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  imageUrl?: string
  images?: string[]
  isActive: boolean
  professionalId: string
  professional?: Professional & { user?: User }
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  clientId: string
  professionalId: string
  serviceId: string
  scheduledDate: Date
  scheduledTime: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  service?: Service
  client?: User
  professional?: Professional & { user?: User }
  payment?: Payment
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  professionalAmount: number
  platformFee: number
  paymentMethod: 'CASH'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId: string
  createdAt: Date
  updatedAt: Date
  bookingRef?: Booking
}

export interface Professional {
  id: string
  userId: string
  bio?: string
  experience?: string
  certifications?: string[]
  specialties?: string[]
  address?: string
  city?: string
  state?: string
  zipCode?: string
  businessName?: string
  isVerified: boolean
  averageRating: number
  totalReviews: number
  totalEarnings: number
  services: Service[]
  user?: User
  reviews?: Review[]
  upcomingBookings?: { date: string; time: string }[]
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'NEW' | 'RESPONDED' | 'RESOLVED'
  createdAt: Date
  updatedAt: Date
}

export interface Admin {
  id: string
  userId: string
}



export interface EarningsStats {
  totalEarnings: number
  completedBookings: number
  serviceBreakdown: Record<string, { count: number; earnings: number }>
  dailyEarnings: Record<string, number>
}

export interface PaymentStats {
  totalEarnings: number
  thisMonthEarnings: number
  completedPayments: number
  pendingPayments: number
  averageBookingValue: number
  totalTransactions: number
  monthlyChart: Array<{ month: string; earnings: number }>
}

export interface Review {
  id: string
  bookingId: string
  clientId: string
  professionalId: string
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
  client?: User
  professional?: Professional
}

// Constants
export const BOOKING_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const

export const SERVICE_CATEGORIES = {
  HAIR_STYLING: 'Hair Styling',
  MANICURE: 'Manicure',
  PEDICURE: 'Pedicure', 
  MAKEUP: 'Makeup',
  SKINCARE: 'Skincare',
  EYEBROWS: 'Eyebrows',
  MASSAGE: 'Massage'
} as const

// Gamification Types
export interface BeautyPoints {
  id: string
  userId: string
  points: number
  action: string // "booking", "review", "referral", "first_time", "profile_complete", "photo_upload"
  description: string
  bookingId?: string
  createdAt: Date
}

export interface UserBadge {
  id: string
  userId: string
  badgeType: string // "bronze", "silver", "gold", "platinum", "trendsetter", "loyal_client", "social_butterfly"
  level: string // "BRONZE", "SILVER", "GOLD", "PLATINUM"
  earnedAt: Date
}

export interface Referral {
  id: string
  referrerId: string
  referredId?: string
  code: string
  status: string // "pending", "completed", "expired"
  rewardClaimed: boolean
  rewardPoints: number
  createdAt: Date
  completedAt?: Date
  referrer?: User
  referred?: User
}

export interface FlashDeal {
  id: string
  serviceId: string
  discount: number // percentage
  startTime: Date
  endTime: Date
  isActive: boolean
  neighborhood: string
  maxUses: number
  currentUses: number
  createdAt: Date
  service?: Service
}

export interface BeautyTimeline {
  id: string
  userId: string
  bookingId: string
  beforePhoto?: string
  afterPhoto?: string
  notes?: string
  isPublic: boolean
  serviceType?: string
  createdAt: Date
  user?: User
  booking?: Booking
}

export interface GamificationStats {
  totalPoints: number
  currentLevel: string
  nextLevel: string
  pointsToNextLevel: number
  badges: UserBadge[]
  recentActivity: BeautyPoints[]
  referralCount: number
  timelineEntries: number
}

export interface LeaderboardEntry {
  userId: string
  user: User
  professional?: Professional
  totalPoints: number
  weeklyPoints: number
  monthlyPoints: number
  rank: number
  badges: UserBadge[]
}

export interface SocialShareData {
  imageUrl: string
  title: string
  description: string
  hashtags: string[]
  professionalName?: string
  serviceName?: string
}

// Constants for gamification
export const POINT_VALUES = {
  BOOKING_COMPLETED: 50,
  REVIEW_WRITTEN: 25,
  REFERRAL_SUCCESSFUL: 100,
  FIRST_TIME_USER: 20,
  PROFILE_COMPLETE: 30,
  PHOTO_UPLOAD: 15,
  SOCIAL_SHARE: 10
} as const

export const BADGE_LEVELS = {
  BRONZE: { min: 0, max: 199 },
  SILVER: { min: 200, max: 499 },
  GOLD: { min: 500, max: 999 },
  PLATINUM: { min: 1000, max: Infinity }
} as const

export const BADGE_TYPES = {
  LEVEL: 'level',
  TRENDSETTER: 'trendsetter',
  LOYAL_CLIENT: 'loyal_client',
  SOCIAL_BUTTERFLY: 'social_butterfly',
  EARLY_ADOPTER: 'early_adopter',
  REVIEW_MASTER: 'review_master',
  REFERRAL_CHAMPION: 'referral_champion'
} as const

// Beauty Academy Types
export interface InstructorProfile {
  id: string
  userId: string
  bio: string
  specializations: string[]
  yearsExperience: number
  certifications: string[]
  portfolioImages: string[]
  instagram?: string
  youtube?: string
  website?: string
  totalCourses: number
  totalStudents: number
  averageRating: number
  totalEarnings: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Course {
  id: string
  instructorId: string
  title: string
  description: string
  category: string
  level: string
  price: number
  originalPrice?: number
  duration: number
  thumbnailUrl: string
  previewVideoUrl?: string
  syllabus: string
  tags: string[]
  badges: string[]
  requirements: string[]
  skillsYouWillLearn: string[]
  totalStudents: number
  averageRating: number
  totalReviews: number
  totalRevenue: number
  isActive: boolean
  isFeatured: boolean
  allowReviews: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  instructor?: User & { instructorProfile?: InstructorProfile }
  modules?: CourseModule[]
  enrollments?: CourseEnrollment[]
  reviews?: CourseReview[]
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  duration: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lessons?: Lesson[]
  course?: Course
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description?: string
  order: number
  duration: number
  videoUrl?: string
  videoThumbnail?: string
  pdfUrl?: string
  downloadableResources: string[]
  isFree: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  module?: CourseModule
  quizzes?: Quiz[]
  progress?: CourseProgress[]
}

export interface CourseEnrollment {
  id: string
  userId: string
  courseId: string
  enrollmentType: string
  amount: number
  paymentStatus: string
  progressPercentage: number
  completedLessons: number
  totalLessons: number
  isCompleted: boolean
  completedAt?: Date
  certificateUrl?: string
  hasLifetimeAccess: boolean
  accessExpiresAt?: Date
  enrolledAt: Date
  updatedAt: Date
  user?: User
  course?: Course
}

export interface CourseProgress {
  id: string
  userId: string
  lessonId: string
  isCompleted: boolean
  watchTime: number
  totalTime: number
  progressPercentage: number
  startedAt: Date
  completedAt?: Date
  lastWatchedAt: Date
  user?: User
  lesson?: Lesson
}

export interface Quiz {
  id: string
  lessonId: string
  title: string
  description?: string
  questions: any[] // Array of question objects
  passingScore: number
  maxAttempts: number
  timeLimit?: number
  isActive: boolean
  showResults: boolean
  createdAt: Date
  updatedAt: Date
  lesson?: Lesson
  results?: QuizResult[]
}

export interface QuizResult {
  id: string
  userId: string
  quizId: string
  score: number
  answers: any // User answers object
  isPassed: boolean
  attemptNumber: number
  startedAt: Date
  completedAt?: Date
  user?: User
  quiz?: Quiz
}

export interface AcademyCertification {
  id: string
  userId: string
  level: string
  category: string
  coursesCompleted: number
  averageScore: number
  totalHours: number
  certificateUrl: string
  certificateNumber: string
  isVerified: boolean
  verificationCode: string
  expiresAt?: Date
  earnedAt: Date
  user?: User
}

export interface CourseReview {
  id: string
  userId: string
  courseId: string
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  helpfulVotes: number
  createdAt: Date
  updatedAt: Date
  user?: User
  course?: Course
}

export interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  coursesCompleted: number
  certificationsEarned: number
  totalStudyTime: number
  activeSubscriptions: number
}

export interface LearningProgress {
  courseId: string
  courseName: string
  progressPercentage: number
  completedLessons: number
  totalLessons: number
  estimatedTimeLeft: number
  lastWatchedAt: Date
  nextLesson?: Lesson
}

// Beauty Academy Constants
export const COURSE_CATEGORIES = {
  HAIR_STYLING: 'Hair Styling',
  MAKEUP: 'Makeup',
  NAILS: 'Nails',
  BUSINESS_SKILLS: 'Business Skills',
  SKINCARE: 'Skincare',
  EYEBROWS: 'Eyebrows',
  ADVANCED_TECHNIQUES: 'Advanced Techniques'
} as const

export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
  MASTERCLASS: 'Masterclass'
} as const

export const CERTIFICATION_LEVELS = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond'
} as const

export const ENROLLMENT_TYPES = {
  INDIVIDUAL: 'Individual',
  BUNDLE: 'Bundle',
  ANNUAL_PASS: 'Annual Pass',
  PREMIUM_QA: 'Premium Q&A'
} as const

export const COURSE_BADGES = {
  BESTSELLER: 'Bestseller',
  NEW: 'New',
  PREMIUM: 'Premium',
  TRENDING: 'Trending',
  FEATURED: 'Featured',
  LIMITED: 'Limited Time'
} as const

export const PRICING_TIERS = {
  INDIVIDUAL: { min: 49, max: 99 },
  BUNDLE: { price: 199, discount: 30 },
  ANNUAL_PASS: { price: 499 },
  PREMIUM_QA: { price: 29 }
} as const

// Live Service Tracking Types
export interface ServiceTracking {
  id: string
  bookingId: string
  professionalId: string
  clientId: string
  status: TrackingStatus
  
  // Location data
  professionalLat?: number
  professionalLng?: number
  clientLat?: number
  clientLng?: number
  
  // Timing
  estimatedArrival?: Date
  actualArrival?: Date
  serviceStarted?: Date
  serviceCompleted?: Date
  
  // Equipment checklist
  equipmentChecklist?: any
  
  // Emergency contacts
  emergencyContacts?: any
  locationShared: boolean
  
  createdAt: Date
  updatedAt: Date
  
  booking?: Booking
  professional?: User
  client?: User
}

export interface DynamicPricing {
  id: string
  serviceId: string
  basePrice: number
  currentPrice: number
  surgeMultiplier: number
  demandLevel: 'low' | 'medium' | 'high' | 'surge'
  
  // Pricing factors
  timeSlot: string
  dayOfWeek: number
  seasonalFactor: number
  locationFactor: number
  
  // Savings calculation
  peakPrice?: number
  savingsAmount?: number
  
  validFrom: Date
  validUntil: Date
  
  createdAt: Date
  
  service?: Service
}

export interface ProfessionalSurgeSettings {
  id: string
  professionalId: string
  surgeEnabled: boolean
  minSurgeRate: number
  maxSurgeRate: number
  autoAccept: boolean
  
  professional?: User
}

export interface RecurringBookingPrice {
  id: string
  clientId: string
  serviceId: string
  lockedPrice: number
  frequency: 'weekly' | 'biweekly' | 'monthly'
  lockedUntil: Date
  bookingsUsed: number
  maxBookings: number
  
  client?: User
  service?: Service
}

export interface EmergencyContact {
  id: string
  userId: string
  name: string
  phone: string
  relationship: 'family' | 'friend' | 'partner' | 'other'
  isPrimary: boolean
  isActive: boolean
  
  user?: User
  
  createdAt: Date
  updatedAt: Date
}

export type TrackingStatus = 
  | 'CONFIRMED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export interface LiveTrackingData {
  tracking: ServiceTracking
  distance: number
  duration: number
  route?: any
  professional: User & { professional?: Professional }
  client: User
  service: Service
}

export interface PricingCalculation {
  basePrice: number
  currentPrice: number
  surgeMultiplier: number
  demandLevel: string
  peakPrice?: number
  savingsAmount?: number
  savingsPercentage?: number
  timeSlot: string
  validUntil: Date
}

export interface EquipmentItem {
  id: string
  name: string
  checked: boolean
  required: boolean
  category: 'tools' | 'products' | 'hygiene' | 'other'
}

export interface LocationData {
  lat: number
  lng: number
  address?: string
  accuracy?: number
  timestamp: Date
}

export interface PushNotificationData {
  title: string
  body: string
  type: 'tracking' | 'pricing' | 'emergency' | 'general'
  bookingId?: string
  userId: string
  data?: any
}

// Constants for live tracking
export const TRACKING_STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  ON_THE_WAY: 'On the way',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const

export const DEMAND_LEVELS = {
  low: { multiplier: 0.85, label: 'Low Demand', color: '#10B981' },
  medium: { multiplier: 1.0, label: 'Normal', color: '#6B7280' },
  high: { multiplier: 1.2, label: 'High Demand', color: '#F59E0B' },
  surge: { multiplier: 1.5, label: 'Surge Pricing', color: '#EF4444' }
} as const

export const EQUIPMENT_CATEGORIES = {
  tools: 'Tools & Equipment',
  products: 'Products',
  hygiene: 'Hygiene & Safety',
  other: 'Other'
} as const

export const RECURRING_FREQUENCIES = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly'
} as const

export const EMERGENCY_RELATIONSHIPS = {
  family: 'Family',
  friend: 'Friend',
  partner: 'Partner',
  other: 'Other'
} as const

// Salon System Types
export interface Salon {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  businessLicense?: string
  
  // Verification
  isVerified: boolean
  verifiedAt?: Date
  
  // Commission settings
  platformFeeRate: number
  salonCommissionRate: number
  
  // Settings
  settings?: any
  
  // Relations
  ownerId: string
  owner?: User
  professionals?: SalonProfessional[]
  analytics?: SalonAnalytics[]
  webhooks?: SalonWebhook[]
  scheduleTemplates?: SalonScheduleTemplate[]
  
  createdAt: Date
  updatedAt: Date
}

export interface SalonProfessional {
  id: string
  salonId: string
  userId: string
  professionalId: string
  role: 'OWNER' | 'MANAGER' | 'PROFESSIONAL' | 'TRAINEE'
  commissionRate: number
  isActive: boolean
  joinedAt: Date
  
  // Relations
  salon?: Salon
  user?: User
  professional?: Professional
}

export interface SalonAnalytics {
  id: string
  salonId: string
  date: Date
  totalRevenue: number
  totalBookings: number
  averageRating: number
  clientCount: number
  professionalCount: number
  
  // Detailed metrics
  completedBookings: number
  cancelledBookings: number
  newClients: number
  returningClients: number
  
  // Relations
  salon?: Salon
}

export interface SalonWebhook {
  id: string
  salonId: string
  url: string
  events: string[]
  isActive: boolean
  secret: string
  
  // Metadata
  description?: string
  lastTriggered?: Date
  failureCount: number
  
  // Relations
  salon?: Salon
  
  createdAt: Date
  updatedAt: Date
}

export interface SalonScheduleTemplate {
  id: string
  salonId: string
  name: string
  description?: string
  schedule: any // Weekly schedule template
  isDefault: boolean
  isActive: boolean
  
  // Relations
  salon?: Salon
  
  createdAt: Date
  updatedAt: Date
}

export interface SalonDashboardStats {
  totalRevenue: number
  totalBookings: number
  totalProfessionals: number
  averageRating: number
  monthlyRevenue: number
  weeklyBookings: number
  topProfessionals: {
    user: User
    professional: Professional
    revenue: number
    bookings: number
    rating: number
  }[]
  revenueChart: { date: string; revenue: number }[]
  bookingsByService: { service: string; count: number; revenue: number }[]
}

export interface BulkImportResult {
  total: number
  successful: number
  failed: number
  errors: {
    row: number
    email: string
    error: string
  }[]
}

export interface CommissionCalculation {
  totalAmount: number
  platformFee: number
  salonCommission: number
  professionalEarnings: number
  platformFeeRate: number
  salonCommissionRate: number
  professionalCommissionRate: number
}

// Salon Constants
export const SALON_ROLES = {
  OWNER: 'Owner',
  MANAGER: 'Manager', 
  PROFESSIONAL: 'Professional',
  TRAINEE: 'Trainee'
} as const

export const WEBHOOK_EVENTS = {
  'booking.created': 'Booking Created',
  'booking.confirmed': 'Booking Confirmed',
  'booking.cancelled': 'Booking Cancelled',
  'booking.completed': 'Booking Completed',
  'payment.completed': 'Payment Completed',
  'payment.failed': 'Payment Failed',
  'professional.joined': 'Professional Joined',
  'professional.left': 'Professional Left'
} as const

export const COMMISSION_TIERS = {
  BASIC: { platform: 0.15, salon: 0.25, professional: 0.60 },
  PREMIUM: { platform: 0.12, salon: 0.23, professional: 0.65 },
  ELITE: { platform: 0.10, salon: 0.20, professional: 0.70 }
} as const
