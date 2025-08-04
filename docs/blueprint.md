# **App Name**: ShopGraph AI

## Core Features:

- Voice Input: Speech-to-text transcription: Record user's speech via a button and transcribe it into the input text box, using an LLM as a tool.
- AI Recipe Suggestion: Recipe suggestion: Use the Recipe Agent (LLM as tool) to suggest recipes based on user's request. The AI considers the budget and number of people, leveraging an LLM to evaluate relevant data.
- Ingredient Mapping: Intelligent ingredient mapping: Product Finder Agent uses LLM to match ingredients from the recipe to products available at Walmart using the SerpAPI. LLM is a tool, making an inference to correctly map items to products.
- Budget Adherence: Budgeting: The budgeting agent checks if all items fits within a specified budget. LLM used as a tool. For products with prices that weren't available on Walmart, it includes an estimation using 2025 prices. Final price adjustment suggested in summary.
- Shopping List UI: Interactive Shopping List: Displays final list of required products, including photos and prices, alongside the total estimated cost.
- Walmart API Integration: API Integration: Retrieve and display available products and their prices at Walmart, using SerpAPI.
- Recipe Caching: Caching system for popular recipes, minimizing the need to call the LLM unnecessarily, speeding the performance, and saving compute.

## Style Guidelines:

- Primary color: Fresh green (#8ACB88) evokes feelings of healthy eating and natural choices.
- Background color: Soft, desaturated green (#F0FAF0).
- Accent color: Light yellow (#DCE884) provides visual contrast to highlight important UI elements such as interactive buttons.
- Font pairing: 'Belleza' (sans-serif) for headings, 'Alegreya' (serif) for body text.
- Use simple, modern line icons to represent food categories and shopping actions.
- Clean and intuitive layout with a prominent search bar and categorized product display.
- Subtle transitions and loading animations to provide a smooth user experience.