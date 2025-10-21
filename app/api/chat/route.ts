import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chatMessages, events } from "@/db/schema/time-audit";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  aiCreateEventSchema,
  aiUpdateEventSchema,
  aiDeleteEventSchema,
  CreateEventInput,
  UpdateEventInput
} from "@/lib/validations";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Time management system prompt
const SYSTEM_PROMPT = `You are an expert time management and productivity coach AI assistant. Your purpose is to help users audit their time, optimize their schedules, and build better habits.

Your key capabilities:
1. **Schedule Analysis**: Help users analyze their current time allocation and identify patterns
2. **Productivity Insights**: Provide personalized recommendations for improving productivity
3. **Habit Building**: Guide users in building sustainable time management habits
4. **Schedule Optimization**: Help users plan better daily and weekly schedules
5. **Time Auditing**: Analyze past activities to identify where time is being spent

Your communication style:
- Be encouraging and supportive, not critical or judgmental
- Ask clarifying questions to understand the user's goals and constraints
- Provide actionable, specific recommendations
- Use data and examples to support your advice
- Consider work-life balance and wellbeing in your recommendations

You can help users manage their schedule by:
- Creating new events/schedule items
- Updating existing events
- Deleting events that are no longer needed
- Analyzing time patterns and providing insights
- Suggesting optimizations for their daily routine

When users talk about their schedule, plans, or activities, proactively offer to help them organize and optimize their time.`;

// Helper functions for database operations
async function createEvent(userId: string, data: CreateEventInput) {
  const [event] = await db
    .insert(events)
    .values({
      ...data,
      userId,
    })
    .returning();
  return event;
}

async function updateEvent(userId: string, eventId: string, data: UpdateEventInput) {
  const [event] = await db
    .update(events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .returning();
  return event;
}

async function deleteEvent(userId: string, eventId: string) {
  await db
    .delete(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)));
}

async function getRecentEvents(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await db
    .select()
    .from(events)
    .where(and(
      eq(events.userId, userId),
      gte(events.startTime, startDate)
    ))
    .orderBy(desc(events.startTime));
}

async function getRecentChatHistory(userId: string, limit: number = 10) {
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.timestamp))
    .limit(limit);
}

async function saveChatMessage(
  userId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: any
) {
  await db.insert(chatMessages).values({
    userId,
    role,
    content,
    timestamp: new Date(),
    metadata,
  });
}

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1];

    // Save the user message to chat history
    await saveChatMessage(session.user.id, "user", userMessage.content);

    // Get recent events and chat history for context
    const [recentEvents, chatHistory] = await Promise.all([
      getRecentEvents(session.user.id),
      getRecentChatHistory(session.user.id),
    ]);

    // Format chat history for context
    const formattedHistory = chatHistory
      .reverse()
      .slice(0, -1) // Exclude the current user message
      .map(msg => ({ role: msg.role, content: msg.content }));

    // Format events for context
    const eventsContext = recentEvents.length > 0
      ? `Recent schedule:\n${recentEvents.map(event =>
          `- ${event.title} (${event.category}): ${event.startTime.toLocaleDateString()} ${event.startTime.toLocaleTimeString()} - ${event.endTime.toLocaleTimeString()}`
        ).join('\n')}`
      : "No recent schedule events found.";

    // Create enhanced system prompt with user context
    const contextAwareSystemPrompt = `${SYSTEM_PROMPT}

Current user context:
${eventsContext}

Date: ${new Date().toLocaleDateString()}

You have access to tools to help manage the user's schedule. Use them when appropriate to help users organize their time better.`;

    const result = streamText({
      model: openai("gpt-4o"),
      system: contextAwareSystemPrompt,
      messages: [
        ...formattedHistory,
        userMessage,
      ],
      temperature: 0.7,
      maxTokens: 1000,
      tools: {
        createEvent: {
          description: "Create a new schedule event or appointment",
          parameters: aiCreateEventSchema,
          execute: async (params) => {
            try {
              const eventData = {
                title: params.title,
                description: params.description,
                startTime: new Date(params.startTime),
                endTime: new Date(params.endTime),
                category: params.category,
              };

              const event = await createEvent(session.user.id, eventData);
              await saveChatMessage(
                session.user.id,
                "system",
                `Created event: ${event.title}`,
                { action: "createEvent", eventId: event.id }
              );

              return {
                success: true,
                event: {
                  id: event.id,
                  title: event.title,
                  startTime: event.startTime.toISOString(),
                  endTime: event.endTime.toISOString(),
                  category: event.category,
                },
              };
            } catch (error) {
              console.error("Error creating event:", error);
              return {
                success: false,
                error: "Failed to create event. Please try again.",
              };
            }
          },
        },
        updateEvent: {
          description: "Update an existing schedule event",
          parameters: aiUpdateEventSchema,
          execute: async (params) => {
            try {
              const updateData: UpdateEventInput = {};
              if (params.title !== undefined) updateData.title = params.title;
              if (params.description !== undefined) updateData.description = params.description;
              if (params.startTime !== undefined) updateData.startTime = new Date(params.startTime);
              if (params.endTime !== undefined) updateData.endTime = new Date(params.endTime);
              if (params.category !== undefined) updateData.category = params.category;

              const event = await updateEvent(session.user.id, params.id, updateData);
              if (!event) {
                return {
                  success: false,
                  error: "Event not found or you don't have permission to update it.",
                };
              }

              await saveChatMessage(
                session.user.id,
                "system",
                `Updated event: ${event.title}`,
                { action: "updateEvent", eventId: event.id }
              );

              return {
                success: true,
                event: {
                  id: event.id,
                  title: event.title,
                  startTime: event.startTime.toISOString(),
                  endTime: event.endTime.toISOString(),
                  category: event.category,
                },
              };
            } catch (error) {
              console.error("Error updating event:", error);
              return {
                success: false,
                error: "Failed to update event. Please try again.",
              };
            }
          },
        },
        deleteEvent: {
          description: "Delete an existing schedule event",
          parameters: aiDeleteEventSchema,
          execute: async (params) => {
            try {
              // Get event details before deleting for confirmation
              const [eventToDelete] = await db
                .select()
                .from(events)
                .where(and(eq(events.id, params.id), eq(events.userId, session.user.id)));

              if (!eventToDelete) {
                return {
                  success: false,
                  error: "Event not found or you don't have permission to delete it.",
                };
              }

              await deleteEvent(session.user.id, params.id);

              await saveChatMessage(
                session.user.id,
                "system",
                `Deleted event: ${eventToDelete.title}`,
                { action: "deleteEvent", eventId: params.id }
              );

              return {
                success: true,
                deletedEvent: {
                  id: eventToDelete.id,
                  title: eventToDelete.title,
                },
              };
            } catch (error) {
              console.error("Error deleting event:", error);
              return {
                success: false,
                error: "Failed to delete event. Please try again.",
              };
            }
          },
        },
      },
      onFinish: async (result) => {
        // Save the assistant's response
        await saveChatMessage(session.user.id, "assistant", result.text);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}