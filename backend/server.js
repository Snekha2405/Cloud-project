require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Add this import

const app = express();
const port = process.env.PORT || 3000;

// ✅ FIXED: Updated OpenAI Configuration (New Syntax)
const { AzureOpenAI } = require('openai');

const openaiClient = new AzureOpenAI({
  endpoint: process.env.ENDPOINT ,
  apiKey: process.env.APIKEY ,
  deployment: process.env.DEPLOYMENT ,
  apiVersion:process.env.APIVERSION
});

// ✅ OPTIONAL: Bot Framework (only if you need Azure Bot Service)
// const { BotFrameworkAdapter, MessageFactory } = require('botbuilder');
// const adapter = new BotFrameworkAdapter({
//   appId: process.env.MICROSOFT_APP_ID,
//   appPassword: process.env.MICROSOFT_APP_PASSWORD
// });

// Enable CORS and JSON parsing
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'role']
}));
app.use(express.json({ limit: '10mb' }));

// Cosmos DB setup
const client = new CosmosClient({
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY
});

const dbName = process.env.COSMOS_DBNAME;
const eventsContainer = "Events";
const bookingsContainer = "Registrations";

// Utility functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateBookingId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `booking_${timestamp}_${random}`;
};

// Admin credentials and middleware
const ADMIN_CREDENTIALS = {
  email: "admin@college.com",
  password: "admin123",
  role: "admin"
};

const requireAdmin = (req, res, next) => {
  const { role } = req.headers;
  if (role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }
  next();
};

// ✅ FIXED: Chatbot endpoint with new OpenAI syntax



// Rest of your existing code remains the same until the chatbot endpoint...

// ✅ CORRECTED: Chatbot endpoint using AzureOpenAI client
app.post("/api/chatbot/query", async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`🤖 Chatbot query from ${userId || 'anonymous'}: ${query}`);

    // Get current events data for context
    const { resources: events } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c ORDER BY c.date")
      .fetchAll();

    // Prepare context for AI
    const eventsContext = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: event.description,
      category: event.category || 'General'
    }));

    const systemPrompt = `You are an AI assistant for a college event management system. Today's date: ${new Date().toISOString().split('T')[0]}.

Available events: ${JSON.stringify(eventsContext, null, 2)}

Guidelines:
- Help students find information about events
- Be conversational and helpful
- For "upcoming events", filter by dates after today
- For "free events", mention all available events
- Include event names, dates, venues, and brief descriptions
- Keep responses concise but informative
- Use friendly, student-appropriate language`;

    // ✅ CORRECTED: Using the correct Azure OpenAI client call
    const completion = await openaiClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      model: "gpt-35-turbo", // Use your deployment name
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    console.log(`🤖 AI Response generated successfully`);

    res.json({
      query: query,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      eventCount: events.length
    });

  } catch (err) {
    console.error("❌ Chatbot error:", err);
    res.status(500).json({ 
      error: "Sorry, I'm having trouble processing your request right now. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Rest of your code remains exactly the same...


// Admin endpoints
app.post("/api/admin/login", async (req, res) => {
  console.log('=== ADMIN LOGIN ROUTE HIT ===');
  console.log('Request body:', req.body);
    
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      console.log('Invalid credentials provided');
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    console.log('Admin login successful');
    res.json({
      message: "Admin login successful",
      admin: {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role
      }
    });

  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  try {
    const { name, description, date, venue, capacity } = req.body;

    if (!name || !date || !venue) {
      return res.status(400).json({ error: "Name, date, and venue are required" });
    }

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      name: name.trim(),
      description: description?.trim() || "",
      date: date,
      venue: venue.trim(),
      capacity: capacity || 100,
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    };

    const { resource: createdEvent } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.create(event);

    console.log(`Event created: ${eventId}`);
    res.status(201).json({
      message: "Event created successfully",
      event: createdEvent
    });

  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Error creating event: " + err.message });
  }
});

app.delete("/api/admin/events/:eventId", requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;

    const { resources: registrations } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query({
        query: "SELECT * FROM c WHERE c.eventId = @eventId",
        parameters: [{ name: "@eventId", value: eventId }]
      })
      .fetchAll();

    for (const registration of registrations) {
      await client
        .database(dbName)
        .container(bookingsContainer)
        .item(registration.id, registration.eventId)
        .delete();
    }

    await client
      .database(dbName)
      .container(eventsContainer)
      .item(eventId, eventId)
      .delete();

    console.log(`Event deleted: ${eventId} along with ${registrations.length} registrations`);
    res.json({ 
      message: "Event and all registrations deleted successfully", 
      eventId,
      deletedRegistrations: registrations.length 
    });

  } catch (err) {
    console.error("Error deleting event:", err);
    if (err.code === 404) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Error deleting event: " + err.message });
  }
});

