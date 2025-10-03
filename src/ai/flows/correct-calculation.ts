/**
 * @fileOverview A Genkit flow that allows users to correct a misheard voice input for a calculation.
 *
 * - correctCalculation - A function that takes the original misheard input and the correct input, then returns the corrected calculation.
 * - CorrectCalculationInput - The input type for the correctCalculation function.
 * - CorrectCalculationOutput - The return type for the correctCalculation function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectCalculationInputSchema = z.object({
  originalInput: z
    .string()
    .describe('The original misheard voice input for the calculation.'),
  correctedInput: z.string().describe('The corrected voice input for the calculation.'),
});

export type CorrectCalculationInput = z.infer<typeof CorrectCalculationInputSchema>;

const CorrectCalculationOutputSchema = z.object({
  calculation: z.string().describe('The corrected calculation to be performed.'),
});

export type CorrectCalculationOutput = z.infer<typeof CorrectCalculationOutputSchema>;

export async function correctCalculation(input: CorrectCalculationInput): Promise<CorrectCalculationOutput> {
  return correctCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctCalculationPrompt',
  input: {schema: CorrectCalculationInputSchema},
  output: {schema: CorrectCalculationOutputSchema},
  prompt: `You are an AI assistant that corrects misheard calculations.

The user originally said: {{{originalInput}}}

But they meant to say: {{{correctedInput}}}

Return the corrected calculation, so it can be performed by the calculator.

Corrected calculation:`,
});

const correctCalculationFlow = ai.defineFlow(
  {
    name: 'correctCalculationFlow',
    inputSchema: CorrectCalculationInputSchema,
    outputSchema: CorrectCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
