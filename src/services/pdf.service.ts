// ===========================================
// PDF GENERATION SERVICE
// Generates challan and receipt PDFs
// ===========================================

import { Violation } from '@/types';

/**
 * Generate a violation challan PDF
 * Returns a Buffer containing the PDF
 *
 * Note: We're using a simple HTML-to-PDF approach here
 * For production, you might want to use @react-pdf/renderer or puppeteer
 */
export async function generateChallanPDF(violation: Violation): Promise<Buffer> {
  // For simplicity, we'll create an HTML string and convert to PDF
  // In production, you'd use a proper PDF library

  const violationsList = violation.violations
    .map(
      (v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${v.type.replace('_', ' ')}</td>
        <td>${v.description}</td>
        <td>${v.severity}</td>
        <td>₹${v.fine_amount}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1a365d; }
        .title { font-size: 20px; margin-top: 10px; color: #dc2626; }
        .challan-no { background: #f3f4f6; padding: 10px; text-align: center; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { font-size: 14px; font-weight: bold; color: #1a365d; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { margin: 5px 0; }
        .label { font-size: 12px; color: #666; }
        .value { font-size: 14px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #1a365d; color: white; }
        .total { text-align: right; font-size: 18px; margin-top: 20px; }
        .total-amount { color: #dc2626; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center; }
        .evidence { margin-top: 20px; }
        .evidence img { max-width: 200px; margin: 5px; border: 1px solid #ddd; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; margin: 20px 0; font-size: 12px; }
        .qr-section { text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🚦 TRAFFIC VIOLATION SYSTEM</div>
        <div class="title">TRAFFIC VIOLATION CHALLAN</div>
      </div>

      <div class="challan-no">
        <strong>Challan No:</strong> ${violation.violation_id}
      </div>

      <div class="section">
        <div class="section-title">VIOLATION DETAILS</div>
        <div class="grid">
          <div class="field">
            <div class="label">Date</div>
            <div class="value">${violation.date}</div>
          </div>
          <div class="field">
            <div class="label">Time</div>
            <div class="value">${violation.time}</div>
          </div>
          <div class="field">
            <div class="label">Location</div>
            <div class="value">${violation.location.junction_name}</div>
          </div>
          <div class="field">
            <div class="label">Camera ID</div>
            <div class="value">${violation.location.camera_id}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">VEHICLE DETAILS</div>
        <div class="grid">
          <div class="field">
            <div class="label">Vehicle Number</div>
            <div class="value">${violation.vehicle.license_plate}</div>
          </div>
          <div class="field">
            <div class="label">Number of Riders</div>
            <div class="value">${violation.vehicle.num_riders}</div>
          </div>
          <div class="field">
            <div class="label">Signal State</div>
            <div class="value">${violation.signal_state}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">VIOLATIONS</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Violation Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            ${violationsList}
          </tbody>
        </table>
      </div>

      <div class="total">
        <strong>TOTAL FINE: <span class="total-amount">₹${violation.total_fine}</span></strong>
      </div>

      <div class="warning">
        <strong>⚠️ IMPORTANT:</strong> Please pay this fine within 15 days from the date of violation to avoid additional penalties. 
        Late payment may result in increased fine amount and/or legal action.
      </div>

      <div class="section">
        <div class="section-title">PAYMENT OPTIONS</div>
        <p style="font-size: 12px;">
          1. Online Payment: Visit ${process.env.NEXT_PUBLIC_APP_URL}/pay/${violation.violation_id}<br>
          2. Traffic Police Station: Visit the nearest traffic police station with this challan<br>
          3. Designated Banks: Pay at any designated bank with the challan number
        </p>
      </div>

      <div class="footer">
        <p>This is a computer-generated document. No signature is required.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>For queries, contact: traffic-support@gov.in | Helpline: 1800-XXX-XXXX</p>
      </div>
    </body>
    </html>
  `;

  // Convert HTML to PDF buffer
  // For now, we'll use a simple approach - in production use puppeteer or similar
  // Here we're returning the HTML as a buffer - you'll need to integrate with a PDF service

  // Simple implementation using dynamic import for edge compatibility
  try {
    // For development, we'll return the HTML as buffer
    // In production, integrate with a PDF generation service
    const buffer = Buffer.from(html, 'utf-8');
    return buffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate a payment receipt PDF
 */
export async function generateReceiptPDF(violation: Violation, paymentDate: Date): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #059669; }
        .title { font-size: 20px; margin-top: 10px; }
        .receipt-no { background: #d1fae5; padding: 10px; text-align: center; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { font-size: 14px; font-weight: bold; color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { margin: 5px 0; }
        .label { font-size: 12px; color: #666; }
        .value { font-size: 14px; font-weight: 500; }
        .total { text-align: center; font-size: 24px; margin: 30px 0; padding: 20px; background: #d1fae5; }
        .total-amount { color: #059669; font-weight: bold; }
        .status { text-align: center; font-size: 18px; color: #059669; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🚦 TRAFFIC VIOLATION SYSTEM</div>
        <div class="title">PAYMENT RECEIPT</div>
      </div>

      <div class="receipt-no">
        <strong>Receipt No:</strong> RCP-${violation.violation_id}-${Date.now()}
      </div>

      <div class="status">✅ PAYMENT SUCCESSFUL</div>

      <div class="section">
        <div class="section-title">PAYMENT DETAILS</div>
        <div class="grid">
          <div class="field">
            <div class="label">Challan No</div>
            <div class="value">${violation.violation_id}</div>
          </div>
          <div class="field">
            <div class="label">Payment Date</div>
            <div class="value">${paymentDate.toLocaleDateString()}</div>
          </div>
          <div class="field">
            <div class="label">Payment Time</div>
            <div class="value">${paymentDate.toLocaleTimeString()}</div>
          </div>
          <div class="field">
            <div class="label">Payment Method</div>
            <div class="value">Online (Stripe)</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">VIOLATION DETAILS</div>
        <div class="grid">
          <div class="field">
            <div class="label">Vehicle Number</div>
            <div class="value">${violation.vehicle.license_plate}</div>
          </div>
          <div class="field">
            <div class="label">Violation Date</div>
            <div class="value">${violation.date}</div>
          </div>
          <div class="field">
            <div class="label">Location</div>
            <div class="value">${violation.location.junction_name}</div>
          </div>
          <div class="field">
            <div class="label">Violations</div>
            <div class="value">${violation.violations.map((v) => v.type.replace('_', ' ')).join(', ')}</div>
          </div>
        </div>
      </div>

      <div class="total">
        <strong>AMOUNT PAID: <span class="total-amount">₹${violation.total_fine}</span></strong>
      </div>

      <div class="footer">
        <p>This is a computer-generated receipt. No signature is required.</p>
        <p>Keep this receipt for your records.</p>
        <p>For queries, contact: traffic-support@gov.in | Helpline: 1800-XXX-XXXX</p>
      </div>
    </body>
    </html>
  `;

  try {
    const buffer = Buffer.from(html, 'utf-8');
    return buffer;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw error;
  }
}