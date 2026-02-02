import { db } from "./db";
import {
  recordings,
  type InsertRecording,
  type Recording,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRecordings(): Promise<Recording[]>;
  createRecording(recording: InsertRecording): Promise<Recording>;
}

export class DatabaseStorage implements IStorage {
  async getRecordings(): Promise<Recording[]> {
    return await db.select().from(recordings);
  }

  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    const [recording] = await db.insert(recordings).values(insertRecording).returning();
    return recording;
  }
}

export const storage = new DatabaseStorage();
