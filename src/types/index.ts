// ===========================================
// TYPE DEFINITIONS FOR THE ENTIRE APPLICATION
// ===========================================

// User roles in the system
export type UserRole = 'super_admin' | 'admin' | 'citizen';

// User document structure in Firestore
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string; // Hashed, only for credential login
  role: UserRole;
  provider: 'credentials' | 'google';
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
}

// Vehicle registry entry (from JSON file)
export interface VehicleRegistryEntry {
  license_plate: string;
  name: string;
  email: string;
  phone: string;
}

// Vehicle registry file structure
export interface VehicleRegistry {
  vehicles: VehicleRegistryEntry[];
}

// Location details in a violation
export interface ViolationLocation {
  junction_name: string;
  camera_id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Vehicle details in a violation
export interface ViolationVehicle {
  license_plate: string;
  ocr_confidence: number;
  plate_status: 'VERIFIED' | 'MANUAL_REVIEW' | 'UNIDENTIFIED';
  num_riders: number;
  // bike_detected: boolean;
}

// Individual violation type
export interface ViolationType {
  type: 'NO_HELMET' | 'TRIPLE_RIDING' | 'SIGNAL_JUMP' | 'ZEBRA_CROSSING';
  description: string;
  fine_amount: number;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Evidence URLs
export interface ViolationEvidence {
  violation_full: string | null;
  bike_crop: string | null;
  plate_crop: string | null;
  plate_processed: string | null;
}

// Processing metadata
// export interface ProcessingMetadata {
//   frame_timestamp: number;
// }

// Complete violation document structure (matches edge system schema exactly)
export interface Violation {
  violation_id: string;
  timestamp: number;
  datetime: string;
  date: string;
  time: string;
  location: ViolationLocation;
  vehicle: ViolationVehicle;
  violations: ViolationType[];
  total_fine: number;
  payment_status: 'PENDING' | 'PAID';
  evidence: ViolationEvidence;
  signal_state: 'RED' | 'GREEN';
  frame_timestamp: number;
  // Additional fields we add
  citizen_email: string | null;
  citizen_name: string | null;
  citizen_phone: string | null;
  notification_sent: boolean;
  created_at: number;
  updated_at: number;
  is_deleted: boolean;
  doc_id?: string;

  payment_id?: string;
  payment_date?: number;
  transaction_id?: string;
}

// Admin access request
export interface AdminRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: number;
  processed_at?: number;
  processed_by?: string;
}

// Payment record
// export interface Payment {
//   id: string;
//   violation_id: string;
//   user_id: string;
//   user_email: string;
//   amount: number;
//   stripe_session_id: string;
//   stripe_payment_intent?: string;
//   status: 'pending' | 'completed' | 'failed';
//   created_at: number;
//   completed_at?: number;
// }

// OTP record
export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  expires_at: number;
  verified: boolean;
  created_at: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page: any,
    limit: any,
    total: number 
  }
}

export interface Payment {
  id: string;                    // Firebase document ID
  payment_id: string;            // Generated ID (PAY_YYYYMMDD_HHMMSS)
  
  // Violation details
  violation_id: string;          // Reference to violation document ID
  violation_number: string;      // Violation ID for display
  
  // User details
  user_id: string;
  user_email: string;
  user_name: string;
  user_phone?: string;
  
  // Payment details
  amount: number;
  payment_method: 'demo_payment' | 'card' | 'upi' | 'netbanking';
  payment_status: 'pending' | 'completed' | 'failed';
  
  // Transaction details
  transaction_id: string;        // Demo transaction ID
  payment_date: number;          // Timestamp
  
  // Additional info
  license_plate: string;
  violation_type: string;
  
  // Metadata
  created_at: number; 
  updated_at: number;
}
 
export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  pending_payments: number;
  pending_amount: number;
  completed_payments: number;
  completed_amount: number;
}
