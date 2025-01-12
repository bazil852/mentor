import OpenAI from 'openai';
import type { WebinarData, WebinarKnowledgeBase } from '../types/webinar';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPEN_AI_KEY,
  dangerouslyAllowBrowser: true,
});

const KNOWLEDGE_BASE_PROMPT = `You are an expert webinar content creator trained by Russell Brunson and Dan Kennedy.
Create a comprehensive webinar knowledge base following their proven frameworks and methodologies.
Focus on creating high-converting content that delivers value while leading to a sale.

Return a JSON object with the following structure:
{
  "campaignOutline": {
    "productName": "Name of the product/service",
    "productPrice": "Special offer price",
    "regularPrice": "Regular price",
    "valueProposition": "Core value proposition"
  },
  "audienceData": {
    "niche": "Target market niche",
    "targetAudience": ["Detailed audience persona 1", "Detailed audience persona 2"]
  },
  "ultimateClientGoals": {
    "painPoint": "Primary pain point addressed",
    "shortTermGoal": "Immediate benefit",
    "longTermGoal": "Ultimate transformation"
  },
  "webinarValueProposition": {
    "secretInformation": "Unique insight or method",
    "benefits": "Key benefits summary",
    "painPoints": ["Specific pain point 1", "Specific pain point 2"],
    "solution": "Your unique solution"
  },
  "webinarSummary": {
    "name": "Compelling webinar title",
    "topics": ["Key topic 1", "Key topic 2"],
    "targetAudience": "Who this is for",
    "benefits": "What they'll learn"
  }
}`;

export async function generateKnowledgeBase(data: WebinarData): Promise<WebinarKnowledgeBase> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: KNOWLEDGE_BASE_PROMPT
        },
        {
          role: 'user',
          content: `Generate a webinar knowledge base based on this data:
          ${JSON.stringify(data, null, 2)}
          
          Follow the Perfect Webinar framework and ensure the content is compelling and conversion-focused.
          Return the response as a valid JSON object following the structure specified above.`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      console.error('Error parsing knowledge base:', parseError);
      throw new Error('Failed to parse generated knowledge base');
    }
  } catch (error) {
    console.error('Error generating knowledge base:', error);
    throw error;
  }
}

export async function generateTopicDescription(
  topicName: string,
  topicIndex: number,
  webinarDescription: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at direct marketing that studied under Dan Kennedy and Russell Brunson.
          Create compelling and conversion-focused content that follows their proven frameworks.`
        },
        {
          role: 'user',
          content: `Write a concise description for topic #${topicIndex + 1} in a webinar about:
          
          ${webinarDescription}
          
          The topic is: "${topicName}"
          
          Write 1-2 sentences that explain what should be covered in this topic.
          Focus on value and transformation, not just information.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating topic description:', error);
    throw new Error('Failed to generate topic description');
  }
}

const SLIDE_GENERATION_PROMPT = `You are an expert webinar content creator trained by Russell Brunson and Dan Kennedy.
Create high-converting webinar slides following the Perfect Webinar framework.

Return a JSON array of slides, where each slide has:
- title: Clear, compelling slide title
- content: Detailed description of what should be covered
- type: One of [intro, story, pain, solution, offer, close]
- notes: Speaking points and delivery tips

Follow this proven structure:
1. Introduction (Hook & Story)
   - Grab attention with a powerful hook
   - Share your personal story
   - Build credibility and relatability

2. Content (Break & Build)
   - Break false beliefs
   - Present new paradigms
   - Share valuable insights
   - Build anticipation for the solution

3. Offer (Present & Close)
   - Present your solution
   - Stack value
   - Handle objections
   - Create urgency
   - Call to action

Key principles:
- Each slide should flow logically to the next
- Use storytelling to maintain engagement
- Focus on transformation, not just information
- Address objections before they arise
- Build value before presenting the offer

Return the response as a JSON array.`;

export async function generateSlides(knowledgeBase: WebinarKnowledgeBase) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: SLIDE_GENERATION_PROMPT
        },
        {
          role: 'user',
          content: `Create a complete set of webinar slides based on this knowledge base:
          ${JSON.stringify(knowledgeBase, null, 2)}
          
          Follow the Perfect Webinar framework and ensure the slides flow naturally.
          Return an array of slides with title, content, type, and notes.`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    try {
      const slides = JSON.parse(content);
      if (!Array.isArray(slides)) {
        throw new Error('Invalid response format');
      }

      return slides.map((slide: any, index: number) => ({
        id: `slide-${index + 1}`,
        title: slide.title || 'Untitled Slide',
        content: slide.content || '',
        type: slide.type || 'story',
        notes: slide.notes || ''
      }));
    } catch (parseError) {
      console.error('Error parsing slides:', parseError);
      throw new Error('Failed to parse generated slides');
    }
  } catch (error) {
    console.error('Error generating slides:', error);
    throw error;
  }
}