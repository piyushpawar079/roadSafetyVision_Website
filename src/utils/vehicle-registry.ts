// ===========================================
// VEHICLE REGISTRY UTILITY
// Lookup vehicle owner information by license plate
// ===========================================

import fs from 'fs';
import path from 'path';

export interface VehicleOwner {
  license_plate: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vehicle_type?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  registration_date?: string;
}

interface VehicleRegistry {
  vehicles: VehicleOwner[];
  last_updated: string;
}

// Cache for vehicle registry data
let registryCache: VehicleRegistry | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load vehicle registry from JSON file
 */
function loadRegistry(): VehicleRegistry {
  const now = Date.now();
  
  // Return cached data if still valid
  if (registryCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return registryCache;
  }
  
  try {
    const registryPath = path.join(process.cwd(), 'data', 'vehicle-registry.json');
    
    // Check if file exists
    if (!fs.existsSync(registryPath)) {
      console.warn('Vehicle registry file not found, creating empty registry');
      
      // Create empty registry
      const emptyRegistry: VehicleRegistry = {
        vehicles: [{
      "license_plate": "MH01EL2733",
      "name": "Om Deshmukh",
      "email": "omdeshmukh.in@gmail.com",
      "phone": "+91 8369724186",
      "address": "123 Main Street, Mumbai, Maharashtra 400001",
      "vehicle_type": "Two Wheeler",
      "vehicle_make": "Honda",
      "vehicle_model": "Activa 6G",
      "vehicle_color": "White",
      "registration_date": "2022-03-15"
    }],
        last_updated: new Date().toISOString(),
      };
      
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(registryPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Write empty registry
      fs.writeFileSync(registryPath, JSON.stringify(emptyRegistry, null, 2));
      
      registryCache = emptyRegistry;
      cacheTimestamp = now;
      return emptyRegistry;
    }
    
    // Read and parse registry file
    const fileContent = fs.readFileSync(registryPath, 'utf-8');
    const registry: VehicleRegistry = JSON.parse(fileContent);
    
    // Update cache
    registryCache = registry;
    cacheTimestamp = now;
    
    return registry;
  } catch (error) {
    console.error('Error loading vehicle registry:', error);
    
    // Return empty registry on error
    return {
      vehicles: [],
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Lookup vehicle owner by license plate
 * @param licensePlate - The license plate to search for
 * @returns Vehicle owner information or null if not found
 */
export function lookupVehicleOwner(licensePlate: string): VehicleOwner | null {
  if (!licensePlate || licensePlate === 'UNKNOWN') {
    return null;
  }
  
  const registry = loadRegistry();
  
  // Normalize the license plate for comparison
  const normalizedPlate = licensePlate
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  // Search for the vehicle
  const vehicle = registry.vehicles.find((v) => {
    const registryPlate = v.license_plate
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    return registryPlate === normalizedPlate;
  });
  
  return vehicle || null;
}

/**
 * Add or update vehicle in registry
 * @param vehicleData - Vehicle owner data
 */
export function addOrUpdateVehicle(vehicleData: VehicleOwner): boolean {
  try {
    const registryPath = path.join(process.cwd(), 'data', 'vehicle-registry.json');
    const registry = loadRegistry();
    
    // Normalize the license plate
    const normalizedPlate = vehicleData.license_plate
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    // Find existing vehicle index
    const existingIndex = registry.vehicles.findIndex((v) => {
      const registryPlate = v.license_plate
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      return registryPlate === normalizedPlate;
    });
    
    if (existingIndex >= 0) {
      // Update existing vehicle
      registry.vehicles[existingIndex] = {
        ...registry.vehicles[existingIndex],
        ...vehicleData,
        license_plate: normalizedPlate,
      };
    } else {
      // Add new vehicle
      registry.vehicles.push({
        ...vehicleData,
        license_plate: normalizedPlate,
      });
    }
    
    // Update timestamp
    registry.last_updated = new Date().toISOString();
    
    // Write to file
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    
    // Invalidate cache
    registryCache = null;
    
    return true;
  } catch (error) {
    console.error('Error updating vehicle registry:', error);
    return false;
  }
}

/**
 * Remove vehicle from registry
 * @param licensePlate - The license plate to remove
 */
export function removeVehicle(licensePlate: string): boolean {
  try {
    const registryPath = path.join(process.cwd(), 'data', 'vehicle-registry.json');
    const registry = loadRegistry();
    
    const normalizedPlate = licensePlate
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    const initialLength = registry.vehicles.length;
    registry.vehicles = registry.vehicles.filter((v) => {
      const registryPlate = v.license_plate
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      return registryPlate !== normalizedPlate;
    });
    
    if (registry.vehicles.length === initialLength) {
      return false; // Vehicle not found
    }
    
    registry.last_updated = new Date().toISOString();
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    
    // Invalidate cache
    registryCache = null;
    
    return true;
  } catch (error) {
    console.error('Error removing vehicle from registry:', error);
    return false;
  }
}

/**
 * Get all vehicles in registry
 */
export function getAllVehicles(): VehicleOwner[] {
  const registry = loadRegistry();
  return registry.vehicles;
}

/**
 * Search vehicles by partial plate or owner name
 * @param query - Search query
 */
export function searchVehicles(query: string): VehicleOwner[] {
  const registry = loadRegistry();
  const normalizedQuery = query.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  return registry.vehicles.filter((v) => {
    const normalizedPlate = v.license_plate
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const normalizedName = v.name.toUpperCase();
    
    return (
      normalizedPlate.includes(normalizedQuery) ||
      normalizedName.includes(query.toUpperCase())
    );
  });
}