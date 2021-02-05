import { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'string',
    required: true,
  },
  password: {
    type: 'string',
    required: true,
  },
  phone: {
    type: 'string',
    required: true,
  },
  age: {
    type: 'number',
    required: true,
  },
  sex: {
    type: 'number',
    required: true,
  },
  image: {
    type: 'string',
    required: true,
  },
});

export const User = 