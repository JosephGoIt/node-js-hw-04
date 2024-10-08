const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../../models/user');
const auth = require('../../middlewares/auth');

const router = express.Router();

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      }
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/logout', auth, async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/current', auth, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (err) {
    next(err);
  }
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});

router.patch('/subscription', auth, async (req, res, next) => {
  try {
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    req.user.subscription = req.body.subscription;
    await req.user.save();

    res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
