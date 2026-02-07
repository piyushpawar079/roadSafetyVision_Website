// ===========================================
// VIOLATIONS UPLOAD API
// POST /api/violations/upload
// Receives violation data with base64 images from Jetson Nano
// Uploads images to Cloudinary and stores data in Firebase
// Uses API Key authentication (not session-based)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { lookupVehicleOwner } from '@/utils/vehicle-registry';
import { sendViolationNotification } from '@/services/email.service';
import { ApiResponse, Violation } from '@/types';

// API Key for Jetson Nano authentication
const UPLOAD_API_KEY = process.env.JETSON_UPLOAD_API_KEY || 'your-secure-api-key-here';

interface UploadPayload {
  violation_id: string;
  timestamp: number;
  date: string;
  time: string;
  location: {
    junction_name: string;
    camera_id: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  vehicle: {
    license_plate: string;
    ocr_confidence: number;
    plate_status: string;
    num_riders: number;
  };
  violations: Array<{
    type: string;
    description: string;
    fine_amount: number;
    severity: string;
  }>;
  total_fine: number;
  signal_state: string;
  images: {
    violation_full?: string | null;
    bike_crop?: string | null;
    plate_crop?: string | null;
    plate_processed?: string | null;
  };
}

/**
 * Validate API Key from request headers
 */
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return false;
  }
  
  return apiKey === UPLOAD_API_KEY;
}

/**
 * Upload base64 image to Cloudinary
 */
async function uploadImageToCloudinary(
  base64Data: string | null,
  folder: string,
  imageName: string
): Promise<string | null> {
  if (!base64Data) {
    return null;
  }

  try {
    let imageData = base64Data;
    if (!base64Data.startsWith('data:')) {
      imageData = `data:image/jpeg;base64,${base64Data}`;
    }

    const result = await uploadToCloudinary(imageData, folder);
    console.log(`✅ Uploaded ${imageName} to Cloudinary`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${imageName}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate API Key
    if (!validateApiKey(request)) {
      console.log('❌ Invalid or missing API key');
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          message: 'Unauthorized - Invalid or missing API key' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UploadPayload = await request.json();

    // Validate required fields
    const requiredFields = [
      'violation_id',
      'timestamp',
      'date',
      'time',
      'location',
      'vehicle',
      'violations',
      'total_fine',
    ];

    for (const field of requiredFields) {
      if (body[field as keyof UploadPayload] === undefined) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log(`\n📥 Received violation: ${body.violation_id}`);
    console.log(`   Plate: ${body.vehicle.license_plate}`);
    console.log(`   Violations: ${body.violations.map((v) => v.type).join(', ')}`);

    // Upload images to Cloudinary in parallel
    const imageFolder = `violations/${body.violation_id}`;

    console.log(`📤 Uploading images to Cloudinary...`);

    const [violationFullUrl, bikeCropUrl, plateCropUrl, plateProcessedUrl] =
      await Promise.all([
        uploadImageToCloudinary(
          body.images?.violation_full || null,
          imageFolder,
          'violation_full'
        ),
        uploadImageToCloudinary(
          body.images?.bike_crop || null,
          imageFolder,
          'bike_crop'
        ),
        uploadImageToCloudinary(
          body.images?.plate_crop || null,
          imageFolder,
          'plate_crop'
        ),
        uploadImageToCloudinary(
          body.images?.plate_processed || null,
          imageFolder,
          'plate_processed'
        ),
      ]);

    // Lookup vehicle owner from registry
    const licensePlate = body.vehicle.license_plate;
    let citizenInfo: {
      email: string | null;
      name: string | null;
      phone: string | null;
    } = {
      email: null,
      name: null,
      phone: null,
    };

    if (licensePlate && licensePlate !== 'UNKNOWN') {
      console.log(`🔍 Looking up owner for plate: ${licensePlate}`);
      const ownerInfo = lookupVehicleOwner(licensePlate);
      if (ownerInfo) {
        citizenInfo = {
          email: ownerInfo.email,
          name: ownerInfo.name,
          phone: ownerInfo.phone || null,
        };
        console.log(`   Found owner: ${citizenInfo.name} (${citizenInfo.email})`);
      } else {
        console.log(`   Owner not found in registry`);
      }
    }

    // Create violation document
    const violationData: Omit<Violation, 'id'> = {
      violation_id: body.violation_id,
      timestamp: body.timestamp,
      date: body.date,
      time: body.time,

      location: {
        junction_name: body.location.junction_name,
        camera_id: body.location.camera_id,
        coordinates: body.location.coordinates,
      },

      vehicle: {
        license_plate: body.vehicle.license_plate,
        ocr_confidence: body.vehicle.ocr_confidence || 0,
        plate_status: body.vehicle.plate_status || 'UNIDENTIFIED',
        num_riders: body.vehicle.num_riders || 1,
      },

      violations: body.violations.map((v) => ({
        type: v.type,
        description: v.description,
        fine_amount: v.fine_amount,
        severity: v.severity || 'MEDIUM',
      })),

      total_fine: body.total_fine,
      payment_status: 'PENDING',

      evidence: {
        violation_full: violationFullUrl,
        bike_crop: bikeCropUrl,
        plate_crop: plateCropUrl,
        plate_processed: plateProcessedUrl,
      },

      signal_state: body.signal_state || 'UNKNOWN',

      citizen_email: citizenInfo.email,
      citizen_name: citizenInfo.name,
      citizen_phone: citizenInfo.phone,

      notification_sent: false,

      created_at: Date.now(),
      updated_at: Date.now(),
    };

    // Save to Firestore
    console.log(`💾 Saving to Firestore...`);
    const docRef = await adminDb.collection('violations').add(violationData);
    console.log(`   Document ID: ${docRef.id}`);

    // Send notification email if citizen found
    let notificationSent = false;
    if (citizenInfo.email) {
      try {
        console.log(`📧 Sending notification to ${citizenInfo.email}...`);
        await sendViolationNotification(
          citizenInfo.email,
          citizenInfo.name || 'Vehicle Owner',
          {
            ...violationData,
            id: docRef.id,
          } as Violation
        );

        await docRef.update({ notification_sent: true });
        notificationSent = true;
        console.log(`   ✅ Notification sent successfully`);
      } catch (emailError) {
        console.error(`   ❌ Failed to send notification:`, emailError);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`\n✅ Violation processed in ${processingTime}ms`);
    console.log(`   ID: ${docRef.id}`);
    console.log(
      `   Images uploaded: ${[violationFullUrl, bikeCropUrl, plateCropUrl, plateProcessedUrl].filter(Boolean).length}/4`
    );
    console.log(`   Notification sent: ${notificationSent}`);

    return NextResponse.json<ApiResponse<{
  id: string;
  violation_id: string;
  notification_sent: boolean;
  processing_time_ms: number;
  images_uploaded: number;
}>>(
  {
    success: true,
    message: 'Violation recorded successfully',
    data: {
      id: docRef.id,
      violation_id: body.violation_id,
      notification_sent: notificationSent,
      processing_time_ms: processingTime,
      images_uploaded: [
        violationFullUrl,
        bikeCropUrl,
        plateCropUrl,
        plateProcessedUrl,
      ].filter(Boolean).length,
    },
  },
  { status: 201 }
);

  } catch (error) {
    console.error('❌ Upload violation error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for the upload API
export async function GET(request: NextRequest) {
  // Optionally validate API key for health check too
  const hasApiKey = validateApiKey(request);
  
  return NextResponse.json({
    success: true,
    message: 'Violations upload API is running',
    authenticated: hasApiKey,
    timestamp: new Date().toISOString(),
  });
}