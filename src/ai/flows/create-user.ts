'use server';

/**
 * @fileOverview A user creation flow for Firebase Authentication.
 *
 * - createUser - A function that handles creating a new user.
 * - CreateUserInput - The input type for the createUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  // When running in a Google Cloud environment, the SDK will automatically
  // detect the service account credentials.
  admin.initializeApp();
}

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export async function createUser(input: CreateUserInput): Promise<admin.auth.UserRecord> {
  return createUserFlow(input);
}

const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    try {
      const userRecord = await admin.auth().createUser({
        email: input.email,
        password: input.password,
      });
      return userRecord;
    } catch (error: any) {
      // Throw a more specific error message to the client
      if (error.code === 'auth/email-already-exists') {
        throw new Error('A user with this email address already exists.');
      }
      if (error.code === 'auth/invalid-password') {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred while creating the user.');
    }
  }
);