app.get("/api/admin/events", requireAdmin, async (req, res) => {
  try {
    const { resources: events } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c ORDER BY c.date")
      .fetchAll();

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const { resources: registrations } = await client
          .database(dbName)
          .container(bookingsContainer)
          .items.query({
            query: "SELECT * FROM c WHERE c.eventId = @eventId",
            parameters: [{ name: "@eventId", value: event.id }]
          })
          .fetchAll();

        return {
          ...event,
          registrationCount: registrations.length
        };
      })
    );

    res.json({
      totalEvents: events.length,
      events: eventsWithCounts
    });

  } catch (err) {
    console.error("Error fetching admin events:", err);
    res.status(500).json({ error: "Error fetching events: " + err.message });
  }
});

app.get("/api/admin/registrations", requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.query;

    let querySpec;
    if (eventId) {
      querySpec = {
        query: "SELECT * FROM c WHERE c.eventId = @eventId ORDER BY c.bookingDate DESC",
        parameters: [{ name: "@eventId", value: eventId }]
      };
    } else {
      querySpec = "SELECT * FROM c ORDER BY c.bookingDate DESC";
    }

    const { resources: registrations } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query(querySpec)
      .fetchAll();

    res.json({
      totalRegistrations: registrations.length,
      eventId: eventId || "all",
      registrations: registrations
    });

  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Error fetching registrations: " + err.message });
  }
});

app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const { resources: events } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    const { resources: registrations } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(event => event.date >= today);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = registrations.filter(
      reg => new Date(reg.bookingDate) >= sevenDaysAgo
    );

    res.json({
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      totalRegistrations: registrations.length,
      recentRegistrations: recentRegistrations.length,
      avgRegistrationsPerEvent: events.length > 0 ? (registrations.length / events.length).toFixed(1) : 0
    });

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Error fetching dashboard stats: " + err.message });
  }
});

// User authentication endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { resources: existingUsers } = await client
      .database(dbName)
      .container("Users")
      .items.query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: normalizedEmail }]
      })
      .fetchAll();

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || null,
      createdAt: new Date().toISOString(),
      status: "active"
    };

    const { resource: createdUser } = await client
      .database(dbName)
      .container("Users")
      .items.create(user);

    // Return user without password
    const { password: _, ...userResponse } = createdUser;
    
    res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating user: " + err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const { resources: users } = await client
      .database(dbName)
      .container("Users")
      .items.query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: normalizedEmail }]
      })
      .fetchAll();

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.json({
      message: "Login successful",
      user: userResponse
    });

  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Error logging in: " + err.message });
  }
});

// Event endpoints
app.get("/api/events", async (req, res) => {
  try {
    const { resources } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c ORDER BY c.date")
      .fetchAll();
    
    console.log(`Retrieved ${resources.length} events`);
    res.json(resources);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Error fetching events: " + err.message });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const { resource } = await client
      .database(dbName)
      .container(eventsContainer)
      .item(req.params.id, req.params.id)
      .read();
    
    if (resource) {
      console.log(`Retrieved event: ${resource.name}`);
      res.json(resource);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (err) {
    console.error("Error fetching event:", err);
    if (err.code === 404) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(500).json({ error: "Error fetching event: " + err.message });
    }
  }
});

// Booking endpoints
app.post("/api/events/:eventId/book", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone } = req.body;

    console.log(`Booking request for event ${eventId}:`, { name, email, phone });

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if event exists
    const { resource: event } = await client
      .database(dbName)
      .container(eventsContainer)
      .item(eventId, eventId)
      .read();

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is upcoming
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return res.status(400).json({ error: "Cannot register for past events" });
    }

    // Check for duplicate registration
    const { resources: existingBookings } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query({
        query: "SELECT * FROM c WHERE c.eventId = @eventId AND c.userEmail = @email",
        parameters: [
          { name: "@eventId", value: eventId },
          { name: "@email", value: normalizedEmail }
        ]
      })
      .fetchAll();

    if (existingBookings.length > 0) {
      return res.status(400).json({ 
        error: "You have already registered for this event",
        existingBooking: existingBookings[0]
      });
    }

    // Create booking record
    const bookingId = generateBookingId();
    const booking = {
      id: bookingId,
      eventId: eventId,
      eventName: event.name,
      eventDate: event.date,
      eventVenue: event.venue,
      userName: normalizedName,
      userEmail: normalizedEmail,
      userPhone: phone?.trim() || null,
      bookingDate: new Date().toISOString(),
      status: "confirmed",
      registrationSource: "web",
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const { resource: createdBooking } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.create(booking);

    console.log(`Booking created successfully: ${bookingId} for ${normalizedEmail}`);

    res.status(201).json({
      message: "Event registration successful!",
      booking: {
        id: createdBooking.id,
        eventName: createdBooking.eventName,
        eventDate: createdBooking.eventDate,
        userName: createdBooking.userName,
        userEmail: createdBooking.userEmail,
        bookingDate: createdBooking.bookingDate,
        status: createdBooking.status
      }
    });

  } catch (err) {
    console.error("Error booking event:", err);
    
    if (err.code === 409) {
      res.status(409).json({ error: "A booking with this information already exists" });
    } else if (err.code === 404) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(500).json({ error: "Error processing registration: " + err.message });
    }
  }
});

