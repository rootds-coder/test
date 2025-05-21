import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { API_URL } from '../../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(17, 25, 40, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: 'white',
  borderColor: 'rgba(255, 255, 255, 0.1)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 25, 40, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const DonationManagement: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  // Fetch donations initially and every 10 seconds
  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, selectedStatus]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_URL}/admin/donations`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: selectedStatus
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Fetched donations:', response.data); // Debug log

      const { data } = response;
      if (data && Array.isArray(data.donations)) {
        setDonations(data.donations);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } else {
        console.error('Invalid donations data:', data);
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (donationId: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/admin/donations/${donationId}/status`, {
        status: newStatus
      });
      fetchDonations();
    } catch (error) {
      console.error('Error updating donation status:', error);
      setError('Failed to update donation status');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/donations/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donations.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting donations:', error);
      setError('Failed to export donations');
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Calculate statistics
  const totalDonations = donations.reduce((acc, donation) => acc + donation.amount, 0);
  const completedDonations = donations.filter(donation => donation.status === 'completed').length;
  const pendingDonations = donations.filter(donation => donation.status === 'pending').length;
  const totalDonors = donations.length;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Loading donations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 4, color: 'white' }}>
        Donation Management
      </Typography>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardHeader title="Total Donations" titleTypographyProps={{ color: 'white' }} />
            <CardContent>
              <Typography variant="h4" color="#2196F3">
                {formatAmount(totalDonations)}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardHeader title="Completed Donations" titleTypographyProps={{ color: 'white' }} />
            <CardContent>
              <Typography variant="h4" color="#4CAF50">
                {completedDonations}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardHeader title="Pending Donations" titleTypographyProps={{ color: 'white' }} />
            <CardContent>
              <Typography variant="h4" color="#FFC107">
                {pendingDonations}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardHeader title="Total Donors" titleTypographyProps={{ color: 'white' }} />
            <CardContent>
              <Typography variant="h4" color="#9C27B0">
                {totalDonors}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Donations Table */}
      <Typography variant="h6" sx={{ mb: 3, color: 'white' }}>
        Recent Donations
      </Typography>
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Transaction ID</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Donor</StyledTableCell>
              <StyledTableCell>Contact</StyledTableCell>
              <StyledTableCell>Purpose</StyledTableCell>
              <StyledTableCell>Payment Method</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Message</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <StyledTableCell>{donation.transactionId}</StyledTableCell>
                <StyledTableCell>{formatDate(donation.date)}</StyledTableCell>
                <StyledTableCell>{formatAmount(donation.amount)}</StyledTableCell>
                <StyledTableCell>{donation.donor.name}</StyledTableCell>
                <StyledTableCell>
                  {donation.donor.email}<br/>
                  {donation.donor.phone}
                </StyledTableCell>
                <StyledTableCell>{donation.purpose}</StyledTableCell>
                <StyledTableCell>
                  <Chip
                    label={donation.paymentMethod.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      color: '#2196F3',
                      border: '1px solid #2196F3'
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <Chip
                    label={donation.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: donation.status === 'completed' 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : donation.status === 'pending'
                        ? 'rgba(255, 193, 7, 0.1)'
                        : 'rgba(244, 67, 54, 0.1)',
                      color: donation.status === 'completed'
                        ? '#4CAF50'
                        : donation.status === 'pending'
                        ? '#FFC107'
                        : '#F44336',
                      border: `1px solid ${
                        donation.status === 'completed'
                          ? '#4CAF50'
                          : donation.status === 'pending'
                          ? '#FFC107'
                          : '#F44336'
                      }`
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  {donation.message ? (
                    <Tooltip title={donation.message}>
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    'No message'
                  )}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DonationManagement;