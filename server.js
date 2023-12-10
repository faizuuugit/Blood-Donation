const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'nodeuser',
  password: 'nodeuser@1234',
  database: 'donorlist',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err.message);
    return;
  }
  console.log('Connected to the database');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/donate.html');
});

app.get('/viewDonors', (req, res) => {
    res.sendFile(__dirname + '/view_available_donors.html');
});

app.get('/fetchDonors', (req, res) => {
    const sql = 'SELECT * FROM blood_donors';
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(result);
    });
});

app.post('/register', (req, res) => {
  const { fullName, age, bloodGroup, lastDonationDate } = req.body;
  if (age < 17 || age > 65) {
    return res.status(400).json({ error: 'Age must be between 17 and 65.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part to start of today
  const donationDate = new Date(lastDonationDate);
  donationDate.setHours(0, 0, 0, 0); // Reset time part of donation date

  if (donationDate > today) {
    return res.status(400).json({ error: 'Last donation date cannot be in the future.' });
  }

  const sql = `INSERT INTO blood_donors (FullName, Age, BloodGroup, LastDonationDate)
               VALUES (?, ?, ?, ?)`;
  const values = [fullName, age, bloodGroup, lastDonationDate];

  console.log('Received data:', fullName, age, bloodGroup, lastDonationDate);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into the database: ' + err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    //console.log('Data inserted successfully');
    setTimeout(() => {
      res.redirect('view_donars.html');
    }, 2000);    //res.status(200).json({ message: 'Data inserted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
