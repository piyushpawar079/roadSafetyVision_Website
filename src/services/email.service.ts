// ===========================================
// EMAIL SERVICE
// Handles all email notifications
// ===========================================

import nodemailer from 'nodemailer';
import { Violation } from '@/types';
// import { generateViolationPDF } from './pdf.service';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const APP_NAME = 'TrafficGuard';

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Format currency in INR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Your ${APP_NAME} Verification Code: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .otp-box { background: white; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with ${APP_NAME}. Please use the following verification code to complete your registration:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <p class="otp-code">${otp}</p>
              </div>
              
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. ${APP_NAME} staff will never ask for your verification code.
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send violation notification email to vehicle owner
 */
export async function sendViolationNotification(
  email: string,
  name: string,
  violation: Violation
): Promise<boolean> {
  try {
    // Generate violation list HTML
    const violationsList = violation.violations
      .map(
        (v) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${v.type.replace('_', ' ')}</strong>
            <br>
            <span style="font-size: 12px; color: #666;">${v.description}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
            ${formatCurrency(v.fine_amount)}
          </td>
        </tr>
      `
      )
      .join('');

    // Evidence images HTML (if available)
    let evidenceHtml = '';
    if (violation.evidence?.violation_full) {
      evidenceHtml = `
        <div style="margin-top: 20px;">
          <h3 style="color: #1a365d; margin-bottom: 10px;">📷 Evidence</h3>
          <img src="${violation.evidence.violation_full}" alt="Violation Evidence" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
        </div>
      `;
    }

    await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `⚠️ Traffic Violation Notice - ${violation.violation_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { color: #666; font-size: 14px; }
            .info-value { font-weight: bold; }
            .violations-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total-row { background: #fee2e2; }
            .total-amount { font-size: 24px; color: #dc2626; }
            .pay-button { display: inline-block; background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .pay-button:hover { background: #1d4ed8; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; }
            .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .deadline { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚠️ Traffic Violation Notice</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Challan ID: ${violation.violation_id}</p>
            </div>
            
            <div class="content">
              <p>Dear ${name},</p>
              
              <p>A traffic violation has been recorded against your vehicle. Please review the details below and make the payment at your earliest convenience to avoid additional penalties.</p>
              
              <!-- Vehicle & Location Info -->
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a365d;">📋 Violation Details</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p class="info-label">License Plate</p>
                    <p class="info-value" style="font-family: monospace; font-size: 18px;">${violation.vehicle.license_plate}</p>
                  </div>
                  <div>
                    <p class="info-label">Date & Time</p>
                    <p class="info-value">${formatDate(violation.date)}<br>${violation.time}</p>
                  </div>
                  <div>
                    <p class="info-label">Location</p>
                    <p class="info-value">${violation.location.junction_name}</p>
                  </div>
                  <div>
                    <p class="info-label">Camera ID</p>
                    <p class="info-value">${violation.location.camera_id}</p>
                  </div>
                </div>
              </div>
              
              <!-- Violations Table -->
              <h3 style="color: #1a365d;">🚫 Violations</h3>
              <table class="violations-table">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left;">Violation</th>
                    <th style="padding: 12px; text-align: right;">Fine Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${violationsList}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td style="padding: 15px; font-weight: bold;">Total Fine Amount</td>
                    <td style="padding: 15px; text-align: right;">
                      <span class="total-amount">${formatCurrency(violation.total_fine)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              ${evidenceHtml}
              
              <!-- Warning Box -->
              <div class="warning-box">
                <strong>⏰ Payment Deadline:</strong>
                <p style="margin: 5px 0;">Please pay the fine within <span class="deadline">15 days</span> to avoid:</p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>Late payment penalty (additional 10%)</li>
                  <li>Legal action and court summons</li>
                  <li>Vehicle impoundment</li>
                </ul>
              </div>
              
              <!-- Pay Button -->
              <div style="text-align: center;">
                <a href="${APP_URL}/dashboard/payments/pay/${violation.violation_id}" class="pay-button">
                  Pay Fine Now
                </a>
                <p style="font-size: 12px; color: #666;">Or login to your dashboard to view and pay</p>
              </div>
              
              <!-- Dispute Info -->
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>🔍 Dispute this violation?</strong>
                <p style="margin: 5px 0; font-size: 14px;">
                  If you believe this violation was issued in error, you can file a dispute through your dashboard within 7 days of receiving this notice.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message from ${APP_NAME} Traffic Violation Management System.</p>
              <p>For support, contact us at support@trafficguard.com</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Violation notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending violation notification:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  email: string,
  name: string,
  violation: Violation,
  paymentDetails: {
    transaction_id: string;
    amount: number;
    payment_method: string;
    payment_date: Date;
  }
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `✅ Payment Confirmation - ${violation.violation_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #ffffff; }
            .receipt-box { background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #d1d5db; }
            .receipt-row:last-child { border-bottom: none; }
            .amount-paid { font-size: 28px; color: #059669; font-weight: bold; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .checkmark { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="checkmark">✅</div>
              <h1 style="margin: 10px 0;">Payment Successful!</h1>
              <p style="margin: 0; opacity: 0.9;">Thank you for your payment</p>
            </div>
            
            <div class="content">
              <p>Dear ${name},</p>
              
              <p>Your payment has been successfully processed. Below are your receipt details:</p>
              
              <div class="receipt-box">
                <h3 style="margin-top: 0; color: #059669; text-align: center;">Payment Receipt</h3>
                
                <div class="receipt-row">
                  <span>Transaction ID</span>
                  <strong style="font-family: monospace;">${paymentDetails.transaction_id}</strong>
                </div>
                
                <div class="receipt-row">
                  <span>Challan ID</span>
                  <strong>${violation.violation_id}</strong>
                </div>
                
                <div class="receipt-row">
                  <span>License Plate</span>
                  <strong style="font-family: monospace;">${violation.vehicle.license_plate}</strong>
                </div>
                
                <div class="receipt-row">
                  <span>Payment Date</span>
                  <strong>${paymentDetails.payment_date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</strong>
                </div>
                
                <div class="receipt-row">
                  <span>Payment Method</span>
                  <strong>${paymentDetails.payment_method}</strong>
                </div>
                
                <div style="text-align: center; padding-top: 20px; border-top: 2px solid #059669; margin-top: 10px;">
                  <p style="margin: 0; color: #666;">Amount Paid</p>
                  <p class="amount-paid">${formatCurrency(paymentDetails.amount)}</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #059669;">
                <strong>Your violation has been cleared. Thank you for your compliance!</strong>
              </p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${APP_URL}/dashboard/payments/history" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                  View Payment History
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>Please keep this email as your receipt for future reference.</p>
              <p>For any queries, contact us at support@trafficguard.com</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Payment confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return false;
  }
}

/**
 * Send admin request status email
 */
export async function sendAdminRequestStatusEmail(
  email: string,
  name: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  try {
    const isApproved = status === 'approved';

    await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Admin Access Request ${isApproved ? 'Approved ✅' : 'Rejected ❌'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .status-box { background: ${isApproved ? '#d1fae5' : '#fee2e2'}; border: 1px solid ${isApproved ? '#059669' : '#dc2626'}; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; background: #1a365d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 15px; }
            .important-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .steps ol { margin: 0; padding-left: 20px; }
            .steps li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Admin Access Request ${isApproved ? 'Approved ✅' : 'Rejected ❌'}</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              
              <div class="status-box">
                ${
                  isApproved
                    ? '<p style="font-size: 18px; margin: 0;">🎉 <strong>Congratulations!</strong></p><p style="margin: 10px 0 0 0;">Your request for admin access has been <strong>approved</strong>.</p>'
                    : '<p style="margin: 0;">We regret to inform you that your request for admin access has been <strong>rejected</strong>.</p>'
                }
              </div>

              ${
                isApproved
                  ? `
                <div class="important-note">
                  <strong>⚠️ Important: Action Required</strong>
                  <p style="margin: 10px 0 0 0;">To activate your new admin privileges, you must sign out and sign back in.</p>
                </div>

                <div class="steps">
                  <h3 style="margin-top: 0;">Follow these steps:</h3>
                  <ol>
                    <li><strong>Sign out</strong> of your current session</li>
                    <li><strong>Sign back in</strong> using your email and password (or Google)</li>
                    <li>You will be automatically redirected to the <strong>Admin Dashboard</strong></li>
                  </ol>
                </div>

                <div style="text-align: center;">
                  <a href="${APP_URL}/auth/login?message=admin_approved" class="btn">
                    Sign In as Admin
                  </a>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
                  <h4 style="margin-top: 0;">As an admin, you can now:</h4>
                  <ul>
                    <li>View all traffic violations in the system</li>
                    <li>Correct and verify license plate numbers</li>
                    <li>Review violation evidence and images</li>
                    <li>Monitor payment statuses</li>
                  </ul>
                </div>
              `
                  : `
                <p>If you believe this decision was made in error or have additional information to support your request, you may:</p>
                <ul>
                  <li>Submit a new request with additional documentation</li>
                  <li>Contact the system administrator for more information</li>
                </ul>
                <p>You can continue using the system as a citizen to view your violations and make payments.</p>
              `
              }
            </div>
            <div class="footer">
              <p>This is an automated message from ${APP_NAME}.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Admin request status email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending admin request status email:', error);
    return false;
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Welcome to ${APP_NAME}! 🚗`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #ffffff; }
            .feature-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .feature-icon { font-size: 24px; margin-right: 10px; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to ${APP_NAME}! 🚗</h1>
              <p style="margin: 15px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>Thank you for creating an account with ${APP_NAME}. We're here to help you manage your traffic-related matters efficiently and conveniently.</p>
              
              <h3>What you can do with your account:</h3>
              
              <div class="feature-box">
                <span class="feature-icon">📋</span>
                <strong>View Violations</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Check all traffic violations recorded against your vehicles</p>
              </div>
              
              <div class="feature-box">
                <span class="feature-icon">💳</span>
                <strong>Pay Fines Online</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Securely pay your traffic fines from anywhere</p>
              </div>
              
              <div class="feature-box">
                <span class="feature-icon">🔔</span>
                <strong>Get Notifications</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Receive instant alerts about new violations</p>
              </div>
              
              <div class="feature-box">
                <span class="feature-icon">📊</span>
                <strong>Track History</strong>
                <p style="margin: 5px 0 0 0; color: #666;">View your complete violation and payment history</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
            </div>
            
            <div class="footer">
              <p>Drive safely! 🚦</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send violation notification email with PDF challan
 */
export async function sendViolationEmail(
  violation: Violation,
  citizenEmail: string,
  citizenName: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    const paymentLink = `${APP_URL}/dashboard/citizen/violations/${violation.violation_id}`;
    const violationTypes = violation.violations.map((v) => v.type).join(', ');

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: citizenEmail,
      subject: `Traffic Violation Notice - ${violation.violation_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .violation-box { background: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
            .fine-amount { font-size: 24px; color: #dc2626; font-weight: bold; }
            .btn { display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; margin-top: 15px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Traffic Violation Notice</h1>
            </div>
            <div class="content">
              <p>Dear ${citizenName},</p>
              <p>A traffic violation has been recorded against your vehicle. Please find the details below:</p>
              
              <div class="violation-box">
                <p><strong>Violation ID:</strong> ${violation.violation_id}</p>
                <p><strong>Date:</strong> ${violation.date}</p>
                <p><strong>Time:</strong> ${violation.time}</p>
                <p><strong>Location:</strong> ${violation.location.junction_name}</p>
                <p><strong>Vehicle Number:</strong> ${violation.vehicle.license_plate}</p>
                <p><strong>Violation Type:</strong> ${violationTypes}</p>
                <p><strong>Total Fine:</strong> <span class="fine-amount">₹${violation.total_fine}</span></p>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Please pay the fine within 15 days to avoid additional penalties.
              </div>

              <p>Please find the detailed challan attached to this email.</p>
              
              <a href="${paymentLink}" class="btn">Pay Fine Online</a>

              <p style="margin-top: 20px;">If you believe this violation was issued in error, please visit our website or contact the traffic department.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Traffic Violation System.</p>
              <p>&copy; 2024 Traffic Violation System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Challan_${violation.violation_id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error sending violation email:', error);
    return false;
  }
}