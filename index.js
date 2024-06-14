const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const All_task = client.db("All_task");
    const tasks = All_task.collection("tasks");

    console.log("You successfully connected to MongoDB!");

    // Route to create a new task
    app.post("/tasks", async (req, res) => {
      try {
        const task = req.body; 
        const result = await tasks.insertOne(task); 
        res.send(result);
      } catch (error) {
        console.error("Error creating task", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Route to get all tasks
    app.get("/tasks", async (req, res) => {
      try {
        const taskList = await tasks.find().toArray(); 
        res.status(200).json(taskList); 
      } catch (error) {
        console.error("Error retrieving tasks", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Route to get a task by ID
    app.get("/tasks/:taskId", async (req, res) => {
      try {
        const taskId = req.params.taskId; 
        const task = await tasks.findOne({ _id: new ObjectId(taskId) }); 
        if (task) {
          res.status(200).json(task);
        } else {
          res.status(404).json({ message: "Task not found" });
        }
      } catch (error) {
        console.error("Error retrieving task", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Route to update a task by ID
    app.put("/tasks/:taskId", async (req, res) => {
      try {
        const taskId = req.params.taskId; 
        const updatedTask = req.body; 
        const result = await tasks.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTask }
        ); 
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Task updated successfully" });
        } else {
          res.status(404).json({ message: "Task not found" });
        }
      } catch (error) {
        console.error("Error updating task", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Route to delete a task by ID
    app.delete("/tasks/:taskId", async (req, res) => {
      try {
        const taskId = req.params.taskId; 
        const result = await tasks.deleteOne({ _id: new ObjectId(taskId) }); 
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Task deleted successfully" });
        } else {
          res.status(404).json({ message: "Task not found" });
        }
      } catch (error) {
        console.error("Error deleting task", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Route to update task status
    app.patch("/tasks/:taskId/status", async (req, res) => {
      try {
        const taskId = req.params.taskId; 
        const { status } = req.body; 
        const result = await tasks.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { status } }
        ); 
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Task status updated successfully" });
        } else {
          res.status(404).json({ message: "Task not found" });
        }
      } catch (error) {
        console.error("Error updating task status", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

  } finally {
    //await client.close();
  }
}

run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
