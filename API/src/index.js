const express = require('express');
const app = express();
const statusRoutes = require('./routes/status.routes');

app.use('/api/status', statusRoutes);

require('dotenv').config();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