app.get("/api/events/:eventId/bookings", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const { resources } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query({
        query: "SELECT * FROM c WHERE c.eventId = @eventId ORDER BY c.bookingDate DESC",
        parameters: [{ name: "@eventId", value: eventId }]
      })
      .fetchAll();

    console.log(`Retrieved ${resources.length} bookings for event ${eventId}`);
    res.json({
      eventId,
      totalBookings: resources.length,
      bookings: resources
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Error fetching bookings: " + err.message });
  }
});

app.get("/api/bookings/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    
    const { resources } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query({
        query: "SELECT * FROM c WHERE c.userEmail = @email ORDER BY c.bookingDate DESC",
        parameters: [{ name: "@email", value: email }]
      })
      .fetchAll();

    console.log(`Retrieved ${resources.length} bookings for user ${email}`);
    res.json({
      userEmail: email,
      totalBookings: resources.length,
      bookings: resources
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Error fetching user bookings: " + err.message });
  }
});

app.delete("/api/bookings/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.body;

    console.log('Backend: Canceling booking ID:', bookingId);
    console.log('Backend: User email:', email);

    if (!email) {
      return res.status(400).json({ error: "Email is required to cancel booking" });
    }

    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @bookingId AND c.userEmail = @email",
      parameters: [
        { name: "@bookingId", value: bookingId },
        { name: "@email", value: email.toLowerCase() }
      ]
    };

    const { resources: bookings } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items
      .query(querySpec)
      .fetchAll();

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];

    await client
      .database(dbName)
      .container(bookingsContainer)
      .item(bookingId, booking.eventId)
      .delete();

    console.log(`Booking cancelled successfully: ${bookingId}`);
    res.json({ message: "Booking cancelled successfully", bookingId });

  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ error: "Error cancelling booking: " + err.message });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const { resources: events } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    const { resources: bookings } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(event => event.date >= today);

    res.json({
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      totalBookings: bookings.length,
      avgBookingsPerEvent: events.length > 0 ? (bookings.length / events.length).toFixed(2) : 0
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Error fetching statistics: " + err.message });
  }
});

// Health check endpoint
app.get("/", async (req, res) => {
  try {
    const { resources: events } = await client
      .database(dbName)
      .container(eventsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    const { resources: bookings } = await client
      .database(dbName)
      .container(bookingsContainer)
      .items.query("SELECT * FROM c")
      .fetchAll();

    res.json({
      message: "College Events API is running successfully! 🎉",
      timestamp: new Date().toISOString(),
      totalEvents: events.length,
      totalBookings: bookings.length,
      features: ["Event Management", "Booking System", "AI Chatbot", "Admin Panel"],
      endpoints: [
        "GET /api/events - Get all events",
        "GET /api/events/:id - Get single event",
        "POST /api/events/:eventId/book - Register for an event",
        "GET /api/events/:eventId/bookings - Get bookings for an event",
        "GET /api/bookings/:email - Get bookings by user email",
        "DELETE /api/bookings/cancel/:bookingId - Cancel a booking",
        "POST /api/chatbot/query - Ask AI about events",
        "POST /api/admin/login - Admin login",
        "GET /api/admin/dashboard - Admin dashboard stats"
      ]
    });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ 
      error: "Database connection failed: " + err.message,
      message: "Please check your environment variables",
      requiredEnvVars: ["COSMOS_URI", "COSMOS_KEY", "COSMOS_DBNAME", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT_NAME"]
    });
  }
});

// ✅ FIXED: Error handling middleware moved to end
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ FIXED: Server start moved to end
app.listen(port, () => {
  console.log(`🚀 College Events API Server running on port ${port}`);
  console.log(`📅 Events API: http://localhost:${port}/api/events`);
  console.log(`🤖 Chatbot API: http://localhost:${port}/api/chatbot/query`);
  console.log(`👨‍💼 Admin API: http://localhost:${port}/api/admin/dashboard`);
  console.log(`📊 Health Check: http://localhost:${port}/`);
});

module.exports = app;
