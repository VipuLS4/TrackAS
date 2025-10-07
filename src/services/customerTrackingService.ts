import { supabase } from '../lib/supabase';

export interface TrackingToken {
  id: string;
  shipmentId: string;
  token: string;
  recipientPhone: string;
  recipientEmail?: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingData {
  shipment: {
    id: string;
    shipperName: string;
    consignmentDetails: {
      items: string;
      weight: number;
      volume: number;
      description: string;
    };
    pickupLocation: {
      address: string;
      city: string;
      state: string;
      coordinates: { lat: number; lng: number };
    };
    deliveryLocation: {
      address: string;
      city: string;
      state: string;
      coordinates: { lat: number; lng: number };
    };
    status: string;
    currentLocation?: {
      lat: number;
      lng: number;
      address: string;
    };
    eta?: string;
    actualDeliveryTime?: string;
    createdAt: string;
    updatedAt: string;
  };
  driver: {
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    rating: number;
    photo?: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    location?: string;
    description: string;
    completed: boolean;
  }>;
  pod?: {
    images: string[];
    signature: string;
    deliveryTime: string;
    notes?: string;
  };
}

export interface FeedbackSubmission {
  shipmentId: string;
  rating: number;
  comments: string;
  categories: {
    timeliness: number;
    communication: number;
    handling: number;
    overall: number;
  };
  submittedAt: string;
}

export class CustomerTrackingService {
  private static instance: CustomerTrackingService;
  private readonly TOKEN_EXPIRY_HOURS = 72; // 3 days
  private readonly BASE_URL = process.env.REACT_APP_BASE_URL || 'https://trackas.com';

  public static getInstance(): CustomerTrackingService {
    if (!CustomerTrackingService.instance) {
      CustomerTrackingService.instance = new CustomerTrackingService();
    }
    return CustomerTrackingService.instance;
  }

  // Generate unique tracking token
  async generateTrackingToken(
    shipmentId: string,
    recipientPhone: string,
    recipientEmail?: string
  ): Promise<TrackingToken> {
    try {
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

      const { data, error } = await supabase
        .from('tracking_tokens')
        .insert({
          shipment_id: shipmentId,
          token,
          recipient_phone: recipientPhone,
          recipient_email: recipientEmail,
          expires_at: expiresAt.toISOString(),
          is_used: false
        })
        .select()
        .single();

      if (error) throw error;

      // Send tracking link via SMS/WhatsApp/Email
      await this.sendTrackingLink(data, recipientPhone, recipientEmail);

      return data;
    } catch (error) {
      console.error('Error generating tracking token:', error);
      throw new Error('Failed to generate tracking token');
    }
  }

