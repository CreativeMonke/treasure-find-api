import mongoose from 'mongoose';
import { poiDb } from "../config/databaseConfig.js"

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imgSrc: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  radius:{
    type: Number,
    default:130,
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});

export default poiDb.model('locations', LocationSchema);
