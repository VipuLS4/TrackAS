import { supabase } from '../lib/supabase';

export interface AssignmentCandidate {
  candidateId: string;
  candidateType: 'fleet' | 'individual';
  score: number;
  vehicleType: string;
  proximityKm: number;
  reliabilityScore: number;
  acceptanceRate: number;
  fleetId?: string;
  vehicleId?: string;
  driverId?: string;
}

export interface AssignmentCycle {
  shipmentId: string;
  cycleNo: number;
  targetType: 'subscribed_fleets' | 'all_eligible';
  candidates: AssignmentCandidate[];
  status: 'active' | 'accepted' | 'rejected' | 'timeout';
  expiresAt: Date;
  selectedCandidate?: AssignmentCandidate;
}

export interface AssignmentResult {
  success: boolean;
  assignedTo?: AssignmentCandidate;
  cycleNo: number;
  reason?: string;
}

export class AssignmentService {
  private static instance: AssignmentService;
  private readonly CYCLE_DURATION = 120; // 2 minutes in seconds
  private readonly MAX_RETRIES = 3;

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  // Main assignment function
  async assignShipment(shipmentId: string): Promise<AssignmentResult> {
    try {
      // Get shipment details
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Update status to PUBLISHED
      await this.updateShipmentStatus(shipmentId, 'PUBLISHED');

      // Phase 1: Subscribed Fleets
      const subscribedResult = await this.runAssignmentCycle(
        shipmentId,
        1,
        'subscribed_fleets',
        shipment
      );

      if (subscribedResult.success) {
        return subscribedResult;
      }

      // Phase 2: All Eligible (FCFS)
      const allEligibleResult = await this.runAssignmentCycle(
        shipmentId,
        2,
        'all_eligible',
        shipment
      );

      if (allEligibleResult.success) {
        return allEligibleResult;
      }

      // Phase 3: Dynamic Pricing Escalation
      return await this.escalatePriceAndRetry(shipmentId, shipment);

    } catch (error) {
      console.error('Error in assignment:', error);
      await this.updateShipmentStatus(shipmentId, 'FAILED');
      return { success: false, cycleNo: 0, reason: 'Assignment failed' };
    }
  }

  // Run assignment cycle
  private async runAssignmentCycle(
    shipmentId: string,
    cycleNo: number,
    targetType: 'subscribed_fleets' | 'all_eligible',
    shipment: any
  ): Promise<AssignmentResult> {
    try {
      // Find candidates
      const candidates = await this.findCandidates(shipmentId, targetType);
      
      if (candidates.length === 0) {
        return { success: false, cycleNo, reason: 'No eligible candidates found' };
      }

      // Create assignment cycle record
      const cycleId = await this.createAssignmentCycle(shipmentId, cycleNo, targetType, candidates);

      if (targetType === 'subscribed_fleets') {
        // Sequential assignment for subscribed fleets
        return await this.runSequentialAssignment(shipmentId, cycleId, candidates);
      } else {
        // FCFS assignment for all eligible
        return await this.runFCFSAssignment(shipmentId, cycleId, candidates);
      }
    } catch (error) {
      console.error('Error in assignment cycle:', error);
      return { success: false, cycleNo, reason: 'Cycle failed' };
    }
  }

  // Sequential assignment (for subscribed fleets)
  private async runSequentialAssignment(
    shipmentId: string,
    cycleId: string,
    candidates: AssignmentCandidate[]
  ): Promise<AssignmentResult> {
    for (const candidate of candidates) {
      try {
        // Send request to candidate
        await this.sendAssignmentRequest(shipmentId, candidate);
        
        // Wait for response or timeout
        const response = await this.waitForResponse(shipmentId, candidate.candidateId, this.CYCLE_DURATION);
        
        if (response.accepted) {
          // Update assignment cycle
          await this.updateAssignmentCycle(cycleId, 'accepted', candidate);
          
          // Assign shipment
          await this.assignShipmentToCandidate(shipmentId, candidate);
          
          return { success: true, assignedTo: candidate, cycleNo: 1 };
        }
        
        // Candidate rejected or timed out, continue to next
        await this.updateAssignmentCycle(cycleId, 'rejected', candidate);
        
      } catch (error) {
        console.error('Error in sequential assignment:', error);
        continue;
      }
    }
    
    return { success: false, cycleNo: 1, reason: 'No candidates accepted' };
  }

  // FCFS assignment (for all eligible)
  private async runFCFSAssignment(
    shipmentId: string,
    cycleId: string,
    candidates: AssignmentCandidate[]
  ): Promise<AssignmentResult> {
    try {
      // Send requests to all candidates simultaneously
      const promises = candidates.map(candidate => 
        this.sendAssignmentRequest(shipmentId, candidate)
      );
      
      await Promise.all(promises);
      
      // Wait for first acceptance
      const response = await this.waitForFirstAcceptance(shipmentId, candidates, this.CYCLE_DURATION);
      
      if (response.accepted && response.candidate) {
        // Update assignment cycle
        await this.updateAssignmentCycle(cycleId, 'accepted', response.candidate);
        
        // Assign shipment
        await this.assignShipmentToCandidate(shipmentId, response.candidate);
        
        return { success: true, assignedTo: response.candidate, cycleNo: 2 };
      }
      
      return { success: false, cycleNo: 2, reason: 'No candidates accepted' };
      
    } catch (error) {
      console.error('Error in FCFS assignment:', error);
      return { success: false, cycleNo: 2, reason: 'FCFS assignment failed' };
    }
  }

