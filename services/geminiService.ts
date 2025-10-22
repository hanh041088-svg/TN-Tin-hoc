
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

// Fix: Initialize the GoogleGenAI client according to the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Fix: Define a response schema to ensure the AI returns data in the expected JSON format.
const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: 'An array of quiz questions.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'The quiz question text.'
          },
          options: {
            type: Type.ARRAY,
            description: 'An array of possible answers. For multiple-choice questions, there should be 4 options. For True/False questions, the options must be ["Đúng", "Sai"].',
            items: {
              type: Type.STRING,
            }
          },
          correctAnswer: {
            type: Type.STRING,
            description: 'The correct answer, which must be one of the strings from the options array.'
          },
          explanation: {
            type: Type.STRING,
            description: 'A brief and clear explanation for why the correct answer is right.'
          }
        },
        required: ['question', 'options', 'correctAnswer', 'explanation'],
      }
    }
  },
  required: ['questions'],
};


export const generateQuizQuestions = async (lesson: string, numberOfQuestions: number): Promise<Question[]> => {
  try {
    const prompt = `Tạo một bài kiểm tra gồm chính xác ${numberOfQuestions} câu hỏi cho học sinh lớp 11 về bài học: "${lesson}".
    Trong đó, hãy bao gồm chính xác 4 câu hỏi dạng Đúng/Sai. Các câu hỏi Đúng/Sai phải có các lựa chọn là ["Đúng", "Sai"].
    Các câu hỏi còn lại phải là câu hỏi trắc nghiệm có 4 lựa chọn.
    Mỗi câu hỏi phải có một đáp án đúng duy nhất VÀ một lời giải thích ngắn gọn, rõ ràng cho đáp án đúng đó.
    Các câu hỏi cần thú vị, có độ khó đa dạng và bám sát nội dung của bài học.
    Trả về kết quả ở định dạng JSON.`;

    // Fix: Use ai.models.generateContent with a model, prompt, and JSON config.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });
    
    // Fix: Extract the text from the response and parse it as JSON.
    const responseText = response.text;
    const parsedResponse = JSON.parse(responseText);

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid response format from AI: 'questions' array not found.");
    }

    const questions: Question[] = parsedResponse.questions;

    if (questions.some(q => !q.question || !q.options || q.options.length < 2 || !q.correctAnswer || !q.options.includes(q.correctAnswer) || !q.explanation)) {
      throw new Error("Invalid question structure in AI response.");
    }
    
    return questions;

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate quiz. AI service error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the quiz.");
  }
};
