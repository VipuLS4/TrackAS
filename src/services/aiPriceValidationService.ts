import { supabase } from '../lib/supabase';

export interface PriceValidationInput {
  pickupLocation: { lat: number; lng: number; address: string };
  dropLocation: { lat: number; lng: number; address: string };
  consignmentDetails: {
    weight: number;
    volume: number;
    dimensions?: { length: number; width: number; height: number };
    items: string;
    description: string;
  };
  vehicleType?: string;
  urgency: 'normal' | 'express';
  insuranceRequired: boolean;
  preferredPickupWindow?: { start: string; end: string };
  preferredDeliveryWindow?: { start: string; end: string };
}

export interface PriceValidationResult {
  recommendedPrice: number;
  confidenceScore: number; // 0.00 to 1.00
  priceFlag: 'OK' | 'LOW' | 'TOO_HIGH';
  breakdown: {
    basePrice: number;
    distanceMultiplier: number;
    urgencyMultiplier: number;
    vehicleTypeMultiplier: number;
    insuranceMultiplier: number;
    demandMultiplier: number;
  };
  factors: {
    distance: number; // km
    estimatedDuration: number; // hours
    routeComplexity: 'low' | 'medium' | 'high';
    demandLevel: 'low' | 'medium' | 'high';
    historicalAverage: number;
  };
}

export interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
  complexity: 'low' | 'medium' | 'high';
  tolls: number;
  fuelCost: number;
}

export class AIPriceValidationService {
  private static instance: AIPriceValidationService;

  public static getInstance(): AIPriceValidationService {
    if (!AIPriceValidationService.instance) {
      AIPriceValidationService.instance = new AIPriceValidationService();
    }
    return AIPriceValidationService.instance;
  }

  // Main price validation function
  async validatePrice(
    submittedPrice: number,
    input: PriceValidationInput
  ): Promise<PriceValidationResult> {
    try {
      // Get route information
      const routeInfo = await this.getRouteInfo(input.pickupLocation, input.dropLocation);
      
      // Get demand signal
      const demandLevel = await this.getDemandSignal(input.pickupLocation, input.dropLocation);
      
      // Get historical rates for similar routes
      const historicalAverage = await this.getHistoricalRates(routeInfo.distance, input.vehicleType);
      
      // Calculate recommended price
      const recommendedPrice = await this.calculateRecommendedPrice(input, routeInfo, demandLevel, historicalAverage);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(routeInfo, demandLevel, historicalAverage);
      
      // Determine price flag
      const priceFlag = this.determinePriceFlag(submittedPrice, recommendedPrice, confidenceScore);
      
      // Calculate breakdown
      const breakdown = this.calculatePriceBreakdown(input, routeInfo, demandLevel);
      
      // Get factors
      const factors = {
        distance: routeInfo.distance,
        estimatedDuration: routeInfo.duration / 60, // Convert to hours
        routeComplexity: routeInfo.complexity,
        demandLevel,
        historicalAverage
      };

      return {
        recommendedPrice,
        confidenceScore,
        priceFlag,
        breakdown,
        factors
      };
    } catch (error) {
      console.error('Error in price validation:', error);
      throw new Error('Price validation failed');
    }
  }

  // Get route information using external API
  private async getRouteInfo(
    pickup: { lat: number; lng: number },
    drop: { lat: number; lng: number }
  ): Promise<RouteInfo> {
    try {
      // In production, integrate with Google Maps API, Mapbox, or similar
      const mockRouteInfo = await this.mockRouteCalculation(pickup, drop);
      return mockRouteInfo;
    } catch (error) {
      console.error('Error getting route info:', error);
      // Fallback calculation
      return this.calculateFallbackRoute(pickup, drop);
    }
  }

