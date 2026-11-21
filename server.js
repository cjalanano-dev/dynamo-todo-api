import express from "express";
import crypto from "crypto";
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./db.js";

const app = express();
app.use(express.json());

const TABLE_NAME = "Todos";

// 1. CREATE a to-do for a user
app.post("/todos/:userId", async (req, res) => {
  try {
    const todo = {
      UserID: req.params.userId,
      TodoID: crypto.randomUUID(),
      task: req.body.task,
      completed: false,
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: todo
    }));

    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. READ all to-dos for a specific user (Uses Query, not Scan)
app.get("/todos/:userId", async (req, res) => {
  try {
    const { Items } = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "UserID = :uid",
      ExpressionAttributeValues: {
        ":uid": req.params.userId
      }
    }));

    res.json(Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE a to-do (Requires BOTH Partition Key and Sort Key)
app.patch("/todos/:userId/:todoId", async (req, res) => {
  try {
    const { completed, task } = req.body;
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        UserID: req.params.userId,
        TodoID: req.params.todoId
      },
      UpdateExpression: "SET completed = :c, task = if_not_exists(:t, task)",
      ExpressionAttributeValues: {
        ":c": completed ?? true,
        ":t": task ?? null
      },
      ReturnValues: "ALL_NEW"
    }));

    res.json(Attributes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE a to-do (Requires BOTH Partition Key and Sort Key)
app.delete("/todos/:userId/:todoId", async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        UserID: req.params.userId,
        TodoID: req.params.todoId
      }
    }));

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Todo API running on http://localhost:3000"));






















