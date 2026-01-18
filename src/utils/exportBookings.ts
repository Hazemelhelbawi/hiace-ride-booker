import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Booking, Route } from '@/services/api';

interface BookingWithRoute extends Booking {
  route?: Route;
}

export const exportBookingsToPDF = (bookings: BookingWithRoute[], routes: Route[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Booking History Report', 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 14, 30);
  
  // Prepare table data
  const tableData = bookings.map((booking) => {
    const route = routes.find((r) => r.id === booking.route_id);
    return [
      `#${booking.id.slice(0, 8)}`,
      booking.passenger_name,
      booking.passenger_phone,
      booking.passenger_email,
      route ? `${route.origin} → ${route.destination}` : 'N/A',
      route ? format(new Date(route.date), 'MMM dd, yyyy') : 'N/A',
      booking.seats.join(', '),
      `${booking.total_price} EGP`,
      booking.is_paid ? 'Paid' : 'Unpaid',
      booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      format(new Date(booking.created_at), 'MMM dd, yyyy'),
    ];
  });

  // Add table
  autoTable(doc, {
    head: [['ID', 'Passenger', 'Phone', 'Email', 'Route', 'Travel Date', 'Seats', 'Total', 'Payment', 'Status', 'Booked On']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [220, 53, 69],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 12 },
      9: { cellWidth: 15 },
      10: { cellWidth: 18 },
    },
  });

  // Add summary
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Bookings: ${bookings.length}`, 14, finalY + 10);
  doc.text(`Paid: ${bookings.filter((b) => b.is_paid).length}`, 14, finalY + 16);
  doc.text(`Pending: ${bookings.filter((b) => b.status === 'pending').length}`, 14, finalY + 22);
  doc.text(`Confirmed: ${bookings.filter((b) => b.status === 'confirmed').length}`, 14, finalY + 28);
  
  const totalRevenue = bookings.filter((b) => b.is_paid).reduce((sum, b) => sum + b.total_price, 0);
  doc.text(`Total Revenue: ${totalRevenue} EGP`, 14, finalY + 34);

  // Save
  doc.save(`bookings-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportBookingsToExcel = (bookings: BookingWithRoute[], routes: Route[]) => {
  // Prepare data
  const data = bookings.map((booking) => {
    const route = routes.find((r) => r.id === booking.route_id);
    return {
      'Booking ID': booking.id,
      'Passenger Name': booking.passenger_name,
      'Phone': booking.passenger_phone,
      'Email': booking.passenger_email,
      'Route': route ? `${route.origin} → ${route.destination}` : 'N/A',
      'Travel Date': route ? format(new Date(route.date), 'MMM dd, yyyy') : 'N/A',
      'Departure Time': route?.departure_time || 'N/A',
      'Arrival Time': route?.arrival_time || 'N/A',
      'Seats': booking.seats.join(', '),
      'Total Price (EGP)': booking.total_price,
      'Payment Status': booking.is_paid ? 'Paid' : 'Unpaid',
      'Booking Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      'Notes': booking.passenger_notes || '',
      'Booked On': format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm'),
    };
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 36 }, // Booking ID
    { wch: 20 }, // Passenger Name
    { wch: 15 }, // Phone
    { wch: 25 }, // Email
    { wch: 25 }, // Route
    { wch: 15 }, // Travel Date
    { wch: 12 }, // Departure
    { wch: 12 }, // Arrival
    { wch: 15 }, // Seats
    { wch: 15 }, // Total Price
    { wch: 12 }, // Payment Status
    { wch: 12 }, // Booking Status
    { wch: 30 }, // Notes
    { wch: 18 }, // Booked On
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

  // Add summary sheet
  const summaryData = [
    { Metric: 'Total Bookings', Value: bookings.length },
    { Metric: 'Paid Bookings', Value: bookings.filter((b) => b.is_paid).length },
    { Metric: 'Unpaid Bookings', Value: bookings.filter((b) => !b.is_paid).length },
    { Metric: 'Pending Bookings', Value: bookings.filter((b) => b.status === 'pending').length },
    { Metric: 'Confirmed Bookings', Value: bookings.filter((b) => b.status === 'confirmed').length },
    { Metric: 'Cancelled Bookings', Value: bookings.filter((b) => b.status === 'cancelled').length },
    { Metric: 'Total Revenue (EGP)', Value: bookings.filter((b) => b.is_paid).reduce((sum, b) => sum + b.total_price, 0) },
    { Metric: 'Report Generated', Value: format(new Date(), 'MMMM dd, yyyy HH:mm') },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Save
  XLSX.writeFile(wb, `bookings-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