  // Dynamic pricing escalation
  private async escalatePriceAndRetry(shipmentId: string, shipment: any): Promise<AssignmentResult> {
    try {
      const escalationSteps = [10, 20, 30]; // Percentage increases
      const currentRetryCount = shipment.retry_count || 0;
      
      if (currentRetryCount >= this.MAX_RETRIES) {
        await this.updateShipmentStatus(shipmentId, 'ESCALATED_TO_ADMIN');
        return { success: false, cycleNo: 3, reason: 'Escalated to admin' };
      }
      
      const escalationPercentage = escalationSteps[currentRetryCount] || 30;
      const newPrice = shipment.price_submitted * (1 + escalationPercentage / 100);
      
      // Update shipment with new price
      await this.updateShipmentPrice(shipmentId, newPrice, currentRetryCount + 1);
      
      // Notify shipper about price escalation
      await this.notifyShipperAboutEscalation(shipmentId, newPrice, escalationPercentage);
      
      // Wait for shipper response (this would be handled by UI)
      // For now, return escalation required
      return { 
        success: false, 
        cycleNo: 3, 
        reason: `Price escalation required: +${escalationPercentage}%` 
      };
      
    } catch (error) {
      console.error('Error in price escalation:', error);
      return { success: false, cycleNo: 3, reason: 'Escalation failed' };
    }
  }

  // Find eligible candidates
  private async findCandidates(
    shipmentId: string,
    targetType: 'subscribed_fleets' | 'all_eligible'
  ): Promise<AssignmentCandidate[]> {
    try {
      const { data, error } = await supabase.rpc('find_shipment_candidates', {
        p_shipment_id: shipmentId,
        p_candidate_type: targetType
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error finding candidates:', error);
      return [];
    }
  }

  // Create assignment cycle record
  private async createAssignmentCycle(
    shipmentId: string,
    cycleNo: number,
    targetType: 'subscribed_fleets' | 'all_eligible',
    candidates: AssignmentCandidate[]
  ): Promise<string> {
    try {
      const expiresAt = new Date(Date.now() + this.CYCLE_DURATION * 1000);
      
      const { data, error } = await supabase
        .from('shipment_bids_requests')
        .insert({
          shipment_id: shipmentId,
          cycle_no: cycleNo,
          target_type: targetType,
          candidates_list: candidates,
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating assignment cycle:', error);
      throw error;
    }
  }

  // Send assignment request to candidate
  private async sendAssignmentRequest(
    shipmentId: string,
    candidate: AssignmentCandidate
  ): Promise<void> {
    try {
      // Create notification for the candidate
      await this.createNotification(
        candidate.candidateId,
        shipmentId,
        'PUSH',
        'New Shipment Assignment',
        `You have a new shipment assignment request. Respond within 2 minutes.`,
        { candidateType: candidate.candidateType }
      );

      // Log the request
      await this.createShipmentEvent(
        shipmentId,
        'ASSIGNMENT_REQUEST_SENT',
        null,
        'system',
        { candidateId: candidate.candidateId, candidateType: candidate.candidateType }
      );

    } catch (error) {
      console.error('Error sending assignment request:', error);
      throw error;
    }
  }

  // Wait for response from candidate
  private async waitForResponse(
    shipmentId: string,
    candidateId: string,
    timeoutSeconds: number
  ): Promise<{ accepted: boolean; candidate?: AssignmentCandidate }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ accepted: false });
      }, timeoutSeconds * 1000);

