'use server';
/**
 * @fileOverview A flow that transcribes speech to text using an LLM.
 *
 * - transcribeSpeechToText - A function that handles the speech transcription process.
 * - TranscribeSpeechToTextInput - The input type for the transcribeSpeechToText function.
 * - TranscribeSpeechToTextOutput - The return type for the transcribeSpeechToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeSpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A data URI containing the audio to transcribe, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' for example data:audio/webm;base64,YWFh'
    ),
});
export type TranscribeSpeechToTextInput = z.infer<typeof TranscribeSpeechToTextInputSchema>;

const TranscribeSpeechToTextOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeSpeechToTextOutput = z.infer<typeof TranscribeSpeechToTextOutputSchema>;

export async function transcribeSpeechToText(input: TranscribeSpeechToTextInput): Promise<TranscribeSpeechToTextOutput> {
  return transcribeSpeechToTextFlow(input);
}

const transcribeSpeechToTextPrompt = ai.definePrompt({
  name: 'transcribeSpeechToTextPrompt',
  input: {schema: TranscribeSpeechToTextInputSchema},
  output: {schema: TranscribeSpeechToTextOutputSchema},
  prompt: `Transcribe the following audio to text:\n\n{{media url=audioDataUri}}`,
});

const transcribeSpeechToTextFlow = ai.defineFlow(
  {
    name: 'transcribeSpeechToTextFlow',
    inputSchema: TranscribeSpeechToTextInputSchema,
    outputSchema: TranscribeSpeechToTextOutputSchema,
  },
  async input => {
    const {output} = await transcribeSpeechToTextPrompt(input);
    return output!;
  }
);
