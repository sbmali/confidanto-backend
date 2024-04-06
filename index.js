const http = require('http');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const mysql = require('mysql');

const JWT_SECRET = 'Confidanto123';
const con = mysql.createPool({
  connectionLimit: 10, // Adjust according to your database server's capacity
  host: 'boundless.herosite.pro',
  user: 'rnconfi_wp640',
  password: 'kV]V8@S7p2',
  database: 'rnconfi_wp640',
  port: 3306
});

let logged_in_user_email;
const app = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle different routes
  const url = req.url;
  if (req.url === '/finalconfi/login') {
    handleLogin(req, res);
  } else if (req.url === '/finalconfi/signup') {
    handleRegister(req, res);
  } else if (req.url === '/finalconfi/additional-details') {
    handleAdditionalDetails(req, res);
  } else if (req.url === '/finalconfi/edit-profile') {
    handleEditProfile(req, res);
  } else if (req.url === '/finalconfi/header-data') {
    handleHeaderData(req, res);
  } else if (req.url === '/finalconfi/forgot-password') {
    handleForgotPassword(req, res);
  } else if (req.url === '/finalconfi/forecasting') {
    handleForecastData(req, res);
  } else if (req.url === '/finalconfi/check-email') {
    checkEmailExists(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

//Login Route handler
function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); 
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const { email, password } = data;

    con.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      if (result.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const user = result[0];
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        logged_in_user_email = result[0].email;
        res.end(JSON.stringify({ message: 'Login successful', user, token }));
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Invalid username or password');
      }
    });
  });
}

// Register route handler
function handleRegister(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const { userName, email, password } = data;

    // Check if the email already exists in the database
    con.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      if (result.length > 0) {
        // Email already exists, send response accordingly
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Email already exists' }));
      } else {
        // Email does not exist, proceed with registration
        const values = [
          userName,
          email,
          password,
          0, 
        ];

        con.query('INSERT INTO user (username, email, password, verify_status) VALUES (?)', [values], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          // User registered successfully, now send a confirmation email
          // The code to send confirmation email goes here...

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User registered successfully' }));
        });
      }
    });
  });
}

// Additional Details route handler
function handleAdditionalDetails(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const {email, userType, platform, region, category, subcategory, exp_budget, avg_budget, start_date, goal, marketing_platform, websiteLink} = data;

    const values = [
      email,
      userType,
      platform,
      region,
      category,
      subcategory,
      exp_budget,
      avg_budget,
      start_date,
      goal,
      marketing_platform,
      websiteLink,
      "Free Trial"
    ];

    con.query('INSERT INTO additional_details (email, usertype, business_status, region, category, sucategory, exp_budget, avg_budget, start_date, goal, marketing_platform, website, subscription) values (?)', [values], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User registered successfully' }));
    });
  });
}

function handleEditProfile(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const {userType, platform, region, category, subcategory, exp_budget, avg_budget, start_date, goal, marketing_platform, websiteLink, email} = data;

    const values = [
      userType,
      platform,
      region,
      category,
      subcategory,
      exp_budget,
      avg_budget,
      start_date,
      goal,
      marketing_platform,
      websiteLink,
      email,
      "Free Trial"
    ];

    con.query('UPDATE additional_details SET usertype = ?, business_status = ?, region = ?, category = ?, sucategory = ?, exp_budget = ?, avg_budget = ?, start_date = ?, goal = ?, marketing_platform = ?, website = ?, subscription = ? WHERE email = ?', [values], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Profile Updated Successfully' }));
    });
  });
}

//Forgot Password Route handler
function handleForgotPassword(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); 
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const { email } = data;

    con.query('SELECT * FROM register WHERE email = ?', [email], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      if (result.length > 0) {
        const token = jwt.sign({ email: email }, 'jwt_secret_key', { expiresIn: "120s" });
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sanikajadhav2901@gmail.com',
            pass: 'mnxt frbo cngp ckow',
          },
          tls: { rejectUnauthorized: false }
        });
        
        const MailGenerator = new Mailgen({
          theme: 'default',
          product: {
            name: 'Confidanto',
            link: 'https://www.confidanto.com/',
          },
        });
        
        const response = {
          body: {
            name: result[0].username,
            intro: 'Reset your password',
            action: {
              instructions: 'To reset your password click on the link below.',
              button: {
                color: 'green',
                text: 'Reset Password',
                link: `http://localhost:3000/reset_password/${email}/${token}`,
              },
            },
            outro: 'Link will be valid for only 15 minutes.',
          },
        };
        
        const mail = MailGenerator.generate(response);
        const message = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Reset your password',
          html: mail,
        };
        
        transporter.sendMail(message)
          .then(() => {
            console.log('email sent...');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email sent successfully', user: result[0] }));
          })
          .catch((error) => {
            res.end(JSON.stringify({ error }));
          });
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Invalid username or password');
      }
    });
  });
}

//Forecasting Data Route handler
function handleForecastData(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); 
  });
  req.on('end', () => {
    const data = JSON.parse(body); 
    const { category, subcategory, months } = data;

    const subcategoryPlaceholders = subcategory.map(() => '?').join(',');
    const monthsPlaceholders = months.map(() => '?').join(',');

    const sql = 'SELECT * FROM mastersheet WHERE `category` = ? AND `subcategory` IN (' + subcategoryPlaceholders + ') AND `month` IN (' + monthsPlaceholders + ')';
    const queryParams = [category, ...subcategory, ...months];
    
    con.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (result.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Data Found', forecastData: result }));
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('No data found');
      }
    });
  });
}

//Header Data Route handler
function handleHeaderData(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body); 
            const { email } = data;
            con.query('SELECT * FROM additional_details AD JOIN user R ON AD.email = R.email WHERE AD.email = ?', [email], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                    return;
                }
                if (result.length > 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Data Found', userData: result[0] }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('No data found');
                }
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request: Invalid JSON');
        }
    });
}

//Email Check Route Handler
function checkEmailExists(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const { email } = data;
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Email is required in the request body' }));
        return;
      }

      con.query('SELECT EXISTS(SELECT 1 FROM register WHERE email = ?) AS emailExists', [email], (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        const emailExists = result[0].emailExists === 1;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ emailExists }));
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Invalid JSON');
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node server running on port ${PORT}`);
});
