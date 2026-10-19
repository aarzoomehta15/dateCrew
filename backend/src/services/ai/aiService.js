/**
 * AI Adapter — Google Gemini & OpenAI integration for match explanations and introduction drafts.
 * 
 * Uses deterministic scoring as the authoritative source of truth.
 * Generates contextual qualitative explanations strictly grounded in profile facts.
 * Falls back to template-based explanations when AI API keys are not supplied.
 */

import config from '../../config/index.js';
import { aiResponseSchema } from '../../validators/schemas.js';

let geminiClient = null;
let openaiClient = null;

async function getGeminiModel() {
  if (!config.geminiApiKey) return null;
  if (geminiClient) return geminiClient;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    geminiClient = genAI.getGenerativeModel({
      model: config.geminiModel || 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction: SYSTEM_PROMPT,
    });
    return geminiClient;
  } catch (err) {
    console.warn('Google Generative AI SDK initialization warning:', err.message);
    return null;
  }
}

async function getOpenAIClient() {
  if (!config.openaiApiKey) return null;
  if (openaiClient) return openaiClient;

  try {
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
    return openaiClient;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are an assistant helping a professional human matchmaker explain potential compatibility.
Use only the profile facts and deterministic scoring results provided to you.
Never invent hobbies, personal history, family details, preferences, or achievements.
Never infer personality traits from gender, religion, caste, income, education, or other demographic attributes.
Explain two or three specific compatibility factors and any important known tradeoffs.
Use warm, respectful, nonjudgmental language.
Do not claim that a numerical score predicts marriage success.
Do not make the final matchmaking decision.
Return only valid JSON matching this schema:
{
  "summary": "2-3 sentence overview of why this pair has potential",
  "reasons": ["Specific compatibility factor 1", "Specific factor 2"],
  "considerations": ["Tradeoff or discussion topic 1"],
  "introductionDraft": "Short, personalized introduction email draft to the customer"
}`;

/**
 * Generate AI-assisted explanation and introduction draft
 */
export async function generateExplanation({
  customer,
  candidate,
  score,
  scoreBreakdown,
  positiveReasons,
  potentialConflicts,
}) {
  const safeCustomer = {
    firstName: customer.firstName,
    age: customer.age,
    city: customer.city,
    highestEducation: customer.highestEducation,
    designation: customer.designation,
    interests: customer.interests,
    dietaryPreference: customer.dietaryPreference,
    familyValues: customer.familyValues,
  };

  const safeCandidate = {
    firstName: candidate.firstName,
    age: candidate.age,
    city: candidate.city,
    highestEducation: candidate.highestEducation,
    designation: candidate.designation,
    interests: candidate.interests,
    dietaryPreference: candidate.dietaryPreference,
    familyValues: candidate.familyValues,
  };

  const userPrompt = `Analyze compatibility between:
Customer: ${JSON.stringify(safeCustomer)}
Candidate: ${JSON.stringify(safeCandidate)}

Overall Compatibility Score: ${score}/100
Category Breakdown: ${JSON.stringify(scoreBreakdown)}
Identified Compatibility Factors: ${JSON.stringify(positiveReasons)}
Identified Tradeoffs: ${JSON.stringify(potentialConflicts)}

Generate an explainability summary, key reasons, considerations, and an introductory email draft as valid JSON.`;

  // 1. Try Google Gemini first (free tier)
  const gemini = await getGeminiModel();
  if (gemini) {
    try {
      const result = await gemini.generateContent(userPrompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validated = aiResponseSchema.parse(parsed);
      return {
        ...validated,
        source: 'gemini',
        humanReviewRequired: true,
      };
    } catch (err) {
      console.warn('Gemini generation notice:', err.message);
    }
  }

  // 2. Try OpenAI if configured
  const openai = await getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: config.openaiModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const content = response.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const validated = aiResponseSchema.parse(parsed);
        return {
          ...validated,
          source: 'openai',
          humanReviewRequired: true,
        };
      }
    } catch (err) {
      console.warn('OpenAI generation notice:', err.message);
    }
  }

  // 3. Built-in Deterministic Fallback Engine
  return generateFallbackExplanation({
    customer,
    candidate,
    score,
    scoreBreakdown,
    positiveReasons,
    potentialConflicts,
  });
}

/**
 * Generate template-based fallback explanation when external AI is unavailable
 */
export function generateFallbackExplanation({
  customer,
  candidate,
  score,
  scoreBreakdown,
  positiveReasons,
  potentialConflicts,
}) {
  const custName = customer.firstName || 'the customer';
  const candName = candidate.firstName || 'the candidate';

  let summary = `Based on our compatibility analysis, ${candName} received a score of ${score}/100 for ${custName}. `;
  if (positiveReasons && positiveReasons.length > 0) {
    summary += `Key compatibility factors include ${positiveReasons.slice(0, 2).join(' and ').toLowerCase()}. `;
  }
  if (potentialConflicts && potentialConflicts.length > 0) {
    summary += `Some areas may need discussion: ${potentialConflicts[0].toLowerCase()}.`;
  }

  const reasons = (positiveReasons && positiveReasons.length > 0)
    ? positiveReasons.slice(0, 3)
    : [`Compatibility score of ${score}/100 based on available profile data`];

  const considerations = (potentialConflicts && potentialConflicts.length > 0)
    ? potentialConflicts.slice(0, 2)
    : ['Review profile details for any personal preferences not captured in the scoring'];

  const sharedDetails = [];
  if (customer.city && candidate.city && customer.city === candidate.city) {
    sharedDetails.push(`both being based in ${customer.city}`);
  }
  if (positiveReasons && positiveReasons.length > 0) {
    sharedDetails.push(positiveReasons[0].toLowerCase());
  }

  const introductionDraft = `Dear ${custName},\n\nWe would like to introduce you to ${candName}, whom our team has identified as a potential match for you${sharedDetails.length > 0 ? `, noting ${sharedDetails.join(' and ')}` : ''}.\n\nWe believe this could be a meaningful connection worth exploring. Our matchmaking team is available to discuss this recommendation and answer any questions you may have.\n\nWarm regards,\nThe Date Crew`;

  return {
    summary,
    reasons,
    considerations,
    introductionDraft,
    humanReviewRequired: true,
    source: 'template',
  };
}
