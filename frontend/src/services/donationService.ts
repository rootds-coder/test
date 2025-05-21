import axios from 'axios';
import { API_URL } from '../config';
import { authService } from './authService';

export interface DonationAmount {
  value: number;
  label: string;
}

export interface QRResponse {
  success: boolean;
  qrCode: string;
  amount: number;
  upiUrl?: string;
}

export interface Donation {
  _id: string;
  donorName: string;
  email: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  amount: number;
  donorName: string;
  email: string;
  phone?: string;
  paymentMethod: string;
  transactionId: string;
  purpose?: string;
}

class DonationService {
  private handleApiError(error: any): never {
    console.error('API Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }

  async getDonations(): Promise<Donation[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/donations`);
      return response.data.donations;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getDonationById(id: string): Promise<Donation> {
    try {
      const response = await axios.get(`${API_URL}/admin/donations/${id}`);
      return response.data.donation;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async updateDonationStatus(id: string, status: Donation['status']): Promise<Donation> {
    try {
      const response = await axios.patch(`${API_URL}/admin/donations/${id}/status`, { status });
      return response.data.donation;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getDonationAmounts(): Promise<DonationAmount[]> {
    try {
      console.log('Fetching donation amounts from:', `${API_URL}/payment/amounts`);
      const response = await axios.get(`${API_URL}/payment/amounts`);
      return response.data.amounts;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async generateQR(amount: number): Promise<QRResponse> {
    try {
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount. Please provide a valid positive number.');
      }

      console.log('Generating QR code for amount:', amount);
      console.log('API URL:', `${API_URL}/payment/qr/generate`);

      const response = await axios.post(`${API_URL}/payment/qr/generate`, { 
        amount: Number(amount) 
      });

      console.log('QR code response:', response.data);

      if (!response.data.success || !response.data.qrCode) {
        throw new Error('Failed to generate QR code. Please try again.');
      }

      return response.data;
    } catch (error) {
      console.error('Error in generateQR:', error);
      return this.handleApiError(error);
    }
  }

  async makeDonation(donationData: DonationRequest): Promise<{ success: boolean; donation: Donation }> {
    try {
      console.log('Starting donation process...');
      console.log('API URL:', `${API_URL}/payment/verify`);
      console.log('Donation data:', {
        ...donationData,
        email: donationData.email || 'anonymous@example.com',
        phone: donationData.phone || 'Not provided'
      });
      
      // Validate required fields
      if (!donationData.amount || donationData.amount <= 0) {
        throw new Error('Invalid donation amount');
      }

      if (!donationData.transactionId) {
        throw new Error('Transaction ID is required');
      }

      // Ensure all required fields are present
      const payload = {
        ...donationData,
        donorName: donationData.donorName || 'Anonymous',
        email: donationData.email || 'anonymous@example.com',
        phone: donationData.phone || '',
        purpose: donationData.purpose || 'General'
      };

      // Verify the payment
      console.log('Sending payment verification request...');
      const verifyResponse = await axios.post(`${API_URL}/payment/verify`, payload);
      console.log('Payment verification response:', verifyResponse.data);

      if (!verifyResponse.data.success) {
        console.error('Payment verification failed:', verifyResponse.data);
        throw new Error(verifyResponse.data.message || 'Payment verification failed');
      }

      console.log('Donation processed successfully');
      return {
        success: true,
        donation: verifyResponse.data.donation
      };
    } catch (error: any) {
      console.error('Donation processing error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API error details:', {
          status: error.response?.status,
          message: errorMessage,
          data: error.response?.data
        });
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }
}

export default new DonationService(); 