      // In production, this would use WebSocket or Redis pub/sub
      // For now, simulate with a mock response
      this.simulateCandidateResponse(shipmentId, candidateId, timeout, resolve);
    });
  }

  // Wait for first acceptance in FCFS
  private async waitForFirstAcceptance(
    shipmentId: string,
    candidates: AssignmentCandidate[],
    timeoutSeconds: number
  ): Promise<{ accepted: boolean; candidate?: AssignmentCandidate }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ accepted: false });
      }, timeoutSeconds * 1000);

      // Simulate first acceptance
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setTimeout(() => {
        clearTimeout(timeout);
        resolve({ accepted: true, candidate: randomCandidate });
      }, Math.random() * timeoutSeconds * 1000);
    });
  }

  // Simulate candidate response (for development)
  private simulateCandidateResponse(
    shipmentId: string,
    candidateId: string,
    timeout: NodeJS.Timeout,
    resolve: (value: any) => void
  ): void {
    // Simulate random response time and acceptance rate
    const responseTime = Math.random() * 100000; // Random response within timeout
    const acceptanceRate = 0.7; // 70% acceptance rate
    
    setTimeout(() => {
      clearTimeout(timeout);
      const accepted = Math.random() < acceptanceRate;
      resolve({ accepted });
    }, responseTime);
  }

  // Assign shipment to candidate
  private async assignShipmentToCandidate(
    shipmentId: string,
    candidate: AssignmentCandidate
  ): Promise<void> {
    try {
      const updateData: any = {
        status: 'ASSIGNED',
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (candidate.candidateType === 'fleet') {
        updateData.assigned_fleet_id = candidate.fleetId;
        updateData.assigned_vehicle_id = candidate.vehicleId;
        updateData.assigned_driver_id = candidate.driverId;
      } else {
        updateData.assigned_vehicle_id = candidate.vehicleId;
        updateData.assigned_driver_id = candidate.driverId;
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId);

      if (error) throw error;

      // Create assignment event
      await this.createShipmentEvent(
        shipmentId,
        'ASSIGNED',
        null,
        'system',
        { 
          candidateId: candidate.candidateId,
          candidateType: candidate.candidateType,
          score: candidate.score
        }
      );

      // Notify shipper about assignment
      await this.notifyShipperAboutAssignment(shipmentId, candidate);

    } catch (error) {
      console.error('Error assigning shipment:', error);
      throw error;
    }
  }

  // Update assignment cycle
  private async updateAssignmentCycle(
    cycleId: string,
    status: 'accepted' | 'rejected' | 'timeout',
    selectedCandidate?: AssignmentCandidate
  ): Promise<void> {
    try {
      const updateData: any = { status };
      if (selectedCandidate) {
        updateData.selected_candidate = selectedCandidate.candidateId;
      }

      const { error } = await supabase
        .from('shipment_bids_requests')
        .update(updateData)
        .eq('id', cycleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating assignment cycle:', error);
    }
  }

  // Update shipment status
  private async updateShipmentStatus(shipmentId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_shipment_status', {
        p_shipment_id: shipmentId,
        p_status: status
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shipment status:', error);
    }
  }

  // Update shipment price
  private async updateShipmentPrice(
    shipmentId: string,
    newPrice: number,
    retryCount: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          price_submitted: newPrice,
          retry_count: retryCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shipment price:', error);
    }
  }

  // Get shipment details
  private async getShipment(shipmentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting shipment:', error);
      return null;
    }
  }

  // Create shipment event
  private async createShipmentEvent(
    shipmentId: string,
    eventType: string,
    actorId: string | null,
    actorType: string,
    metadata: any
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_shipment_event', {
        p_shipment_id: shipmentId,
        p_event_type: eventType,
        p_actor_id: actorId,
        p_actor_type: actorType,
        p_metadata: metadata
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating shipment event:', error);
    }
  }

  // Create notification
  private async createNotification(
    userId: string,
    shipmentId: string,
    type: string,
    title: string,
    message: string,
    data: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          shipment_id: shipmentId,
          notification_type: type,
          title,
          message,
          data
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Notify shipper about assignment
  private async notifyShipperAboutAssignment(
    shipmentId: string,
    candidate: AssignmentCandidate
  ): Promise<void> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) return;

      await this.createNotification(
        shipment.shipper_id,
        shipmentId,
        'EMAIL',
        'Shipment Assigned',
        `Your shipment has been assigned to ${candidate.candidateType === 'fleet' ? 'fleet' : 'driver'}. You will receive pickup notifications soon.`,
        { candidateType: candidate.candidateType }
      );
    } catch (error) {
      console.error('Error notifying shipper:', error);
    }
  }

  // Notify shipper about price escalation
  private async notifyShipperAboutEscalation(
    shipmentId: string,
    newPrice: number,
    escalationPercentage: number
  ): Promise<void> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) return;

      await this.createNotification(
        shipment.shipper_id,
        shipmentId,
        'EMAIL',
        'Price Escalation Required',
        `No drivers accepted your shipment at the current price. We recommend increasing the price by ${escalationPercentage}% to ₹${newPrice}. Please accept or cancel.`,
        { newPrice, escalationPercentage }
      );
    } catch (error) {
      console.error('Error notifying shipper about escalation:', error);
    }
  }

  // Handle candidate acceptance
  async handleCandidateAcceptance(
    shipmentId: string,
    candidateId: string,
    accepted: boolean
  ): Promise<void> {
    try {
      if (accepted) {
        // Find the candidate and assign
        const candidates = await this.findCandidates(shipmentId, 'all_eligible');
        const candidate = candidates.find(c => c.candidateId === candidateId);
        
        if (candidate) {
          await this.assignShipmentToCandidate(shipmentId, candidate);
        }
      } else {
        // Log rejection
        await this.createShipmentEvent(
          shipmentId,
          'CANDIDATE_REJECTED',
          candidateId,
          'fleet',
          { candidateId }
        );
      }
    } catch (error) {
      console.error('Error handling candidate acceptance:', error);
    }
  }
}

export default AssignmentService;