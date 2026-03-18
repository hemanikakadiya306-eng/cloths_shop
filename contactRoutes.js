const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await contact.save();
    
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;