  // Get demand signal for the route
  private async getDemandSignal(
    pickup: { lat: number; lng: number },
    drop: { lat: number; lng: number }
  ): Promise<'low' | 'medium' | 'high'> {
    try {
      // Query active shipments in similar routes
      const { data: activeShipments, error } = await supabase
        .from('shipments')
        .select('id, status, created_at')
        .in('status', ['PUBLISHED', 'PENDING_ASSIGN', 'ASSIGNED'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) throw error;

      const activeCount = activeShipments?.length || 0;
      
      if (activeCount < 5) return 'low';
      if (activeCount < 15) return 'medium';
      return 'high';
    } catch (error) {
      console.error('Error getting demand signal:', error);
      return 'medium'; // Default to medium
    }
  }

  // Get historical rates for similar routes
  private async getHistoricalRates(
    distance: number,
    vehicleType?: string
  ): Promise<number> {
    try {
      // Query completed shipments with similar distance
      const { data: historicalShipments, error } = await supabase
        .from('shipments')
        .select('price_submitted, created_at')
        .eq('status', 'DELIVERED')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(100);

      if (error) throw error;

      if (!historicalShipments || historicalShipments.length === 0) {
        // Return base rate calculation if no historical data
        return this.calculateBaseRate(distance, vehicleType);
      }

      // Calculate average price per km
      const totalPrice = historicalShipments.reduce((sum, shipment) => sum + parseFloat(shipment.price_submitted), 0);
      const avgPricePerKm = totalPrice / historicalShipments.length / distance;
      
      return avgPricePerKm * distance;
    } catch (error) {
      console.error('Error getting historical rates:', error);
      return this.calculateBaseRate(distance, vehicleType);
    }
  }

  // Calculate recommended price
  private async calculateRecommendedPrice(
    input: PriceValidationInput,
    routeInfo: RouteInfo,
    demandLevel: 'low' | 'medium' | 'high',
    historicalAverage: number
  ): Promise<number> {
    // Base calculation
    let basePrice = this.calculateBaseRate(routeInfo.distance, input.vehicleType);
    
    // Apply multipliers
    const distanceMultiplier = this.getDistanceMultiplier(routeInfo.distance);
    const urgencyMultiplier = input.urgency === 'express' ? 1.5 : 1.0;
    const vehicleTypeMultiplier = this.getVehicleTypeMultiplier(input.vehicleType);
    const insuranceMultiplier = input.insuranceRequired ? 1.1 : 1.0;
    const demandMultiplier = this.getDemandMultiplier(demandLevel);
    const complexityMultiplier = this.getComplexityMultiplier(routeInfo.complexity);
    
    // Calculate final price
    const recommendedPrice = basePrice * 
      distanceMultiplier * 
      urgencyMultiplier * 
      vehicleTypeMultiplier * 
      insuranceMultiplier * 
      demandMultiplier * 
      complexityMultiplier;
    
    // Blend with historical average (70% calculated, 30% historical)
    const finalPrice = (recommendedPrice * 0.7) + (historicalAverage * 0.3);
    
    return Math.round(finalPrice);
  }

  // Calculate confidence score
  private calculateConfidenceScore(
    routeInfo: RouteInfo,
    demandLevel: 'low' | 'medium' | 'high',
    historicalAverage: number
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Route complexity factor
    if (routeInfo.complexity === 'low') confidence += 0.2;
    else if (routeInfo.complexity === 'medium') confidence += 0.1;
    
    // Demand level factor
    if (demandLevel === 'medium') confidence += 0.1;
    else if (demandLevel === 'high') confidence += 0.2;
    
    // Historical data availability
    if (historicalAverage > 0) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  // Determine price flag
  private determinePriceFlag(
    submittedPrice: number,
    recommendedPrice: number,
    confidenceScore: number
  ): 'OK' | 'LOW' | 'TOO_HIGH' {
    const priceDifference = Math.abs(submittedPrice - recommendedPrice) / recommendedPrice;
    
    if (priceDifference < 0.1) return 'OK'; // Within 10%
    
    if (submittedPrice < recommendedPrice * 0.8) return 'LOW'; // More than 20% below
    if (submittedPrice > recommendedPrice * 1.3) return 'TOO_HIGH'; // More than 30% above
    
    return 'OK';
  }

  // Calculate price breakdown
  private calculatePriceBreakdown(
    input: PriceValidationInput,
    routeInfo: RouteInfo,
    demandLevel: 'low' | 'medium' | 'high'
  ) {
    const basePrice = this.calculateBaseRate(routeInfo.distance, input.vehicleType);
    
    return {
      basePrice,
      distanceMultiplier: this.getDistanceMultiplier(routeInfo.distance),
      urgencyMultiplier: input.urgency === 'express' ? 1.5 : 1.0,
      vehicleTypeMultiplier: this.getVehicleTypeMultiplier(input.vehicleType),
      insuranceMultiplier: input.insuranceRequired ? 1.1 : 1.0,
      demandMultiplier: this.getDemandMultiplier(demandLevel)
    };
  }

  // Helper functions
  private calculateBaseRate(distance: number, vehicleType?: string): number {
    const baseRatePerKm = this.getBaseRatePerKm(vehicleType);
    return distance * baseRatePerKm;
  }

  private getBaseRatePerKm(vehicleType?: string): number {
    switch (vehicleType) {
      case 'truck': return 25; // ₹25 per km
      case 'van': return 20; // ₹20 per km
      case 'tempo': return 18; // ₹18 per km
      case 'container': return 35; // ₹35 per km
      case 'trailer': return 40; // ₹40 per km
      default: return 22; // Default rate
    }
  }

  private getDistanceMultiplier(distance: number): number {
    if (distance < 50) return 1.2; // Short distance premium
    if (distance < 200) return 1.0; // Standard rate
    if (distance < 500) return 0.9; // Long distance discount
    return 0.8; // Very long distance discount
  }

  private getVehicleTypeMultiplier(vehicleType?: string): number {
    switch (vehicleType) {
      case 'truck': return 1.0;
      case 'van': return 0.8;
      case 'tempo': return 0.7;
      case 'container': return 1.3;
      case 'trailer': return 1.5;
      default: return 1.0;
    }
  }

  private getDemandMultiplier(demandLevel: 'low' | 'medium' | 'high'): number {
    switch (demandLevel) {
      case 'low': return 0.9;
      case 'medium': return 1.0;
      case 'high': return 1.2;
    }
  }

  private getComplexityMultiplier(complexity: 'low' | 'medium' | 'high'): number {
    switch (complexity) {
      case 'low': return 1.0;
      case 'medium': return 1.1;
      case 'high': return 1.3;
    }
  }

  // Mock functions for development
  private async mockRouteCalculation(
    pickup: { lat: number; lng: number },
    drop: { lat: number; lng: number }
  ): Promise<RouteInfo> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    
    // Estimate duration (assuming average speed of 40 km/h)
    const duration = (distance / 40) * 60; // Convert to minutes
    
    // Determine complexity based on distance and location
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (distance > 300) complexity = 'high';
    else if (distance > 100) complexity = 'medium';
    
    // Mock tolls and fuel cost
    const tolls = distance * 0.5; // ₹0.5 per km
    const fuelCost = distance * 2.0; // ₹2 per km
    
    return {
      distance,
      duration,
      complexity,
      tolls,
      fuelCost
    };
  }

  private calculateFallbackRoute(
    pickup: { lat: number; lng: number },
    drop: { lat: number; lng: number }
  ): RouteInfo {
    const distance = this.calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    const duration = (distance / 40) * 60;
    
    return {
      distance,
      duration,
      complexity: distance > 200 ? 'high' : distance > 100 ? 'medium' : 'low',
      tolls: distance * 0.5,
      fuelCost: distance * 2.0
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Log price validation decision for auditing
  async logPriceValidation(
    shipmentId: string,
    submittedPrice: number,
    result: PriceValidationResult
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('shipment_events')
        .insert({
          shipment_id: shipmentId,
          event_type: 'PRICE_VALIDATION',
          actor_type: 'system',
          metadata: {
            submitted_price: submittedPrice,
            recommended_price: result.recommendedPrice,
            confidence_score: result.confidenceScore,
            price_flag: result.priceFlag,
            breakdown: result.breakdown,
            factors: result.factors
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging price validation:', error);
    }
  }
}

export default AIPriceValidationService;
