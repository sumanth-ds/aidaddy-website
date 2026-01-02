from flask_mail import Message
import os

def send_contact_email(mail, name, email, message):
    result = {
        'user': False,
        'admin': False,
        'errors': []
    }

    msg = Message('Thank you for contacting Aidaddy!',
                  recipients=[email])
    
    # Plain text version
    msg.body = f"Dear {name},\n\nThank you for reaching out to us. We have received your message:\n\n{message}\n\nWe will get back to you soon!\n\nBest regards,\nAidaddy Team"
    
    # HTML version for better user experience
    msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
            .message {{ background-color: white; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank You for Contacting Aidaddy!</h1>
            </div>
            <div class="content">
                <p>Dear <strong>{name}</strong>,</p>
                
                <p>Thank you for reaching out to us! We have received your message and appreciate you taking the time to contact Aidaddy.</p>
                
                <div class="message">
                    <strong>Your Message:</strong><br>
                    {message.replace('\n', '<br>')}
                </div>
                
                <p>We will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.</p>
                
                <p>If you have any additional information or urgent questions, please don't hesitate to reply to this email.</p>
                
                <p>Best regards,<br>
                <strong>The Aidaddy Team</strong></p>
                
                <div class="footer">
                    <p>This is an automated response. Please do not reply to this email.</p>
                    <p>For urgent matters, contact us at: aidaddy.in@gmail.com</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        mail.send(msg)
        result['user'] = True
    except Exception as e:
        print(f"mail: Failed to send contact confirmation to user {email}: {e}")
        import traceback; traceback.print_exc()
        result['errors'].append(str(e))

    # Send to company/admin
    try:
        admin_email = os.getenv('MAIL_USERNAME')
        if admin_email:
            company_msg = Message('New Contact Submitted - Aidaddy', recipients=[admin_email])
            company_msg.body = f"New contact message received:\n\nName: {name}\nEmail: {email}\n\nMessage:\n{message}\n"
            company_msg.html = f"<p><strong>Name:</strong> {name}</p><p><strong>Email:</strong> {email}</p><div style=\"background:white;padding:10px;border-left:4px solid #2563eb;\">{message.replace('\n', '<br>')}</div>"
            mail.send(company_msg)
            result['admin'] = True
        else:
            print('mail: MAIL_USERNAME not configured; cannot send admin notification')
            result['errors'].append('MAIL_USERNAME not configured')
    except Exception as e:
        print(f"mail: Failed to send contact notification to admin {admin_email}: {e}")
        import traceback; traceback.print_exc()
        result['errors'].append(str(e))

    return result

def send_meeting_email(mail, name, email, phone, company, company_url, project_type, budget, message, meeting_datetime, meeting_link):
    # Send to user
    user_msg = Message('Your Meeting is Scheduled - Aidaddy',
                      recipients=[email])
    
    user_msg.body = f"""Dear {name},

Your meeting with Aidaddy has been successfully scheduled!

Meeting Details:
- Date & Time: {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
- Duration: 30 minutes
- Meeting Link: {meeting_link}

Please join the meeting using the link above at the scheduled time.

If you need to reschedule or have any questions, please contact us at aidaddy.in@gmail.com

Best regards,
Aidaddy Team"""

    user_msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }}
            .meeting-details {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }}
            .meeting-link {{ background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }}
            .meeting-link a {{ color: #2563eb; text-decoration: none; font-weight: bold; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Your Meeting is Scheduled!</h1>
                <p>Thank you for choosing Aidaddy</p>
            </div>
            <div class="content">
                <p>Dear <strong>{name}</strong>,</p>
                
                <p>Great news! Your meeting with our team has been successfully scheduled. We're excited to connect with you!</p>
                
                <div class="meeting-details">
                    <h3>📅 Meeting Details</h3>
                    <p><strong>Date & Time:</strong> {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Duration:</strong> 30 minutes</p>
                    <p><strong>Timezone:</strong> Your local timezone</p>
                </div>
                
                <div class="meeting-link">
                    <h3>🔗 Join Meeting</h3>
                    <p><a href="{meeting_link}" target="_blank">{meeting_link}</a></p>
                    <p><em>Click the link above to join your meeting</em></p>
                </div>
                
                <p><strong>What to expect:</strong></p>
                <ul>
                    <li>A brief introduction and overview of our services</li>
                    <li>Discussion about your specific needs and requirements</li>
                    <li>Answers to any questions you may have</li>
                    <li>Next steps and recommendations</li>
                </ul>
                
                <p>If you need to reschedule or have any questions before the meeting, please don't hesitate to contact us at <a href="mailto:aidaddy.in@gmail.com">aidaddy.in@gmail.com</a></p>
                
                <p>We look forward to speaking with you!</p>
                
                <p>Best regards,<br>
                <strong>The Aidaddy Team</strong></p>
                
                <div class="footer">
                    <p>This is an automated email. Please save this meeting to your calendar.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    mail.send(user_msg)
    
    # Send to company (us)
    company_msg = Message('New Meeting Scheduled - Aidaddy',
                         recipients=[os.getenv('MAIL_USERNAME')])  # Send to company email
    
    company_msg.body = f"""New meeting scheduled!

Client Details:
- Name: {name}
- Email: {email}
- Phone: {phone or 'Not provided'}
- Company: {company or 'Not provided'}
- Website: {company_url or 'Not provided'}

Project Information:
- Project Type: {project_type or 'Not provided'}
- Budget: {budget or 'Not provided'}
- Message: {message or 'Not provided'}

Meeting Details:
- Date & Time: {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
- Meeting Link: {meeting_link}

Please be prepared for the meeting."""

    company_msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
            .client-info {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            .project-info {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }}
            .meeting-info {{ background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981; margin: 15px 0; }}
            .detail-row {{ margin: 8px 0; }}
            .detail-label {{ font-weight: bold; color: #555; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📅 New Meeting Scheduled</h2>
            </div>
            <div class="content">
                <p>A new meeting has been booked through the website.</p>
                
                <div class="client-info">
                    <h3>👤 Client Information</h3>
                    <div class="detail-row"><span class="detail-label">Name:</span> {name}</div>
                    <div class="detail-row"><span class="detail-label">Email:</span> {email}</div>
                    <div class="detail-row"><span class="detail-label">Phone:</span> {phone or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Company:</span> {company or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Website:</span> {f'<a href="{company_url}" target="_blank">{company_url}</a>' if company_url else 'Not provided'}</div>
                </div>
                
                <div class="project-info">
                    <h3>💼 Project Information</h3>
                    <div class="detail-row"><span class="detail-label">Project Type:</span> {project_type or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Budget:</span> {budget or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Message:</span><br>{message.replace(chr(10), '<br>') if message else 'Not provided'}</div>
                </div>
                
                <div class="meeting-info">
                    <h3>📋 Meeting Details</h3>
                    <p><strong>Date & Time:</strong> {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Duration:</strong> 30 minutes</p>
                    <p><strong>Meeting Link:</strong> <a href="{meeting_link}">{meeting_link}</a></p>
                </div>
                
                <p>Please prepare for this meeting and ensure you're available at the scheduled time.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    mail.send(company_msg)

def send_meeting_request_confirmation_email(mail, name, email, phone, company, company_url, project_type, budget, message, meeting_datetime):
    # Send confirmation to user
    user_msg = Message('Meeting Request Received - Aidaddy',
                      recipients=[email])
    
    user_msg.body = f"""Dear {name},

Thank you for requesting a meeting with Aidaddy!

We have received your meeting request with the following details:

Meeting Information:
- Date & Time: {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
- Duration: 30 minutes

Your Information:
- Name: {name}
- Email: {email}
- Phone: {phone}
- Company: {company or 'Not provided'}
- Website: {company_url or 'Not provided'}

Project Details:
- Project Type: {project_type}
- Budget: {budget}
- Message: {message}

Our team will review your request and provide a meeting link shortly. You will receive a confirmation email with the meeting details once the link is ready.

If you need to change your requested time or have any questions, please contact us at aidaddy.in@gmail.com

Best regards,
Aidaddy Team"""

    user_msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }}
            .meeting-details {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }}
            .info-section {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
            .next-steps {{ background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            .detail-row {{ margin: 8px 0; }}
            .detail-label {{ font-weight: bold; color: #555; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Meeting Request Received!</h1>
                <p>Thank you for choosing Aidaddy</p>
            </div>
            <div class="content">
                <p>Dear <strong>{name}</strong>,</p>
                
                <p>Thank you for requesting a meeting with our team! We appreciate your interest in Aidaddy.</p>
                
                <div class="meeting-details">
                    <h3>📋 Your Requested Meeting Time</h3>
                    <p><strong>Date & Time:</strong> {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Duration:</strong> 30 minutes</p>
                </div>
                
                <div class="info-section">
                    <h3>👤 Your Information</h3>
                    <div class="detail-row"><span class="detail-label">Name:</span> {name}</div>
                    <div class="detail-row"><span class="detail-label">Email:</span> {email}</div>
                    <div class="detail-row"><span class="detail-label">Phone:</span> {phone}</div>
                    <div class="detail-row"><span class="detail-label">Company:</span> {company or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Website:</span> {f'<a href="{company_url}" target="_blank">{company_url}</a>' if company_url else 'Not provided'}</div>
                </div>
                
                <div class="info-section">
                    <h3>💼 Project Details</h3>
                    <div class="detail-row"><span class="detail-label">Project Type:</span> {project_type}</div>
                    <div class="detail-row"><span class="detail-label">Budget:</span> {budget}</div>
                    <div class="detail-row"><span class="detail-label">Message:</span><br>{message.replace(chr(10), '<br>')}</div>
                </div>
                
                <div class="next-steps">
                    <h3>⏭️ What Happens Next?</h3>
                    <p>Our team will review your request and provide a meeting link. You will receive a confirmation email with the meeting details once everything is set up.</p>
                    <p>This usually takes 24-48 hours, but we'll get back to you as soon as possible.</p>
                </div>
                
                <p>If you need to change your requested time or have any questions, please don't hesitate to contact us at <a href="mailto:aidaddy.in@gmail.com">aidaddy.in@gmail.com</a></p>
                
                <p>We look forward to speaking with you!</p>
                
                <p>Best regards,<br>
                <strong>The Aidaddy Team</strong></p>
                
                <div class="footer">
                    <p>This is an automated email. Please save this for your records.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    mail.send(user_msg)

def send_meeting_request_email(mail, name, email, phone, company, company_url, project_type, budget, message, meeting_datetime):
    # Send meeting request to company only
    company_msg = Message('New Meeting Request - Aidaddy',
                         recipients=[os.getenv('MAIL_USERNAME')])  # Send to company email
    
    company_msg.body = f"""New meeting request received!

Client Details:
- Name: {name}
- Email: {email}
- Phone: {phone}
- Company: {company or 'Not provided'}
- Website: {company_url or 'Not provided'}

Project Information:
- Project Type: {project_type}
- Budget: {budget}
- Message: {message}

Requested Meeting Time:
- Date & Time: {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
- Duration: 30 minutes

Please review this request and provide a meeting link through the admin dashboard."""

    company_msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
            .client-info {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            .project-info {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }}
            .meeting-info {{ background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 15px 0; }}
            .action-required {{ background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 15px 0; }}
            .detail-row {{ margin: 8px 0; }}
            .detail-label {{ font-weight: bold; color: #555; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📅 New Meeting Request</h2>
            </div>
            <div class="content">
                <p>A new meeting has been requested through the website.</p>
                
                <div class="client-info">
                    <h3>👤 Client Information</h3>
                    <div class="detail-row"><span class="detail-label">Name:</span> {name}</div>
                    <div class="detail-row"><span class="detail-label">Email:</span> {email}</div>
                    <div class="detail-row"><span class="detail-label">Phone:</span> {phone}</div>
                    <div class="detail-row"><span class="detail-label">Company:</span> {company or 'Not provided'}</div>
                    <div class="detail-row"><span class="detail-label">Website:</span> {f'<a href="{company_url}" target="_blank">{company_url}</a>' if company_url else 'Not provided'}</div>
                </div>
                
                <div class="project-info">
                    <h3>💼 Project Information</h3>
                    <div class="detail-row"><span class="detail-label">Project Type:</span> {project_type}</div>
                    <div class="detail-row"><span class="detail-label">Budget:</span> {budget}</div>
                    <div class="detail-row"><span class="detail-label">Message:</span><br>{message.replace(chr(10), '<br>')}</div>
                </div>
                
                <div class="meeting-info">
                    <h3>📋 Requested Meeting Time</h3>
                    <p><strong>Date & Time:</strong> {meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Duration:</strong> 30 minutes</p>
                </div>
                
                <div class="action-required">
                    <h3>⚠️ Action Required</h3>
                    <p>Please review this meeting request and provide a meeting link through the admin dashboard.</p>
                    <p>The client will be notified once you provide the meeting link.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    mail.send(company_msg)

def send_meeting_reschedule_email(mail, name, email, old_datetime, new_datetime, meeting_link):
    # Notify the user about the reschedule
    user_msg = Message('Your Meeting Has Been Rescheduled - Aidaddy',
                       recipients=[email])

    user_msg.body = f"""Dear {name},

Your meeting with Aidaddy has been rescheduled.

Old Date & Time: {old_datetime.strftime('%A, %B %d, %Y at %I:%M %p') if old_datetime else 'N/A'}
New Date & Time: {new_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}

Meeting Link: {meeting_link if meeting_link else 'Will be provided by admin'}

If you have any questions or need to reschedule again, please contact us at aidaddy.in@gmail.com

Best regards,
Aidaddy Team
"""

    user_msg.html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }}
            .meeting-details {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔁 Your Meeting Has Been Rescheduled</h1>
            </div>
            <div class="content">
                <p>Dear <strong>{name}</strong>,</p>
                <p>Your meeting with Aidaddy has been rescheduled. Details are below.</p>
                <div class="meeting-details">
                    <p><strong>Old Date & Time:</strong> {old_datetime.strftime('%A, %B %d, %Y at %I:%M %p') if old_datetime else 'N/A'}</p>
                    <p><strong>New Date & Time:</strong> {new_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Meeting Link:</strong> {meeting_link if meeting_link else 'Will be provided by admin'}</p>
                </div>
                <p>If you have any questions, reply to this email or contact us at <a href="mailto:aidaddy.in@gmail.com">aidaddy.in@gmail.com</a>.</p>
                <p>Best regards,<br/><strong>The Aidaddy Team</strong></p>
            </div>
        </div>
    </body>
    </html>
    """

    result = {
        'user': False,
        'admin': False,
        'errors': []
    }
    try:
        print(f"mail: Sending reschedule email to user {email}")
        mail.send(user_msg)
        print("mail: Sent reschedule email to user")
        result['user'] = True
    except Exception as e:
        print(f"mail: Failed to send reschedule email to user {email}: {e}")
        import traceback; traceback.print_exc()
        result['errors'].append(str(e))

    # Notify company/admin
    company_msg = Message('Meeting Rescheduled - Aidaddy', recipients=[os.getenv('MAIL_USERNAME')])
    company_msg.body = f"""Meeting has been rescheduled.

Client: {name} ({email})
Old Date & Time: {old_datetime.strftime('%A, %B %d, %Y at %I:%M %p') if old_datetime else 'N/A'}
New Date & Time: {new_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
Meeting Link: {meeting_link if meeting_link else 'Will be provided by admin'}
"""

    company_msg.html = f"""
    <html>
    <body>
        <div>
            <h3>Meeting Rescheduled</h3>
            <p><strong>Client:</strong> {name} ({email})</p>
            <p><strong>Old Date & Time:</strong> {old_datetime.strftime('%A, %B %d, %Y at %I:%M %p') if old_datetime else 'N/A'}</p>
            <p><strong>New Date & Time:</strong> {new_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
            <p><strong>Meeting Link:</strong> {meeting_link if meeting_link else 'Will be provided by admin'}</p>
        </div>
    </body>
    </html>
    """

    try:
        print(f"mail: Sending reschedule notification to company {os.getenv('MAIL_USERNAME')}")
        mail.send(company_msg)
        print("mail: Sent reschedule notification to company")
        result['admin'] = True
    except Exception as e:
        print(f"mail: Failed to send reschedule notification to company: {e}")
        import traceback; traceback.print_exc()
        result['errors'].append(str(e))

    print(f"mail: send_contact_email result: {result}")
    return result