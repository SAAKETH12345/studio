'use server';
/**
 * @fileOverview Explains a complex calculation using AI.
 *
 * - explainCalculation - A function that handles the calculation explanation process.
 * - ExplainCalculationInput - The input type for the explainCalculation function.
 * - ExplainCalculationOutput - The return type for the explainCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCalculationInputSchema = z.object({
  calculation: z
    .string()
    .describe('The complex mathematical calculation to be explained.'),
});
export type ExplainCalculationInput = z.infer<typeof ExplainCalculationInputSchema>;

const ExplainCalculationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The AI-generated explanation of the calculation steps.'),
});
export type ExplainCalculationOutput = z.infer<typeof ExplainCalculationOutputSchema>;

export async function explainCalculation(input: ExplainCalculationInput): Promise<ExplainCalculationOutput> {
  return explainCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCalculationPrompt',
  input: {schema: ExplainCalculationInputSchema},
  output: {schema: ExplainCalculationOutputSchema},
  prompt: `You are an expert mathematical explainer. Your task is to break down complex calculations into simple, understandable steps.

Calculation: {{{calculation}}}

Explain the calculation step by step.`,
});

const explainCalculationFlow = ai.defineFlow(
  {
    name: 'explainCalculationFlow',
    inputSchema: ExplainCalculationInputSchema,
    outputSchema: ExplainCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