  // Validate tracking token and get shipment data
  async validateTokenAndGetData(token: string): Promise<TrackingData> {
    try {
      // Validate token
      const { data: tokenData, error: tokenError } = await supabase
        .from('tracking_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .single();

      if (tokenError) throw tokenError;

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Tracking link has expired');
      }

      // Get shipment data
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          shipper:shipper_profiles(name),
          assigned_fleet:fleet_profiles(name),
          assigned_driver:drivers(name, phone, rating, photo),
          assigned_vehicle:vehicles(type, registration_number)
        `)
        .eq('id', tokenData.shipment_id)
        .single();

      if (shipmentError) throw shipmentError;

      // Get status timeline
      const { data: timelineData, error: timelineError } = await supabase
        .from('shipment_events')
        .select('*')
        .eq('shipment_id', tokenData.shipment_id)
        .order('created_at', { ascending: true });

      if (timelineError) throw timelineError;

      // Get POD data if delivered
      let podData = null;
      if (shipmentData.status === 'DELIVERED') {
        const { data: pod, error: podError } = await supabase
          .from('shipment_pod')
          .select('*')
          .eq('shipment_id', tokenData.shipment_id)
          .single();

        if (!podError && pod) {
          podData = pod;
        }
      }

      // Get current location if in transit
      let currentLocation = null;
      if (shipmentData.status === 'IN_TRANSIT') {
        const { data: location, error: locationError } = await supabase
          .from('shipment_locations')
          .select('*')
          .eq('shipment_id', tokenData.shipment_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!locationError && location) {
          currentLocation = {
            lat: location.latitude,
            lng: location.longitude,
            address: location.address
          };
        }
      }

      // Format response
      const trackingData: TrackingData = {
        shipment: {
          id: shipmentData.id,
          shipperName: shipmentData.shipper?.name || 'Unknown Shipper',
          consignmentDetails: {
            items: shipmentData.consignment_details?.items || 'Package',
            weight: shipmentData.consignment_details?.weight || 0,
            volume: shipmentData.consignment_details?.volume || 0,
            description: shipmentData.consignment_details?.description || ''
          },
          pickupLocation: {
            address: shipmentData.pickup_address,
            city: shipmentData.pickup_city,
            state: shipmentData.pickup_state,
            coordinates: {
              lat: shipmentData.pickup_latitude,
              lng: shipmentData.pickup_longitude
            }
          },
          deliveryLocation: {
            address: shipmentData.delivery_address,
            city: shipmentData.delivery_city,
            state: shipmentData.delivery_state,
            coordinates: {
              lat: shipmentData.delivery_latitude,
              lng: shipmentData.delivery_longitude
            }
          },
          status: shipmentData.status,
          currentLocation,
          eta: shipmentData.eta,
          actualDeliveryTime: shipmentData.actual_delivery_time,
          createdAt: shipmentData.created_at,
          updatedAt: shipmentData.updated_at
        },
        driver: {
          name: shipmentData.assigned_driver?.name || 'Driver Not Assigned',
          phone: shipmentData.assigned_driver?.phone || '',
          vehicleType: shipmentData.assigned_vehicle?.type || 'Vehicle',
          vehicleNumber: shipmentData.assigned_vehicle?.registration_number || '',
          rating: shipmentData.assigned_driver?.rating || 0,
          photo: shipmentData.assigned_driver?.photo
        },
        timeline: this.formatTimeline(timelineData),
        pod: podData ? {
          images: podData.images || [],
          signature: podData.signature || '',
          deliveryTime: podData.delivery_time,
          notes: podData.notes
        } : undefined
      };

      // Mark token as used
      await this.markTokenAsUsed(tokenData.id);

      return trackingData;
    } catch (error) {
      console.error('Error validating token and getting data:', error);
      throw error;
    }
  }

  // Submit anonymous feedback
  async submitFeedback(feedback: FeedbackSubmission): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .insert({
          shipment_id: feedback.shipmentId,
          rating: feedback.rating,
          comments: feedback.comments,
          categories: feedback.categories,
          submitted_at: feedback.submittedAt,
          is_anonymous: true
        });

      if (error) throw error;

      // Update driver and fleet ratings
      await this.updateRatings(feedback.shipmentId, feedback.rating, feedback.categories);

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  }

  // Send tracking link via SMS/WhatsApp/Email
  private async sendTrackingLink(
    tokenData: TrackingToken,
    phone: string,
    email?: string
  ): Promise<void> {
    const trackingUrl = `${this.BASE_URL}/track?token=${tokenData.token}`;
    
    try {
      // Send SMS
      await this.sendSMS(phone, trackingUrl);
      
      // Send WhatsApp if available
      await this.sendWhatsApp(phone, trackingUrl);
      
      // Send Email if provided
      if (email) {
        await this.sendEmail(email, trackingUrl);
      }
    } catch (error) {
      console.error('Error sending tracking link:', error);
      // Don't throw error as token generation should still succeed
    }
  }

  // Send SMS notification
  private async sendSMS(phone: string, trackingUrl: string): Promise<void> {
    try {
      // Integrate with SMS provider (Twilio, AWS SNS, etc.)
      const message = `Track your shipment: ${trackingUrl}`;
      
      // Mock SMS sending - replace with actual SMS provider
      console.log(`SMS sent to ${phone}: ${message}`);
      
      // Example with Twilio:
      // const twilio = require('twilio');
      // const client = twilio(accountSid, authToken);
      // await client.messages.create({
      //   body: message,
      //   from: '+1234567890',
      //   to: phone
      // });
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  // Send WhatsApp notification
  private async sendWhatsApp(phone: string, trackingUrl: string): Promise<void> {
    try {
      // Integrate with WhatsApp Business API
      const message = `🚚 Track your shipment: ${trackingUrl}`;
      
      // Mock WhatsApp sending - replace with actual WhatsApp provider
      console.log(`WhatsApp sent to ${phone}: ${message}`);
      
      // Example with WhatsApp Business API:
      // const response = await fetch('https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: phone,
      //     type: 'text',
      //     text: { body: message }
      //   })
      // });
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  }

  // Send Email notification
  private async sendEmail(email: string, trackingUrl: string): Promise<void> {
    try {
      // Integrate with email provider (SendGrid, AWS SES, etc.)
      const subject = 'Track Your Shipment - TrackAS';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Track Your Shipment</h2>
          <p>Click the link below to track your shipment in real-time:</p>
          <a href="${trackingUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Shipment
          </a>
          <p>This link will expire in 72 hours for security reasons.</p>
          <p>Best regards,<br>TrackAS Team</p>
        </div>
      `;
      
      // Mock email sending - replace with actual email provider
      console.log(`Email sent to ${email}: ${subject}`);
      
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: email,
      //   from: 'noreply@trackas.com',
      //   subject,
      //   html: htmlContent
      // });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Generate secure random token
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Mark token as used
  private async markTokenAsUsed(tokenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tracking_tokens')
        .update({ is_used: true, updated_at: new Date().toISOString() })
        .eq('id', tokenId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking token as used:', error);
    }
  }

  // Format timeline data
  private formatTimeline(events: any[]): Array<{
    status: string;
    timestamp: string;
    location?: string;
    description: string;
    completed: boolean;
  }> {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'Shipment created by shipper',
      'ASSIGNED': 'Assigned to fleet operator',
      'PICKED_UP': 'Package picked up from shipper',
      'IN_TRANSIT': 'Package in transit',
      'DELIVERED': 'Package delivered to recipient'
    };

    return events.map(event => ({
      status: event.event_type,
      timestamp: event.created_at,
      location: event.metadata?.location,
      description: statusMap[event.event_type] || event.event_type,
      completed: event.event_type !== 'DELIVERED' || !!event.metadata?.delivered
    }));
  }

  // Update driver and fleet ratings based on feedback
  private async updateRatings(
    shipmentId: string,
    rating: number,
    categories: any
  ): Promise<void> {
    try {
      // Get shipment details
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('assigned_driver_id, assigned_fleet_id')
        .eq('id', shipmentId)
        .single();

      if (error) throw error;

      // Update driver rating
      if (shipment.assigned_driver_id) {
        await this.updateDriverRating(shipment.assigned_driver_id, rating, categories);
      }

      // Update fleet rating
      if (shipment.assigned_fleet_id) {
        await this.updateFleetRating(shipment.assigned_fleet_id, rating, categories);
      }
    } catch (error) {
      console.error('Error updating ratings:', error);
    }
  }

  // Update driver rating
  private async updateDriverRating(
    driverId: string,
    rating: number,
    categories: any
  ): Promise<void> {
    try {
      // Get current driver data
      const { data: driver, error: fetchError } = await supabase
        .from('drivers')
        .select('rating, total_ratings')
        .eq('id', driverId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new average rating
      const totalRatings = (driver.total_ratings || 0) + 1;
      const currentRating = driver.rating || 0;
      const newRating = ((currentRating * (totalRatings - 1)) + rating) / totalRatings;

      // Update driver rating
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
          total_ratings: totalRatings,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating driver rating:', error);
    }
  }

  // Update fleet rating
  private async updateFleetRating(
    fleetId: string,
    rating: number,
    categories: any
  ): Promise<void> {
    try {
      // Get current fleet data
      const { data: fleet, error: fetchError } = await supabase
        .from('fleet_profiles')
        .select('reliability_score, total_ratings')
        .eq('id', fleetId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new average rating
      const totalRatings = (fleet.total_ratings || 0) + 1;
      const currentRating = fleet.reliability_score || 0;
      const newRating = ((currentRating * (totalRatings - 1)) + rating) / totalRatings;

      // Update fleet rating
      const { error: updateError } = await supabase
        .from('fleet_profiles')
        .update({
          reliability_score: Math.round(newRating * 10) / 10, // Round to 1 decimal place
          total_ratings: totalRatings,
          updated_at: new Date().toISOString()
        })
        .eq('id', fleetId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating fleet rating:', error);
    }
  }

  // Get tracking statistics for analytics
  async getTrackingStats(): Promise<{
    totalTokensGenerated: number;
    totalTokensUsed: number;
    averageRating: number;
    feedbackCount: number;
  }> {
    try {
      const { data: tokens, error: tokensError } = await supabase
        .from('tracking_tokens')
        .select('id, is_used');

      if (tokensError) throw tokensError;

      const { data: feedback, error: feedbackError } = await supabase
        .from('customer_feedback')
        .select('rating');

      if (feedbackError) throw feedbackError;

      const totalTokensGenerated = tokens.length;
      const totalTokensUsed = tokens.filter(token => token.is_used).length;
      const feedbackCount = feedback.length;
      const averageRating = feedbackCount > 0 
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedbackCount 
        : 0;

      return {
        totalTokensGenerated,
        totalTokensUsed,
        averageRating: Math.round(averageRating * 10) / 10,
        feedbackCount
      };
    } catch (error) {
      console.error('Error getting tracking stats:', error);
      return {
        totalTokensGenerated: 0,
        totalTokensUsed: 0,
        averageRating: 0,
        feedbackCount: 0
      };
    }
  }
}

export default CustomerTrackingService;
