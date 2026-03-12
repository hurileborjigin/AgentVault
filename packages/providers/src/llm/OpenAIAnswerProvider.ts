import OpenAI from "openai";
import { AnswerProvider, Citation, RetrievedChunk } from "@agents-vault/core";
import { buildPrompt, buildFallbackCitations } from "./promptUtils";

export class OpenAIAnswerProvider implements AnswerProvider {
  private readonly client: OpenAI;

  constructor(private readonly answerModel: string) {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async answer(input: {
    question: string;
    context: RetrievedChunk[];
    instructions?: string;
  }): Promise<{ answer: string; citations: Citation[] }> {
    const prompt = buildPrompt(input.question, input.context, input.instructions);
    const response = await this.client.responses.create({
      model: this.answerModel,
      input: prompt,
      temperature: 0,
    });

    const answer = response.output_text?.trim() || "Insufficient evidence from retrieved context.";
    return { answer, citations: buildFallbackCitations(input.context) };
  }

  model(): string {
    return this.answerModel;
  }
}
