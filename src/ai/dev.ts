import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipes-from-input.ts';
import '@/ai/flows/transcribe-speech-to-text.ts';
import '@/ai/flows/map-ingredients-to-walmart-products.ts';
import '@/ai/flows/estimate-price-and-adjust-budget.ts';