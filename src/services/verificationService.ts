import { supabase } from '../lib/supabase';

export interface VerificationResult {
  status: 'verified' | 'failed' | 'manual_review';
  result?: any;
  failureReason?: string;
}

export interface DocumentValidation {
  isValid: boolean;
  fileType: string;
  expiryDate?: Date;
  documentNumber?: string;
  extractedData?: any;
}

export class VerificationService {
  private static instance: VerificationService;

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  // PAN Verification
  async verifyPAN(panNumber: string): Promise<VerificationResult> {
    try {
      // PAN format validation
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panNumber)) {
        return {
          status: 'failed',
          failureReason: 'Invalid PAN format'
        };
      }

      // Simulate API call to PAN verification service
      // In production, integrate with DigiLocker or PAN verification API
      const mockResult = await this.mockPANVerification(panNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'failed',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'PAN verification failed'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'PAN verification service unavailable'
      };
    }
  }

  // GST Verification
  async verifyGST(gstNumber: string): Promise<VerificationResult> {
    try {
      // GST format validation
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber)) {
        return {
          status: 'failed',
          failureReason: 'Invalid GST format'
        };
      }

      // Simulate API call to GST verification service
      const mockResult = await this.mockGSTVerification(gstNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'failed',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'GST verification failed'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'GST verification service unavailable'
      };
    }
  }

  // Aadhaar Verification
  async verifyAadhaar(aadhaarNumber: string): Promise<VerificationResult> {
    try {
      // Aadhaar format validation
      const aadhaarRegex = /^[0-9]{12}$/;
      if (!aadhaarRegex.test(aadhaarNumber)) {
        return {
          status: 'failed',
          failureReason: 'Invalid Aadhaar format'
        };
      }

      // Simulate API call to Aadhaar verification service
      const mockResult = await this.mockAadhaarVerification(aadhaarNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'failed',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'Aadhaar verification failed'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'Aadhaar verification service unavailable'
      };
    }
  }

  // Document Integrity Check
  async validateDocument(documentUrl: string, documentType: string): Promise<DocumentValidation> {
    try {
      // Simulate document validation
      const validation = await this.mockDocumentValidation(documentUrl, documentType);
      
      return {
        isValid: validation.isValid,
        fileType: validation.fileType,
        expiryDate: validation.expiryDate,
        documentNumber: validation.documentNumber,
        extractedData: validation.extractedData
      };
    } catch (error) {
      return {
        isValid: false,
        fileType: 'unknown'
      };
    }
  }

  // RC Verification
  async verifyRC(rcNumber: string): Promise<VerificationResult> {
    try {
      // RC format validation
      const rcRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
      if (!rcRegex.test(rcNumber)) {
        return {
          status: 'failed',
          failureReason: 'Invalid RC format'
        };
      }

      // Simulate API call to RTO/VAHAN verification
      const mockResult = await this.mockRCVerification(rcNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'manual_review',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'RC requires manual verification'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'RC verification service unavailable'
      };
    }
  }

  // Insurance Verification
  async verifyInsurance(insuranceNumber: string, expiryDate: Date): Promise<VerificationResult> {
    try {
      // Check if insurance is expired
      if (expiryDate < new Date()) {
        return {
          status: 'failed',
          failureReason: 'Insurance has expired'
        };
      }

      // Simulate insurance verification
      const mockResult = await this.mockInsuranceVerification(insuranceNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'manual_review',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'Insurance requires manual verification'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'Insurance verification service unavailable'
      };
    }
  }

  // Pollution Certificate Verification
  async verifyPollutionCertificate(certificateNumber: string, expiryDate: Date): Promise<VerificationResult> {
    try {
      // Check if certificate is expired
      if (expiryDate < new Date()) {
        return {
          status: 'failed',
          failureReason: 'Pollution certificate has expired'
        };
      }

      // Simulate pollution certificate verification
      const mockResult = await this.mockPollutionVerification(certificateNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'manual_review',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'Pollution certificate requires manual verification'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'Pollution certificate verification service unavailable'
      };
    }
  }

  // Driver License Verification
  async verifyDriverLicense(licenseNumber: string, expiryDate: Date): Promise<VerificationResult> {
    try {
      // Check if license is expired
      if (expiryDate < new Date()) {
        return {
          status: 'failed',
          failureReason: 'Driver license has expired'
        };
      }

      // Simulate license verification
      const mockResult = await this.mockLicenseVerification(licenseNumber);
      
      return {
        status: mockResult.isValid ? 'verified' : 'manual_review',
        result: mockResult,
        failureReason: mockResult.isValid ? undefined : 'Driver license requires manual verification'
      };
    } catch (error) {
      return {
        status: 'failed',
        failureReason: 'Driver license verification service unavailable'
      };
    }
  }

  // Log verification result to database
  async logVerificationResult(
    userProfileId: string,
    verificationType: string,
    status: string,
    result?: any,
    failureReason?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('log_verification_result', {
        p_user_profile_id: userProfileId,
        p_verification_type: verificationType,
        p_status: status,
        p_result: result,
        p_failure_reason: failureReason
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging verification result:', error);
      return false;
    }
  }

  // Check if all verifications are complete for a user
  async checkVerificationCompletion(userProfileId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_verification_completion', {
        p_user_profile_id: userProfileId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking verification completion:', error);
      return false;
    }
  }

  // Approve verification (for admin use)
  async approveVerification(approvalId: string, adminId: string, type: string): Promise<boolean> {
    try {
      // Simulate API call to approve verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would update the database
      console.log(`Approved verification ${approvalId} by admin ${adminId} for type ${type}`);
      
      return true;
    } catch (error) {
      console.error('Error approving verification:', error);
      return false;
    }
  }

  // Reject verification (for admin use)
  async rejectVerification(approvalId: string, adminId: string, type: string, reason: string): Promise<boolean> {
    try {
      // Simulate API call to reject verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would update the database
      console.log(`Rejected verification ${approvalId} by admin ${adminId} for type ${type}. Reason: ${reason}`);
      
      return true;
    } catch (error) {
      console.error('Error rejecting verification:', error);
      return false;
    }
  }

  // Mock verification functions (replace with real API calls in production)
  private async mockPANVerification(panNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Mock validation logic
    const isValid = panNumber.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);
    
    return {
      isValid,
      panNumber,
      name: isValid ? 'John Doe' : null,
      status: isValid ? 'Active' : 'Invalid'
    };
  }

  private async mockGSTVerification(gstNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isValid = gstNumber.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber);
    
    return {
      isValid,
      gstNumber,
      businessName: isValid ? 'Sample Business Pvt Ltd' : null,
      status: isValid ? 'Active' : 'Invalid'
    };
  }

  private async mockAadhaarVerification(aadhaarNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isValid = aadhaarNumber.length === 12 && /^[0-9]{12}$/.test(aadhaarNumber);
    
    return {
      isValid,
      aadhaarNumber,
      name: isValid ? 'John Doe' : null,
      status: isValid ? 'Verified' : 'Invalid'
    };
  }

  private async mockDocumentValidation(documentUrl: string, documentType: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock document validation
    const validTypes = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    
    return {
      isValid: validTypes.includes(fileExtension || ''),
      fileType: fileExtension || 'unknown',
      expiryDate: documentType.includes('insurance') || documentType.includes('pollution') 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        : undefined,
      documentNumber: 'MOCK123456789',
      extractedData: {
        documentType,
        extractedAt: new Date().toISOString()
      }
    };
  }

  private async mockRCVerification(rcNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isValid = rcNumber.length >= 10 && /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(rcNumber);
    
    return {
      isValid,
      rcNumber,
      vehicleDetails: isValid ? {
        make: 'Tata',
        model: 'Ace',
        year: '2020',
        ownerName: 'Sample Owner'
      } : null
    };
  }

  private async mockInsuranceVerification(insuranceNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      isValid: insuranceNumber.length > 5,
      insuranceNumber,
      provider: 'Sample Insurance Co.',
      policyType: 'Commercial Vehicle'
    };
  }

  private async mockPollutionVerification(certificateNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      isValid: certificateNumber.length > 5,
      certificateNumber,
      emissionStandard: 'BS6',
      testDate: new Date().toISOString()
    };
  }

  private async mockLicenseVerification(licenseNumber: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      isValid: licenseNumber.length > 5,
      licenseNumber,
      holderName: 'Sample Driver',
      licenseType: 'Commercial',
      validity: 'Valid'
    };
  }
}

export default VerificationService;