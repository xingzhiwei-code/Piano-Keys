import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.recordings.list.path, async (req, res) => {
    const recordings = await storage.getRecordings();
    res.json(recordings);
  });

  app.post(api.recordings.create.path, async (req, res) => {
    try {
      const input = api.recordings.create.input.parse(req.body);
      const recording = await storage.createRecording(input);
      res.status(201).json(recording);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
