import express from 'express';
import { usersTable } from './db/schema.ts';
import { db } from './db/index.ts';
import { eq } from 'drizzle-orm';

const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const users = await db
      .select()
      .from(usersTable);

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

app.post('/add/user', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const newUser = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password,
        ...(role && { role }),
      })
      .returning();

    res.status(201).json(newUser[0]);

  } catch (error) {
    console.error("Database Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.put('/user/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    if (!role) {
      return res.status(400).json({
        error: "Role is required",
      });
    }

    const updatedUser = await db
      .update(usersTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(updatedUser[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update user",
    });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    const deletedUser = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "User not deleted",
    });
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});