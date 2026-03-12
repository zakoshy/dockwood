'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating SEO-friendly product content.
 *
 * - generateProductContent - A function that generates SEO-friendly product descriptions, meta titles, and meta descriptions.
 * - GenerateProductContentInput - The input type for the generateProductContent function.
 * - GenerateProductContentOutput - The return type for the generateProductContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {gemini15Flash} from '@genkit-ai/google-genai';

const GenerateProductContentInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z
    .string()
    .describe('The category of the product, e.g., "Beds", "Timber", "Chairs".'),
  companyName: z
    .string()
    .default("Dockwood Furniture's")
    .describe('The name of the company.'),
  companyAddress: z
    .string()
    .default(
      'Bombolulu, Kisimani, Opposite Nivash Supermarket Bombolulu, Opposite Petrocity Bombolulu, Mombasa, Kenya'
    )
    .describe('The address of the company.'),
  companyServices: z
    .string()
    .default(
      'Same-Day Delivery Available, Timber Supplier and Furniture Shop (Beds, Chairs, Tables, Timber Products)'
    )
    .describe('The services offered by the company.'),
  targetKeywords: z
    .array(z.string())
    .default([
      'timber suppliers in Mombasa',
      'furniture shops in Mombasa',
      'beds for sale in Mombasa',
      'wood furniture Mombasa',
      'timber Kenya',
      'buy beds chairs tables Mombasa',
    ])
    .describe('A list of target SEO keywords relevant to the business.'),
});
export type GenerateProductContentInput = z.infer<
  typeof GenerateProductContentInputSchema
>;

const GenerateProductContentOutputSchema = z.object({
  productDescription: z
    .string()
    .describe(
      'An SEO-friendly and engaging product description, highlighting features, benefits, and quality, incorporating relevant keywords naturally.'
    ),
  metaTitle: z
    .string()
    .describe(
      'A concise and catchy meta title (max 60 characters) optimized for search engines, including the product name, category, company name, and location.'
    ),
  metaDescription: z
    .string()
    .describe(
      'A brief summary (max 160 characters) of the product and company, designed to attract clicks from search results. It should include keywords and a call to action if appropriate.'
    ),
});
export type GenerateProductContentOutput = z.infer<
  typeof GenerateProductContentOutputSchema
>;

export async function generateProductContent(
  input: GenerateProductContentInput
): Promise<GenerateProductContentOutput> {
  return generateProductContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductContentPrompt',
  model: gemini15Flash,
  input: {schema: GenerateProductContentInputSchema},
  output: {schema: GenerateProductContentOutputSchema},
  prompt: `You are an expert in SEO and e-commerce content generation for a timber and furniture company called {{companyName}}.
Your task is to generate an SEO-friendly product description, meta title, and meta description for a product.
Consider the company's location, services, and target keywords when generating the content.

Company Name: {{companyName}}
Company Address: {{companyAddress}}
Company Services: {{companyServices}}
Target SEO Keywords: {{#each targetKeywords}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}

Product Name: "{{productName}}"
Product Category: "{{productCategory}}"

Generate the content using the output format provided by the schema. Ensure that the meta title is around 60 characters and the meta description is around 160 characters.`,
});

const generateProductContentFlow = ai.defineFlow(
  {
    name: 'generateProductContentFlow',
    inputSchema: GenerateProductContentInputSchema,
    outputSchema: GenerateProductContentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate product content. Please check your API key and network connection.');
    }
    return output;
  }
);
