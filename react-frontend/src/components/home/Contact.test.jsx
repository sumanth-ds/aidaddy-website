import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import * as apiService from '../../services/api';
import { vi } from 'vitest';

describe('Contact component', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('submits the form successfully and shows a success message', async () => {
        const mockResponse = { message: 'Thanks! We received your message.' };
        vi.spyOn(apiService, 'submitContact').mockResolvedValue(mockResponse);

        render(<Contact />);

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const subjectInput = screen.getByLabelText(/subject/i);
        const messageTextarea = screen.getByLabelText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send message/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(subjectInput, 'Project inquiry');
        await userEvent.type(messageTextarea, 'I would like to know more about your services.');

        await userEvent.click(submitButton);

        // Button should be disabled during submit
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/sending/i);

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/thanks! we received your message\.|thank you for contacting us!/i)).toBeInTheDocument();
        });

        // Inputs should be cleared
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(subjectInput).toHaveValue('');
        expect(messageTextarea).toHaveValue('');

        // API called with expected payload
        expect(apiService.submitContact).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            message: expect.stringContaining('Subject: Project inquiry'),
        });
    });

    it('displays an error message when submission fails', async () => {
        const error = { response: { data: { message: 'Validation failed: email invalid' } } };
        vi.spyOn(apiService, 'submitContact').mockRejectedValue(error);

        render(<Contact />);

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const subjectInput = screen.getByLabelText(/subject/i);
        const messageTextarea = screen.getByLabelText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send message/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'not-an-email');
        await userEvent.type(subjectInput, 'Project inquiry');
        await userEvent.type(messageTextarea, 'I would like to know more about your services.');

        await userEvent.click(submitButton);

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/validation failed: email invalid/i)).toBeInTheDocument();
        });

        // Button should be enabled again
        expect(submitButton).not.toBeDisabled();
    });
});
