const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();   // app created FIRST

app.use(cors());         // then cors
app.use(express.json()); // then json

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ticket_booking"
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("MySQL Connected ✅");
});
console.log("THIS IS MY NEW SERVER FILE");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("THIS IS MY BUS PROJECT SERVER");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error saving user");
    } else {
      res.send("User Saved in Database ✅");
    }
  });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.send("Database Error");

    if (result.length > 0) {
      res.send("Login Successful ✅");
    } else {
      res.send("Wrong Email or Password ❌");
    }
  });
});

app.post("/addbus", (req, res) => {
  const { name, source, destination, time, seats } = req.body;

  const sql =
    "INSERT INTO buses (name,source,destination,time,seats) VALUES (?,?,?,?,?)";

  db.query(sql, [name, source, destination, time, seats], (err) => {
    if (err) {
      console.log(err);
      res.send("Error adding bus");
    } else {
      res.send("Bus Added Successfully 🚍");
    }
  });
});
app.post("/searchbus", (req, res) => {
  const { source, destination } = req.body;

const sql =
"SELECT * FROM buses WHERE LOWER(source)=LOWER(?) AND LOWER(destination)=LOWER(?)";
  db.query(sql, [source, destination], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error searching buses");
    } else {
      res.send(result);
    }
  });
});
app.post("/bookticket", (req, res) => {

  const { user_id, bus_id, seat_no, date } = req.body;

  // STEP 1 → Check seat already booked
  const checkSql =
    "SELECT * FROM bookings WHERE bus_id = ? AND seat_no = ? AND date = ?";

  db.query(checkSql, [bus_id, seat_no, date], (err, result) => {

    if (err) {
      console.log(err);
      return res.send("Error checking seat");
    }

    if (result.length > 0) {
      return res.send("Seat already booked ❌");
    }

    // STEP 2 → Book ticket
    const bookSql =
      "INSERT INTO bookings (user_id, bus_id, seat_no, date) VALUES (?, ?, ?, ?)";

    db.query(bookSql, [user_id, bus_id, seat_no, date], (err2) => {
      if (err2) {
        console.log(err2);
        res.send("Booking failed");
      } else {
        // get bus price also
db.query(
  "SELECT name, price FROM buses WHERE id = ?",
  [bus_id],
  (e, busData) => {

    if(e) return res.send("Booking done but price error");

    res.send({
      message: "Ticket Booked Successfully 🎉",
      seat: seat_no,
      date: date,
      bus: busData[0].name,
      price: busData[0].price
    });

  }
);
      }
    });

  });

});
app.post("/mytickets", (req, res) => {
  const { user_id } = req.body;

  const sql = `
    SELECT bookings.id, buses.name, buses.source, buses.destination, bookings.seat_no, bookings.date
    FROM bookings
    JOIN buses ON bookings.bus_id = buses.id
    WHERE bookings.user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error fetching tickets");
    } else {
      res.send(result);
    }
  });
});
app.post("/cancelticket", (req, res) => {
  const { booking_id } = req.body;

  const sql = "DELETE FROM bookings WHERE id = ?";

  db.query(sql, [booking_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error cancelling ticket");
    } else if (result.affectedRows === 0) {
      res.send("Booking not found ❌");
    } else {
      res.send("Ticket Cancelled Successfully 🗑️");
    }
  });
});
app.get("/mybookings/:userid", (req, res) => {

  const userId = req.params.userid;

  const sql = `
    SELECT bookings.id,
           buses.name,
           buses.source,
           buses.destination,
           buses.time,
           bookings.seat_no,
           bookings.date
    FROM bookings
    JOIN buses ON bookings.bus_id = buses.id
    WHERE bookings.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error");
    } else {
      res.send(result);
    }
  });

});
app.post("/bookedseats", (req, res) => {

  const { bus_id, date } = req.body;

  const sql =
    "SELECT seat_no FROM bookings WHERE bus_id = ? AND date = ?";

  db.query(sql, [bus_id, date], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });

});
app.get("/getbuses", (req, res) => {
  db.query("SELECT * FROM buses", (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Database Error ❌");
    }
    res.send(result);
  });
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});