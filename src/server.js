require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 5000;

// Sync database and then start server
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established.');
    await db.sequelize.sync(); // Use { alter: true } for dev, { force: true } to drop & recreate
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
})(); 